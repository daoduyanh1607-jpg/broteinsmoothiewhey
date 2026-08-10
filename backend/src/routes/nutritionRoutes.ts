import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import {
  calculateNutritionTargets,
  CustomerProfile,
} from "../services/nutritionService";
import { generateDailyPlan } from "../services/mealPlannerService";

const router = Router();
const prisma = new PrismaClient();

// Generate nutrition targets and daily meal plan
router.post(
  "/generate",
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const customer = await prisma.customer.findUnique({
        where: { id: req.customerId },
      });

      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }

      const customerProfile: CustomerProfile = {
        id: customer.id,
        name: customer.name,
        age: customer.age,
        biologicalSex: customer.biologicalSex,
        heightCentimeters: customer.heightCentimeters,
        weightKilograms: customer.weightKilograms,
        bodyFatPercentage: customer.bodyFatPercentage || undefined,
        muscleMassKilograms: customer.muscleMassKilograms || undefined,
        activityLevel: customer.activityLevel,
        trainingDaysPerWeek: customer.trainingDaysPerWeek,
        goal: customer.goal,
      };

      const nutritionTargets = calculateNutritionTargets(customerProfile);

      // Save nutrition plan to database
      const nutritionPlan = await prisma.nutritionPlan.create({
        data: {
          customerId: customer.id,
          basalMetabolicRate: nutritionTargets.basalMetabolicRate,
          totalDailyEnergyExpenditure:
            nutritionTargets.totalDailyEnergyExpenditure,
          dailyCalories: nutritionTargets.dailyCalories,
          dailyProteinGrams: nutritionTargets.dailyProteinGrams,
          dailyCarbohydrateGrams: nutritionTargets.dailyCarbohydrateGrams,
          dailyFatGrams: nutritionTargets.dailyFatGrams,
        },
      });

      // Generate meal plan
      const dailyPlan = await generateDailyPlan(
        customerProfile,
        nutritionTargets
      );

      // Save meal plan to database
      const mealPlan = await prisma.mealPlan.create({
        data: {
          customerId: customer.id,
          nutritionPlanId: nutritionPlan.id,
          targetCalories: dailyPlan.targetCalories,
          targetProteinGrams: dailyPlan.targetProteinGrams,
          totalCalories: dailyPlan.totalCalories,
          totalProteinGrams: dailyPlan.totalProteinGrams,
          meals: {
            create: dailyPlan.meals.map((meal: any) => ({
              time: meal.time,
              type: meal.type,
              menuItemId: meal.menuItemId,
              smoothieId: meal.smoothieId,
              wheyProductId: meal.wheyProductId,
              calories: meal.calories,
              proteinGrams: meal.proteinGrams,
            })),
          },
        },
        include: { meals: true },
      });

      res.status(201).json({
        nutritionTargets,
        mealPlan,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to generate nutrition plan" });
    }
  }
);

// Get today's nutrition plan
router.get(
  "/today",
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const mealPlan = await prisma.mealPlan.findFirst({
        where: {
          customerId: req.customerId,
          date: {
            gte: today,
            lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
          },
        },
        include: {
          meals: {
            include: {
              menuItem: true,
              smoothie: true,
              wheyProduct: true,
            },
          },
          nutritionPlan: true,
        },
      });

      if (!mealPlan) {
        return res
          .status(404)
          .json({ error: "No meal plan for today" });
      }

      res.json(mealPlan);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch meal plan" });
    }
  }
);

export default router;
