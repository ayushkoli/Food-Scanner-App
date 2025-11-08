import { Product, HealthScore } from '../types/product';

export function calculateHealthScore(product: Product): HealthScore {
  let score = 100;
  const warnings: string[] = [];
  const positives: string[] = [];
  const nutriments = product.nutriments;

  if (nutriments.sugars_100g !== undefined && nutriments.sugars_100g > 15) {
    score -= 20;
    warnings.push(`High sugar content: ${nutriments.sugars_100g.toFixed(1)}g per 100g`);
  } else if (nutriments.sugars_100g !== undefined && nutriments.sugars_100g < 5) {
    score += 5;
    positives.push('Very low sugar content');
  }

  if (nutriments.salt_100g !== undefined && nutriments.salt_100g > 1.5) {
    score -= 15;
    warnings.push(`High salt content: ${nutriments.salt_100g.toFixed(2)}g per 100g`);
  } else if (nutriments.salt_100g !== undefined && nutriments.salt_100g < 0.3) {
    score += 5;
    positives.push('Very low salt content');
  }

  const calories = nutriments['energy-kcal_100g'] || nutriments.energy_100g;
  if (calories !== undefined && calories > 500) {
    score -= 15;
    warnings.push(`Very high calorie content: ${calories.toFixed(0)} kcal per 100g`);
  } else if (calories !== undefined && calories > 400) {
    score -= 10;
    warnings.push(`High calorie content: ${calories.toFixed(0)} kcal per 100g`);
  }

  if (nutriments.proteins_100g !== undefined && nutriments.proteins_100g > 20) {
    score += 15;
    positives.push(`Excellent protein content: ${nutriments.proteins_100g.toFixed(1)}g per 100g`);
  } else if (nutriments.proteins_100g !== undefined && nutriments.proteins_100g > 10) {
    score += 10;
    positives.push(`Good protein content: ${nutriments.proteins_100g.toFixed(1)}g per 100g`);
  }

  if (nutriments.fiber_100g !== undefined && nutriments.fiber_100g > 5) {
    score += 10;
    positives.push(`High fiber content: ${nutriments.fiber_100g.toFixed(1)}g per 100g`);
  }

  if (nutriments['saturated-fat_100g'] !== undefined && nutriments['saturated-fat_100g'] > 5) {
    score -= 10;
    warnings.push(`High saturated fat: ${nutriments['saturated-fat_100g'].toFixed(1)}g per 100g`);
  }

  score = Math.max(0, Math.min(100, score));

  let grade: 'A' | 'B' | 'C' | 'D' | 'E';
  let color: string;
  let label: string;

  if (score >= 80) {
    grade = 'A';
    color = '#10B981';
    label = 'Excellent';
  } else if (score >= 60) {
    grade = 'B';
    color = '#84CC16';
    label = 'Good';
  } else if (score >= 40) {
    grade = 'C';
    color = '#F59E0B';
    label = 'Average';
  } else if (score >= 20) {
    grade = 'D';
    color = '#F97316';
    label = 'Poor';
  } else {
    grade = 'E';
    color = '#EF4444';
    label = 'Very Poor';
  }

  return {
    score,
    grade,
    color,
    label,
    warnings,
    positives,
  };
}

export function formatNutrient(value: number | undefined, unit: string = 'g'): string {
  if (value === undefined) return 'N/A';
  return `${value.toFixed(1)}${unit}`;
}

export function getNutrientColor(value: number | undefined, type: 'sugar' | 'salt' | 'fat' | 'protein' | 'fiber'): string {
  if (value === undefined) return '#6B7280';

  switch (type) {
    case 'sugar':
      if (value > 15) return '#EF4444';
      if (value > 5) return '#F59E0B';
      return '#10B981';
    case 'salt':
      if (value > 1.5) return '#EF4444';
      if (value > 0.3) return '#F59E0B';
      return '#10B981';
    case 'fat':
      if (value > 5) return '#EF4444';
      if (value > 3) return '#F59E0B';
      return '#10B981';
    case 'protein':
      if (value > 10) return '#10B981';
      if (value > 5) return '#F59E0B';
      return '#EF4444';
    case 'fiber':
      if (value > 5) return '#10B981';
      if (value > 3) return '#F59E0B';
      return '#EF4444';
    default:
      return '#6B7280';
  }
}
