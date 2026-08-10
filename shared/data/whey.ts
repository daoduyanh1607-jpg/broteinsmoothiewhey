import { WheyProduct } from "../types/menu";

// Define the mandatory whey protein product.
export const DEFAULT_WHEY: WheyProduct = {
  id: "whey-one-scoop",
  name: "Whey Protein — 1 Scoop",
  scoops: 1,
  calories: 100,
  proteinGrams: 23,
  carbohydrateGrams: 3,
  fatGrams: 1,
  price: 0,
};

// Define all available whey protein products.
export const WHEY_PRODUCTS: WheyProduct[] = [
  {
    id: "whey-half-scoop",
    name: "Whey Protein — ½ Scoop",
    scoops: 0.5,
    calories: 50,
    proteinGrams: 11.5,
    carbohydrateGrams: 1.5,
    fatGrams: 0.5,
    price: 0,
  },
  DEFAULT_WHEY,
  {
    id: "whey-two-scoops",
    name: "Whey Protein — 2 Scoops",
    scoops: 2,
    calories: 200,
    proteinGrams: 46,
    carbohydrateGrams: 6,
    fatGrams: 2,
    price: 0,
  },
];
