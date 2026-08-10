import { PrismaClient } from "@prisma/client";
import { CustomerProfile, NutritionTargets } from "./nutritionService";

const prisma = new PrismaClient();

const MEAL_DISTRIBUTION = {
  breakfast: 0.22,
  lunch: 0.27,
  smoothie_whey: 0.15,
  dinner: 0.26,
  recovery: 0.1,
};

const DEFAULT_WHEY = {
  id: "whey-one-scoop",
  name: "Whey Protein — 1 Scoop",
  calories: 100,
  proteinGrams: 23,
  carbohydrateGrams: 3,
  fatGrams: 1,
};

async function findBestMenuItem(
  mealType: "breakfast" | "lunch" | "dinner",
  targetCalories: number,
  targetProteinGrams: number
) {
  const candidates = await prisma.menuItem.findMany({
    where: {
      available: true,
      suitableMealTimes: {
        has: mealType,
      },
    },
  });

  if (candidates.length === 0) return undefined;

  const rankedCandidates = candidates
    .map((menuItem) => {
      const calorieDifference = Math.abs(
        menuItem.calories - targetCalories
      );
      const proteinDifference = Math.abs(
        menuItem.proteinGrams - targetProteinGrams
      );
      const score = calorieDifference + proteinDifference * 5;
      return { menuItem, score };
    })
    .sort((first, second) => first.score - second.score);

  return rankedCandidates[0].menuItem;
}

async function findBestSmoothie(
  remainingCalories: number,
  remainingProteinGrams: number
) {
  const availableSmoothies = await prisma.smoothie.findMany({
    where: { available: true },
  });

  const rankedSmoothies = availableSmoothies
    .map((smoothie) => {
      const calorieDifference = Math.abs(
        smoothie.calories - remainingCalories
      );
      const proteinDifference = Math.abs(
        smoothie.proteinGrams - remainingProteinGrams
      );
      const score = calorieDifference + proteinDifference * 5;
      return { smoothie, score };
    })
    .sort((first, second) => first.score - second.score);

  return rankedSmoothies[0].smoothie;
}

export async function generateDailyPlan(
  customer: CustomerProfile,
  nutritionTargets: NutritionTargets
) {
  const targetCalories = nutritionTargets.dailyCalories;
  const targetProteinGrams = nutritionTargets.dailyProteinGrams;

  // Calculate meal budgets
  const breakfastCalories = targetCalories * MEAL_DISTRIBUTION.breakfast;
  const breakfastProtein = targetProteinGrams * 0.2;
  const lunchCalories = targetCalories * MEAL_DISTRIBUTION.lunch;
  const lunchProtein = targetProteinGrams * 0.25;
  const smoothieBudget = targetCalories * MEAL_DISTRIBUTION.smoothie_whey;
  const smoothieProteinBudget = targetProteinGrams * 0.2;
  const dinnerCalories = targetCalories * MEAL_DISTRIBUTION.dinner;
  const dinnerProtein = targetProteinGrams * 0.25;

  // Select meals
  const breakfast = await findBestMenuItem(
    "breakfast",
    breakfastCalories,
    breakfastProtein
  );
  const lunch = await findBestMenuItem(
    "lunch",
    lunchCalories,
    lunchProtein
  );
  const smoothie = await findBestSmoothie(
    smoothieBudget,
    smoothieProteinBudget
  );
  const dinner = await findBestMenuItem(
    "dinner",
    dinnerCalories,
    dinnerProtein
  );

  const meals = [];

  if (breakfast) {
    meals.push({
      time: "07:30",
      type: "breakfast",
      menuItemId: breakfast.id,
      smoothieId: null,
      wheyProductId: null,
      calories: breakfast.calories,
      proteinGrams: breakfast.proteinGrams,
    });
  }

  if (lunch) {
    meals.push({
      time: "12:30",
      type: "lunch",
      menuItemId: lunch.id,
      smoothieId: null,
      wheyProductId: null,
      calories: lunch.calories,
      proteinGrams: lunch.proteinGrams,
    });
  }

  if (smoothie) {
    // Get default whey product
    const wheyProduct = await prisma.wheyProduct.findFirst({
      where: { scoops: 1 },
    });

    meals.push({
      time: "16:00",
      type: "smoothie_whey",
      menuItemId: null,
      smoothieId: smoothie.id,
      wheyProductId: wheyProduct?.id || null,
      calories: smoothie.calories + (wheyProduct?.calories || DEFAULT_WHEY.calories),
      proteinGrams:
        smoothie.proteinGrams +
        (wheyProduct?.proteinGrams || DEFAULT_WHEY.proteinGrams),
    });
  }

  if (dinner) {
    meals.push({
      time: "19:00",
      type: "dinner",
      menuItemId: dinner.id,
      smoothieId: null,
      wheyProductId: null,
      calories: dinner.calories,
      proteinGrams: dinner.proteinGrams,
    });
  }

  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
  const totalProteinGrams = meals.reduce(
    (sum, meal) => sum + meal.proteinGrams,
    0
  );

  return {
    customerId: customer.id,
    targetCalories,
    targetProteinGrams,
    totalCalories,
    totalProteinGrams,
    meals,
  };
}
