# Nutrition Engine Documentation

## Overview

The nutrition engine calculates personalized daily nutrition targets for each customer based on their physical profile, activity level, and fitness goal.

## Core Calculations

### 1. Basal Metabolic Rate (BMR)

Using the **Mifflin-St Jeor equation**:

**For males:**
```
BMR = (10 × weight_kg) + (6.25 × height_cm) - (5 × age) + 5
```

**For females:**
```
BMR = (10 × weight_kg) + (6.25 × height_cm) - (5 × age) - 161
```

### 2. Total Daily Energy Expenditure (TDEE)

```
TDEE = BMR × Activity Multiplier
```

**Activity Multipliers:**
- Sedentary: 1.2
- Lightly active: 1.375
- Moderately active: 1.55
- Very active: 1.725
- Extremely active: 1.9

### 3. Daily Calorie Target

**For Fat Loss + Muscle Gain:**
```
Daily Calories = TDEE × (1 - 0.15)
```
15% calorie deficit

**For Weight Gain + Muscle Gain:**
```
Daily Calories = TDEE × (1 + 0.05)
```
5% calorie surplus

### 4. Daily Protein Target

**For Fat Loss + Muscle Gain:**
```
Daily Protein = Body Weight (kg) × 1.8 g/kg
```

**For Weight Gain + Muscle Gain:**
```
Daily Protein = Body Weight (kg) × 2.0 g/kg
```

### 5. Daily Fat Target

```
Daily Fat = (Daily Calories × 0.25) / 9 g/cal
```
25% of calories allocated to dietary fat

### 6. Daily Carbohydrate Target

```
Daily Carbs = (Daily Calories - Protein Calories - Fat Calories) / 4 g/cal
```

## Demo Customer Example

**Profile:**
- Name: Anh
- Age: 30
- Biological Sex: Male
- Height: 175 cm
- Weight: 78 kg
- Body Fat: 21.5%
- Muscle Mass: 58.4 kg
- Activity Level: Moderately Active
- Training Days/Week: 4
- Goal: Fat Loss + Muscle Gain

**Calculated Targets:**
- BMR: ~1,720 kcal
- TDEE: ~2,666 kcal
- Daily Calories: ~2,266 kcal (15% deficit)
- Daily Protein: ~140 g
- Daily Fat: ~63 g
- Daily Carbs: ~302 g

## Configurable Rules

All calculation parameters are stored in `NutritionRules` and can be modified by administrators:

- Activity multipliers
- Calorie deficit percentage
- Calorie surplus percentage
- Protein multiplier (fat loss)
- Protein multiplier (muscle gain)
- Minimum daily calories
- Maximum daily calories

## Important Notes

⚠️ **These are estimates, not medical prescriptions.** The system calculates starting-point nutrition targets based on standard formulas. Customers should consult with nutritionists or medical professionals before making significant changes to their diet.
