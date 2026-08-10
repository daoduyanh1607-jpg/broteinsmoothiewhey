// Define the biological sex options supported by the nutrition calculator.
export type BiologicalSex = "male" | "female";

// Define the customer's two primary business goals.
export type CustomerGoal =
  | "fat_loss_muscle_gain"
  | "weight_gain_muscle_gain";

// Define the customer's daily activity levels.
export type ActivityLevel =
  | "sedentary"
  | "lightly_active"
  | "moderately_active"
  | "very_active"
  | "extremely_active";

// Define the customer's core physical information.
export interface CustomerProfile {
  id: string;
  name: string;
  age: number;
  biologicalSex: BiologicalSex;
  heightCentimeters: number;
  weightKilograms: number;
  bodyFatPercentage?: number;
  muscleMassKilograms?: number;
  activityLevel: ActivityLevel;
  trainingDaysPerWeek: number;
  goal: CustomerGoal;
}

// Define configurable nutrition rules so business administrators can change them later.
export interface NutritionRules {
  activityMultipliers: Record<ActivityLevel, number>;
  fatLossCalorieDeficitPercentage: number;
  weightGainCalorieAdjustmentPercentage: number;
  proteinGramsPerKilogramForFatLoss: number;
  proteinGramsPerKilogramForWeightGain: number;
  minimumDailyCalories: number;
  maximumDailyCalories: number;
}

// Define the nutrition targets generated for one customer.
export interface NutritionTargets {
  basalMetabolicRate: number;
  totalDailyEnergyExpenditure: number;
  dailyCalories: number;
  dailyProteinGrams: number;
  dailyCarbohydrateGrams: number;
  dailyFatGrams: number;
}
