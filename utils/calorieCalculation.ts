import { UserProfile, CalorieGoals } from '../types/profile';

/**
 * Calculate Basal Metabolic Rate (BMR) using Mifflin-St Jeor Equation
 * 
 * For Men: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age) + 5
 * For Women: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age) - 161
 */
export function calculateBMR(profile: UserProfile): number {
  const { age, height, weight, gender } = profile;
  
  // Mifflin-St Jeor Equation
  // Men: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(years) + 5
  // Women: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(years) - 161
  
  const baseBMR = 10 * weight + 6.25 * height - 5 * age;
  return gender === 'male' ? baseBMR + 5 : baseBMR - 161;
}

/**
 * Calculate Total Daily Energy Expenditure (TDEE)
 * 
 * Maintenance Calories (TDEE) = BMR × Activity Factor
 * 
 * Activity Levels:
 * - Sedentary (No exercise): × 1.2
 * - Lightly Active (1-3 workouts/week): × 1.375
 * - Moderately Active (3-5 workouts/week): × 1.55
 * - Very Active (6-7 workouts/week): × 1.725
 * - Super Active (Physical labor + workouts): × 1.9
 */
export function calculateTDEE(profile: UserProfile, bmr: number): number {
  const activityMultipliers = {
    sedentary: 1.2,      // Sedentary: No exercise
    light: 1.375,        // Lightly Active: 1-3 workouts/week
    moderate: 1.55,      // Moderately Active: 3-5 workouts/week
    active: 1.725,       // Very Active: 6-7 workouts/week
    very_active: 1.9,    // Super Active: Physical labor + workouts
  };

  return bmr * activityMultipliers[profile.activityLevel];
}

/**
 * Calculate all calorie goals based on profile
 */
export function calculateCalorieGoals(profile: UserProfile): CalorieGoals {
  const bmr = calculateBMR(profile);
  const tdee = calculateTDEE(profile, bmr);
  
  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    maintenance: Math.round(tdee),
    weightLoss: Math.round(tdee - 500), // 500 cal deficit for ~1 lb/week
    weightGain: Math.round(tdee + 500), // 500 cal surplus for ~1 lb/week
  };
}

/**
 * Calculate nutrition values for a given amount of food
 */
export function calculateNutritionForAmount(
  nutriments: { [key: string]: number | undefined },
  amount: number // in grams
): {
  calories: number;
  fat: number;
  carbs: number;
  protein: number;
  [key: string]: number;
} {
  const per100g = (value: number | undefined) => {
    if (value === undefined) return 0;
    return (value * amount) / 100;
  };

  return {
    calories: per100g(nutriments['energy-kcal_100g']),
    fat: per100g(nutriments.fat_100g),
    carbs: per100g(nutriments.carbohydrates_100g),
    protein: per100g(nutriments.proteins_100g),
  };
}

