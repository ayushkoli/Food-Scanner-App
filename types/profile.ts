export interface UserProfile {
  name: string;
  age: number;
  height: number; // in cm
  weight: number; // in kg
  gender: 'male' | 'female';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
}

export interface CalorieGoals {
  bmr: number; // Basal Metabolic Rate
  tdee: number; // Total Daily Energy Expenditure
  maintenance: number; // Maintenance calories (same as TDEE)
  weightLoss: number; // 500 cal deficit
  weightGain: number; // 500 cal surplus
}

export interface TrackedFood {
  id: string;
  product: {
    code: string;
    product_name: string;
    image_url?: string;
    nutriments: {
      'energy-kcal_100g'?: number;
      fat_100g?: number;
      carbohydrates_100g?: number;
      proteins_100g?: number;
      [key: string]: number | undefined;
    };
  };
  amount: number; // in grams
  servingSize?: number; // in grams, if using serving size
  date: string; // YYYY-MM-DD format
  timestamp: number;
}

export interface DailyCalorieTracking {
  date: string; // YYYY-MM-DD format
  foods: TrackedFood[];
  totalCalories: number;
  totalFat: number;
  totalCarbs: number;
  totalProtein: number;
}

