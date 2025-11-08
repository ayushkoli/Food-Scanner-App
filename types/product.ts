export interface NutrientData {
    value: number;
    unit: string;
  }
  
  export interface Nutriments {
    energy_100g?: number;
    'energy-kcal_100g'?: number;
    fat_100g?: number;
    'saturated-fat_100g'?: number;
    carbohydrates_100g?: number;
    sugars_100g?: number;
    fiber_100g?: number;
    proteins_100g?: number;
    salt_100g?: number;
    sodium_100g?: number;
    calcium_100g?: number;
    iron_100g?: number;
    'vitamin-c_100g'?: number;
    'vitamin-a_100g'?: number;
  }
  
  export interface Product {
    id: string;
    code: string;
    product_name: string;
    brands?: string;
    image_url?: string;
    image_small_url?: string;
    nutriments: Nutriments;
    ingredients_text?: string;
    allergens?: string;
    categories?: string;
    labels?: string;
    quantity?: string;
    serving_size?: string;
    nutriscore_grade?: string;
    nova_group?: number;
    ecoscore_grade?: string;
  }
  
  export interface HealthScore {
    score: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'E';
    color: string;
    label: string;
    warnings: string[];
    positives: string[];
  }
  
  export interface HistoryItem {
    product: Product;
    timestamp: number;
  }
  
  export interface OpenFoodFactsResponse {
    status: number;
    code: string;
    product?: Product;
    status_verbose?: string;
  }
  