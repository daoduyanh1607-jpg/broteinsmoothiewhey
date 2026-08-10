# BRO.TEIN Menu Structure Documentation

## Menu Item Model

Every menu item contains the following fields:

```typescript
interface BroteinMenuItem {
  id: string;                          // Unique identifier
  name: string;                        // Display name
  category: MealCategory;              // breakfast | lunch | dinner | snack
  proteinSource: ProteinSource;        // chicken | beef | pork | seafood | vegetable
  servingSizeGrams: number;            // Weight per serving (e.g., 450g)
  nutrition: NutritionInformation;     // Calorie & macro breakdown
  price: number;                       // Price (VND)
  currency: string;                    // Currency code (VND)
  imageUrl: string;                    // Path to product image
  ingredients: string[];               // List of ingredients
  allergens: string[];                 // List of allergens
  available: boolean;                  // Currently available for order
  suitableForFatLoss: boolean;         // Recommended for fat loss goal
  suitableForMuscleGain: boolean;      // Recommended for muscle gain goal
  suitableMealTimes: MealCategory[];   // Meal times this item fits (breakfast, lunch, dinner)
}
```

## Current Menu Items

### 1. Miến Trộn Hàn Quốc (Korean Glass Noodle Salad)

**Variants:**
- **Chicken:** 420 kcal | 30g protein | 48g carbs | 10g fat
- **Beef:** 430 kcal | 31g protein | 46g carbs | 12g fat

**Properties:**
- Serving: 450g
- Allergens: Soy
- Suitable Times: Lunch, Dinner
- Goals: Fat Loss ✓ | Muscle Gain ✓

### 2. Bibimbap Hàn Quốc (Korean Mixed Rice Bowl)

**Variants:**
- **Chicken:** 450 kcal | 28g protein | 55g carbs | 10g fat
- **Beef:** 470 kcal | 32g protein | 54g carbs | 13g fat
- **Pork:** 460 kcal | 30g protein | 54g carbs | 12g fat
- **Seafood:** 430 kcal | 27g protein | 52g carbs | 9g fat

**Properties:**
- Serving: 450g
- Allergens: Soy, Sesame
- Suitable Times: Breakfast, Lunch, Dinner
- Goals: Fat Loss ✓ | Muscle Gain ✓

### 3. Gỏi Cuốn Ngũ Sắc (Vietnamese Spring Rolls)

**Variant:**
- **Vegetable:** 250 kcal | 8g protein | 38g carbs | 6g fat

**Properties:**
- Serving: 250g
- Allergens: Peanuts
- Suitable Times: Snack, Dinner
- Goals: Fat Loss ✓ | Muscle Gain ✗

### 4. Kimpap (Korean Seaweed Rice Roll)

**Variant:**
- **Chicken:** 390 kcal | 25g protein | 50g carbs | 9g fat

**Properties:**
- Serving: 350g
- Allergens: Soy, Sesame
- Suitable Times: Breakfast, Lunch, Dinner
- Goals: Fat Loss ✓ | Muscle Gain ✓

## Smoothie Products

Every smoothie is 500ml and contains:

| Name | Calories | Protein | Carbs | Fat |
|------|----------|---------|-------|-----|
| BANACOCO | 210 | 4g | 30g | 8g |
| BUTTERBANA | 230 | 7g | 28g | 10g |
| BANACHOCO | 220 | 6g | 32g | 8g |
| MELONKIWI | 190 | 4g | 34g | 4g |
| COCOMANGO | 200 | 3g | 36g | 5g |

## Whey Protein Products

| Name | Scoops | Calories | Protein | Carbs | Fat |
|------|--------|----------|---------|-------|-----|
| Half Scoop | 0.5 | 50 | 11.5g | 1.5g | 0.5g |
| **One Scoop (Default)** | 1 | 100 | 23g | 3g | 1g |
| Two Scoops | 2 | 200 | 46g | 6g | 2g |

## Adding New Menu Items

### Backend (Admin Panel)

1. Fill in all required fields
2. Upload product image
3. Set nutritional information
4. Define allergens
5. Select suitable meal times and goals
6. Publish

### Format

```typescript
const newItem: BroteinMenuItem = {
  id: "unique-id",
  name: "Product Name",
  category: "lunch",
  proteinSource: "chicken",
  servingSizeGrams: 450,
  nutrition: {
    calories: 420,
    proteinGrams: 30,
    carbohydrateGrams: 48,
    fatGrams: 10,
  },
  price: 0,
  currency: "VND",
  imageUrl: "/images/menu/product-name.jpg",
  ingredients: ["Ingredient 1", "Ingredient 2"],
  allergens: ["Allergen 1"],
  available: true,
  suitableForFatLoss: true,
  suitableForMuscleGain: true,
  suitableMealTimes: ["lunch", "dinner"],
};
```

## Image Standards

- **Format:** JPG/PNG
- **Resolution:** 800×600px minimum
- **Location:** `/public/images/menu/`
- **Style:** Premium restaurant photography, 45° angle, neutral background
