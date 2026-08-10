import {
  CustomerProfile,
  NutritionRules,
  NutritionTargets,
  ActivityLevel,
  CustomerGoal,
} from "../types/nutrition";

// Store default business rules in one configurable object.
export const DEFAULT_NUTRITION_RULES: NutritionRules = {
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

// Calculate the customer's Basal Metabolic Rate using the Mifflin-St Jeor equation.
export function calculateBasalMetabolicRate(
  customer: CustomerProfile,
): number {
  // Calculate the base equation from body weight, height, and age.
  const baseCalculation =
    10 * customer.weightKilograms +
    6.25 * customer.heightCentimeters -
    5 * customer.age;

  // Add the male biological-sex adjustment.
  if (customer.biologicalSex === "male") {
    return Math.round(baseCalculation + 5);
  }

  // Apply the female biological-sex adjustment.
  return Math.round(baseCalculation - 161);
}

// Calculate total daily energy expenditure from BMR and activity level.
export function calculateTotalDailyEnergyExpenditure(
  basalMetabolicRate: number,
  activityLevel: ActivityLevel,
  rules: NutritionRules,
): number {
  // Retrieve the configured activity multiplier.
  const activityMultiplier = rules.activityMultipliers[activityLevel];

  // Multiply BMR by the activity multiplier.
  return Math.round(basalMetabolicRate * activityMultiplier);
}

// Calculate the target calorie intake based on the customer's goal.
export function calculateDailyCalories(
  totalDailyEnergyExpenditure: number,
  goal: CustomerGoal,
  rules: NutritionRules,
): number {
  // Apply the configured calorie deficit for fat-loss-focused customers.
  if (goal === "fat_loss_muscle_gain") {
    const calorieTarget =
      totalDailyEnergyExpenditure *
      (1 - rules.fatLossCalorieDeficitPercentage);

    // Respect the configured minimum calorie limit.
    return Math.max(
      rules.minimumDailyCalories,
      Math.round(calorieTarget),
    );
  }

  // Apply a small controlled calorie increase for muscle development.
  const calorieTarget =
    totalDailyEnergyExpenditure *
    (1 + rules.weightGainCalorieAdjustmentPercentage);

  // Respect the configured maximum calorie limit.
  return Math.min(
    rules.maximumDailyCalories,
    Math.round(calorieTarget),
  );
}

// Calculate the daily protein target.
export function calculateDailyProtein(
  customer: CustomerProfile,
  rules: NutritionRules,
): number {
  // Select the protein multiplier based on the customer's primary goal.
  const proteinMultiplier =
    customer.goal === "fat_loss_muscle_gain"
      ? rules.proteinGramsPerKilogramForFatLoss
      : rules.proteinGramsPerKilogramForWeightGain;

  // Multiply body weight by the configured protein multiplier.
  return Math.round(customer.weightKilograms * proteinMultiplier);
}

// Calculate daily fat using a configurable percentage of calories.
export function calculateDailyFat(
  dailyCalories: number,
): number {
  // Allocate approximately 25 percent of calories to dietary fat.
  const caloriesFromFat = dailyCalories * 0.25;

  // Convert fat calories to grams using approximately nine calories per gram.
  return Math.round(caloriesFromFat / 9);
}

// Calculate carbohydrates after protein and fat requirements are allocated.
export function calculateDailyCarbohydrates(
  dailyCalories: number,
  dailyProteinGrams: number,
  dailyFatGrams: number,
): number {
  // Calculate calories contributed by protein.
  const caloriesFromProtein = dailyProteinGrams * 4;

  // Calculate calories contributed by fat.
  const caloriesFromFat = dailyFatGrams * 9;

  // Calculate calories remaining for carbohydrates.
  const remainingCalories =
    dailyCalories - caloriesFromProtein - caloriesFromFat;

  // Convert remaining calories into carbohydrate grams.
  return Math.max(0, Math.round(remainingCalories / 4));
}

// Generate the complete nutrition target for a customer.
export function calculateNutritionTargets(
  customer: CustomerProfile,
  rules: NutritionRules = DEFAULT_NUTRITION_RULES,
): NutritionTargets {
  // Calculate BMR first.
  const basalMetabolicRate =
    calculateBasalMetabolicRate(customer);

  // Calculate TDEE from BMR and activity.
  const totalDailyEnergyExpenditure =
    calculateTotalDailyEnergyExpenditure(
      basalMetabolicRate,
      customer.activityLevel,
      rules,
    );

  // Calculate the customer's calorie target.
  const dailyCalories =
    calculateDailyCalories(
      totalDailyEnergyExpenditure,
      customer.goal,
      rules,
    );

  // Calculate the customer's protein target.
  const dailyProteinGrams =
    calculateDailyProtein(customer, rules);

  // Calculate the daily fat target.
  const dailyFatGrams =
    calculateDailyFat(dailyCalories);

  // Calculate carbohydrates from remaining calories.
  const dailyCarbohydrateGrams =
    calculateDailyCarbohydrates(
      dailyCalories,
      dailyProteinGrams,
      dailyFatGrams,
    );

  // Return the complete nutrition target.
  return {
    basalMetabolicRate,
    totalDailyEnergyExpenditure,
    dailyCalories,
    dailyProteinGrams,
    dailyCarbohydrateGrams,
    dailyFatGrams,
  };
}
