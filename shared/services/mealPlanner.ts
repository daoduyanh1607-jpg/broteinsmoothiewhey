import {
  CustomerProfile,
  NutritionTargets,
} from "../types/nutrition";
import { BROTEIN_MENU, BroteinMenuItem } from "../data/broteinMenu";
import { SMOOTHIES, Smoothie } from "../data/smoothies";
import { DEFAULT_WHEY } from "../data/whey";
import { PlannedMeal, DailyMealPlan } from "../types/mealPlan";

// Define the default meal calorie distribution.
const MEAL_DISTRIBUTION = {
  breakfast: 0.22,
  lunch: 0.27,
  smoothie_whey: 0.15,
  dinner: 0.26,
  recovery: 0.1,
};

// Find the menu item closest to a desired calorie and protein target.
function findBestMenuItem(
  mealType: "breakfast" | "lunch" | "dinner",
  targetCalories: number,
  targetProteinGrams: number,
): BroteinMenuItem | undefined {
  // Filter to available meals that are appropriate for the requested meal period.
  const candidates = BROTEIN_MENU.filter(
    (menuItem) =>
      menuItem.available &&
      menuItem.suitableMealTimes.includes(mealType),
  );

  // Return no result when no suitable menu item exists.
  if (candidates.length === 0) {
    return undefined;
  }

  // Rank every candidate according to calorie and protein distance.
  const rankedCandidates = candidates
    .map((menuItem) => {
      // Calculate the calorie difference.
      const calorieDifference = Math.abs(
        menuItem.nutrition.calories - targetCalories,
      );

      // Calculate the protein difference.
      const proteinDifference = Math.abs(
        menuItem.nutrition.proteinGrams - targetProteinGrams,
      );

      // Combine both differences into one score.
      const score = calorieDifference + proteinDifference * 5;

      // Return the candidate together with its score.
      return {
        menuItem,
        score,
      };
    })
    .sort((first, second) => first.score - second.score);

  // Return the highest-ranked menu item.
  return rankedCandidates[0].menuItem;
}

// Select the smoothie that best fits the customer's remaining nutrition budget.
function findBestSmoothie(
  remainingCalories: number,
  remainingProteinGrams: number,
): Smoothie {
  // Filter to currently available smoothies.
  const availableSmoothies = SMOOTHIES.filter(
    (smoothie) => smoothie.available,
  );

  // Rank smoothies according to calorie and protein compatibility.
  const rankedSmoothies = availableSmoothies
    .map((smoothie) => {
      // Calculate calorie distance.
      const calorieDifference = Math.abs(
        smoothie.calories - remainingCalories,
      );

      // Calculate protein distance.
      const proteinDifference = Math.abs(
        smoothie.proteinGrams - remainingProteinGrams,
      );

      // Weight protein more strongly because protein is a core business target.
      const score = calorieDifference + proteinDifference * 5;

      // Return the smoothie and calculated score.
      return {
        smoothie,
        score,
      };
    })
    .sort((first, second) => first.score - second.score);

  // Return the best available smoothie.
  return rankedSmoothies[0].smoothie;
}

// Build the customer's complete automatic daily meal plan.
export function generateDailyPlan(
  customer: CustomerProfile,
  nutritionTargets: NutritionTargets,
): DailyMealPlan {
  // Store the calorie target for easier access.
  const targetCalories = nutritionTargets.dailyCalories;

  // Store the protein target for easier access.
  const targetProteinGrams = nutritionTargets.dailyProteinGrams;

  // Calculate the target calories for breakfast.
  const breakfastCalories =
    targetCalories * MEAL_DISTRIBUTION.breakfast;

  // Calculate the target protein for breakfast.
  const breakfastProtein = targetProteinGrams * 0.2;

  // Automatically select breakfast.
  const breakfast = findBestMenuItem(
    "breakfast",
    breakfastCalories,
    breakfastProtein,
  );

  // Calculate lunch targets.
  const lunchCalories =
    targetCalories * MEAL_DISTRIBUTION.lunch;

  // Calculate lunch protein target.
  const lunchProtein = targetProteinGrams * 0.25;

  // Automatically select lunch.
  const lunch = findBestMenuItem(
    "lunch",
    lunchCalories,
    lunchProtein,
  );

  // Reserve calories for the mandatory Smoothie + Whey.
  const smoothieBudget =
    targetCalories * MEAL_DISTRIBUTION.smoothie_whey;

  // Reserve protein for the mandatory Smoothie + Whey.
  const smoothieProteinBudget = targetProteinGrams * 0.2;

  // Select the smoothie automatically.
  const smoothie = findBestSmoothie(
    smoothieBudget,
    smoothieProteinBudget,
  );

  // Calculate the complete Smoothie + Whey nutrition.
  const smoothieCalories =
    smoothie.calories + DEFAULT_WHEY.calories;

  // Calculate the complete Smoothie + Whey protein.
  const smoothieProtein =
    smoothie.proteinGrams + DEFAULT_WHEY.proteinGrams;

  // Calculate dinner targets.
  const dinnerCalories =
    targetCalories * MEAL_DISTRIBUTION.dinner;

  // Calculate dinner protein target.
  const dinnerProtein = targetProteinGrams * 0.25;

  // Automatically select dinner.
  const dinner = findBestMenuItem(
    "dinner",
    dinnerCalories,
    dinnerProtein,
  );

  // Create the initial meal list.
  const meals: PlannedMeal[] = [];

  // Add breakfast if a valid menu item was found.
  if (breakfast) {
    meals.push({
      id: "daily-breakfast",
      time: "07:30",
      type: "breakfast",
      menuItem: breakfast,
      wheyGrams: 0,
      calories: breakfast.nutrition.calories,
      proteinGrams: breakfast.nutrition.proteinGrams,
    });
  }

  // Add lunch if a valid menu item was found.
  if (lunch) {
    meals.push({
      id: "daily-lunch",
      time: "12:30",
      type: "lunch",
      menuItem: lunch,
      wheyGrams: 0,
      calories: lunch.nutrition.calories,
      proteinGrams: lunch.nutrition.proteinGrams,
    });
  }

  // Always add the mandatory Smoothie + Whey.
  meals.push({
    id: "mandatory-smoothie-whey",
    time: "16:00",
    type: "smoothie_whey",
    smoothie,
    wheyGrams: 30,
    calories: smoothieCalories,
    proteinGrams: smoothieProtein,
  });

  // Add dinner if a valid menu item was found.
  if (dinner) {
    meals.push({
      id: "daily-dinner",
      time: "19:00",
      type: "dinner",
      menuItem: dinner,
      wheyGrams: 0,
      calories: dinner.nutrition.calories,
      proteinGrams: dinner.nutrition.proteinGrams,
    });
  }

  // Calculate total planned calories.
  const totalCalories = meals.reduce(
    (total, meal) => total + meal.calories,
    0,
  );

  // Calculate total planned protein.
  const totalProteinGrams = meals.reduce(
    (total, meal) => total + meal.proteinGrams,
    0,
  );

  // Return the completed daily plan.
  return {
    customerId: customer.id,
    targetCalories,
    targetProteinGrams,
    totalCalories,
    totalProteinGrams,
    meals,
  };
}
