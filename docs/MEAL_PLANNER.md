# Automatic Meal Planner Documentation

## Overview

The meal planner automatically generates a complete daily nutrition plan by:
1. Calculating the customer's nutrition targets
2. Distributing calories across meals
3. Selecting the best menu items for each meal
4. Always including the mandatory Smoothie + Whey
5. Returning a complete, ready-to-follow daily plan

## Algorithm

### Meal Distribution

Daily calories are allocated as:
- **Breakfast:** 22%
- **Lunch:** 27%
- **Smoothie + Whey:** 15% (mandatory)
- **Dinner:** 26%
- **Recovery:** 10%

### Meal Selection Process

#### 1. Calculate Meal Budget

For each meal, calculate target calories and protein:

```typescript
breakfastCalories = targetCalories × 0.22
breakfastProtein = targetProteinGrams × 0.20
```

#### 2. Find Best MenuItem

Score each available menu item using combined difference:

```typescript
score = |menuItem.calories - targetCalories| + 
        |menuItem.protein - targetProtein| × 5
```

Protein is weighted 5× to prioritize hitting protein targets.

#### 3. Select Best Smoothie

Select the smoothie closest to remaining calorie and protein budget.

#### 4. Inject Mandatory Whey

Always add 1 scoop whey protein (~100 kcal, ~23g protein) to the smoothie.

## Demo Daily Plan

**Customer:** Anh (30M, 175cm, 78kg, Fat Loss Goal, 4 training days/week)

**Daily Target:** ~2,050 kcal, ~145g protein

```
07:30 - BREAKFAST
Bibimbap Hàn Quốc — Chicken
450 kcal | 28g protein

12:30 - LUNCH
Miến Trộn Hàn Quốc — Beef
430 kcal | 31g protein

16:00 - MANDATORY SMOOTHIE + WHEY
BUTTERBANA + 1 Scoop Whey
330 kcal | 30g protein

19:00 - DINNER
Bibimbap Hàn Quốc — Seafood
430 kcal | 27g protein

─────────────────────────────
TOTAL: 1,640 kcal | 116g protein
```

## Key Features

✅ **Fully Automatic** — No manual selection required
✅ **Mandatory Smoothie + Whey** — Always included as business rule
✅ **Nutritionally Aligned** — Meals selected to hit targets
✅ **Scalable** — Works with any BRO.TEIN menu
✅ **Configurable** — Meal distribution percentages can be adjusted

## Auto-Swap Feature (Future)

If customer dislikes a suggested meal:

```typescript
autoSwapMeal(currentMeal, targetCalories, targetProtein)
```

Returns the next-best alternative based on:
- Calorie similarity
- Protein similarity
- Meal category
- Customer preferences
- Allergy restrictions
- Availability

## Testing

Run the demo:

```bash
ts-node shared/services/mealPlanner.test.ts
```

Expected output:
- Nutrition targets for Anh
- Complete daily meal plan
- Confirmation of mandatory Smoothie + Whey
