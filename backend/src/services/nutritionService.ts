import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface CustomerProfile {
  id: string;
  name: string;
  age: number;
  biologicalSex: string;
  heightCentimeters: number;
  weightKilograms: number;
  bodyFatPercentage?: number;
  muscleMassKilograms?: number;
  activityLevel: string;
  trainingDaysPerWeek: number;
  goal: string;
}

export interface NutritionTargets {
  basalMetabolicRate: number;
  totalDailyEnergyExpenditure: number;
  dailyCalories: number;
  dailyProteinGrams: number;
  dailyCarbohydrateGrams: number;
  dailyFatGrams: number;
}

const DEFAULT_NUTRITION_RULES = {
  activityMultipliers: {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    extremely_active: 1.9,
  },
  fatLossCalorieDeficitPercentage: 0.15,
  weightGainCalorieAdjustmentPercentage: 0.05,
  proteinGramsPerKilogramForFatLoss: 1.8,
  proteinGramsPerKilogramForWeightGain: 2.0,
  minimumDailyCalories: 1200,
  maximumDailyCalories: 4000,
};

function calculateBasalMetabolicRate(customer: CustomerProfile): number {
  const baseCalculation =
    10 * customer.weightKilograms +
    6.25 * customer.heightCentimeters -
    5 * customer.age;

  if (customer.biologicalSex === "male") {
    return Math.round(baseCalculation + 5);
  }
  return Math.round(baseCalculation - 161);
}

function calculateTotalDailyEnergyExpenditure(
  basalMetabolicRate: number,
  activityLevel: string
): number {
  const activityMultiplier =
    DEFAULT_NUTRITION_RULES.activityMultipliers[activityLevel as keyof typeof DEFAULT_NUTRITION_RULES.activityMultipliers];
  return Math.round(basalMetabolicRate * activityMultiplier);
}

function calculateDailyCalories(
  totalDailyEnergyExpenditure: number,
  goal: string
): number {
  if (goal === "fat_loss_muscle_gain") {
    const calorieTarget =
      totalDailyEnergyExpenditure *
      (1 - DEFAULT_NUTRITION_RULES.fatLossCalorieDeficitPercentage);
    return Math.max(
      DEFAULT_NUTRITION_RULES.minimumDailyCalories,
      Math.round(calorieTarget)
    );
  }

  const calorieTarget =
    totalDailyEnergyExpenditure *
    (1 + DEFAULT_NUTRITION_RULES.weightGainCalorieAdjustmentPercentage);
  return Math.min(
    DEFAULT_NUTRITION_RULES.maximumDailyCalories,
    Math.round(calorieTarget)
  );
}

function calculateDailyProtein(customer: CustomerProfile): number {
  const proteinMultiplier =
    customer.goal === "fat_loss_muscle_gain"
      ? DEFAULT_NUTRITION_RULES.proteinGramsPerKilogramForFatLoss
      : DEFAULT_NUTRITION_RULES.proteinGramsPerKilogramForWeightGain;
  return Math.round(customer.weightKilograms * proteinMultiplier);
}

function calculateDailyFat(dailyCalories: number): number {
  const caloriesFromFat = dailyCalories * 0.25;
  return Math.round(caloriesFromFat / 9);
}

function calculateDailyCarbohydrates(
  dailyCalories: number,
  dailyProteinGrams: number,
  dailyFatGrams: number
): number {
  const caloriesFromProtein = dailyProteinGrams * 4;
  const caloriesFromFat = dailyFatGrams * 9;
  const remainingCalories =
    dailyCalories - caloriesFromProtein - caloriesFromFat;
  return Math.max(0, Math.round(remainingCalories / 4));
}

export function calculateNutritionTargets(
  customer: CustomerProfile
): NutritionTargets {
  const basalMetabolicRate = calculateBasalMetabolicRate(customer);
  const totalDailyEnergyExpenditure = calculateTotalDailyEnergyExpenditure(
    basalMetabolicRate,
    customer.activityLevel
  );
  const dailyCalories = calculateDailyCalories(
    totalDailyEnergyExpenditure,
    customer.goal
  );
  const dailyProteinGrams = calculateDailyProtein(customer);
  const dailyFatGrams = calculateDailyFat(dailyCalories);
  const dailyCarbohydrateGrams = calculateDailyCarbohydrates(
    dailyCalories,
    dailyProteinGrams,
    dailyFatGrams
  );

  return {
    basalMetabolicRate,
    totalDailyEnergyExpenditure,
    dailyCalories,
    dailyProteinGrams,
    dailyCarbohydrateGrams,
    dailyFatGrams,
  };
}
