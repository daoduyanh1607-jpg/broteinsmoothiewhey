import { BroteinMenuItem, Smoothie } from "./menu";

// Define the structure of one automatically generated meal.
export interface PlannedMeal {
  id: string;
  time: string;
  type: "breakfast" | "lunch" | "smoothie_whey" | "dinner" | "recovery";
  menuItem?: BroteinMenuItem;
  smoothie?: Smoothie;
  wheyGrams: number;
  calories: number;
  proteinGrams: number;
}

// Define the complete automatic daily nutrition plan.
export interface DailyMealPlan {
  customerId: string;
  targetCalories: number;
  targetProteinGrams: number;
  totalCalories: number;
  totalProteinGrams: number;
  meals: PlannedMeal[];
}
