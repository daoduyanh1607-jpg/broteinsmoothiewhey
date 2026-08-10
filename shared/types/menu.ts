// Define all supported meal categories.
export type MealCategory =
  | "breakfast"
  | "lunch"
  | "dinner"
  | "snack";

// Define supported protein sources.
export type ProteinSource =
  | "chicken"
  | "beef"
  | "pork"
  | "seafood"
  | "vegetable";

// Define the nutritional values of one serving.
export interface NutritionInformation {
  calories: number;
  proteinGrams: number;
  carbohydrateGrams: number;
  fatGrams: number;
}

// Define one BRO.TEIN menu item.
export interface BroteinMenuItem {
  id: string;
  name: string;
  category: MealCategory;
  proteinSource: ProteinSource;
  servingSizeGrams: number;
  nutrition: NutritionInformation;
  price: number;
  currency: string;
  imageUrl: string;
  ingredients: string[];
  allergens: string[];
  available: boolean;
  suitableForFatLoss: boolean;
  suitableForMuscleGain: boolean;
  suitableMealTimes: MealCategory[];
}

// Define a smoothie product.
export interface Smoothie {
  id: string;
  name: string;
  servingSizeMilliliters: number;
  calories: number;
  proteinGrams: number;
  carbohydrateGrams: number;
  fatGrams: number;
  price: number;
  imageUrl: string;
  available: boolean;
}

// Define a whey protein product.
export interface WheyProduct {
  id: string;
  name: string;
  scoops: number;
  calories: number;
  proteinGrams: number;
  carbohydrateGrams: number;
  fatGrams: number;
  price: number;
}
