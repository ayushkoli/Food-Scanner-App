import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Heart, ArrowLeft, GitCompare } from 'lucide-react-native';
import { useFoodScanner } from '../../contexts/FoodScannerContext';
import { Product } from '../../types/product';
import { calculateHealthScore } from '../../utils/healthScore';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { fetchProduct, toggleFavorite, isFavorite, addToComparison, isInComparison } = useFoodScanner();
  const router = useRouter();

  useEffect(() => {
    if (code) {
      loadProduct();
    }
  }, [code]);

  const loadProduct = async () => {
    if (!code) return;
    setIsLoading(true);
    const productData = await fetchProduct(code);
    setProduct(productData);
    setIsLoading(false);
  };

  const handleToggleFavorite = () => {
    if (product) {
      toggleFavorite(product);
    }
  };

  const handleAddToComparison = async () => {
    if (product) {
      const success = await addToComparison(product);
      if (success) {
        console.log('Added to comparison');
      }
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text style={styles.loadingText}>Loading product...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Stack.Screen options={{ headerShown: false }} />
        <Text style={styles.errorText}>Product not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const healthScore = calculateHealthScore(product);
  const favorite = isFavorite(product.code);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={handleToggleFavorite}>
            <Heart size={24} color="#fff" fill={favorite ? '#fff' : 'transparent'} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={handleAddToComparison}>
            <GitCompare size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {product.image_url && (
          <Image source={{ uri: product.image_url }} style={styles.productImage} />
        )}

        <View style={styles.content}>
          <View style={styles.productHeader}>
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{product.product_name}</Text>
              {product.brands && <Text style={styles.brandName}>{product.brands}</Text>}
              {product.quantity && <Text style={styles.quantity}>{product.quantity}</Text>}
            </View>
          </View>

          <View style={[styles.healthScoreCard, { backgroundColor: healthScore.color + '20' }]}>
            <View style={styles.scoreHeader}>
              <Text style={styles.scoreLabel}>Health Score</Text>
              <View style={[styles.gradeBadge, { backgroundColor: healthScore.color }]}>
                <Text style={styles.gradeText}>{healthScore.grade}</Text>
              </View>
            </View>
            <View style={styles.scoreContent}>
              <Text style={[styles.scoreValue, { color: healthScore.color }]}>
                {healthScore.score}
              </Text>
              <Text style={styles.scoreMax}>/100</Text>
            </View>
            <Text style={[styles.scoreLabel, { color: healthScore.color }]}>
              {healthScore.label}
            </Text>
          </View>

          {healthScore.warnings.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>⚠️ Warnings</Text>
              {healthScore.warnings.map((warning, index) => (
                <View key={index} style={styles.listItem}>
                  <Text style={styles.warningText}>• {warning}</Text>
                </View>
              ))}
            </View>
          )}

          {healthScore.positives.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>✓ Positives</Text>
              {healthScore.positives.map((positive, index) => (
                <View key={index} style={styles.listItem}>
                  <Text style={styles.positiveText}>• {positive}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nutrition Facts (per 100g)</Text>
            <View style={styles.nutritionGrid}>
              {product.nutriments['energy-kcal_100g'] !== undefined && (
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionLabel}>Calories</Text>
                  <Text style={styles.nutritionValue}>
                    {product.nutriments['energy-kcal_100g'].toFixed(0)} kcal
                  </Text>
                </View>
              )}
              {product.nutriments.fat_100g !== undefined && (
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionLabel}>Fat</Text>
                  <Text style={styles.nutritionValue}>
                    {product.nutriments.fat_100g.toFixed(1)}g
                  </Text>
                </View>
              )}
              {product.nutriments.carbohydrates_100g !== undefined && (
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionLabel}>Carbs</Text>
                  <Text style={styles.nutritionValue}>
                    {product.nutriments.carbohydrates_100g.toFixed(1)}g
                  </Text>
                </View>
              )}
              {product.nutriments.proteins_100g !== undefined && (
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionLabel}>Protein</Text>
                  <Text style={styles.nutritionValue}>
                    {product.nutriments.proteins_100g.toFixed(1)}g
                  </Text>
                </View>
              )}
              {product.nutriments.sugars_100g !== undefined && (
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionLabel}>Sugar</Text>
                  <Text style={styles.nutritionValue}>
                    {product.nutriments.sugars_100g.toFixed(1)}g
                  </Text>
                </View>
              )}
              {product.nutriments.salt_100g !== undefined && (
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionLabel}>Salt</Text>
                  <Text style={styles.nutritionValue}>
                    {product.nutriments.salt_100g.toFixed(2)}g
                  </Text>
                </View>
              )}
              {product.nutriments.fiber_100g !== undefined && (
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionLabel}>Fiber</Text>
                  <Text style={styles.nutritionValue}>
                    {product.nutriments.fiber_100g.toFixed(1)}g
                  </Text>
                </View>
              )}
            </View>
          </View>

          {product.ingredients_text && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ingredients</Text>
              <Text style={styles.ingredientsText}>{product.ingredients_text}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#EF4444',
    marginBottom: 20,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#7C3AED',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#7C3AED',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  scrollView: {
    flex: 1,
  },
  productImage: {
    width: width,
    height: width * 0.8,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  productHeader: {
    marginBottom: 20,
  },
  productInfo: {
    gap: 4,
  },
  productName: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#111827',
  },
  brandName: {
    fontSize: 16,
    color: '#7C3AED',
    fontWeight: '600' as const,
  },
  quantity: {
    fontSize: 14,
    color: '#6B7280',
  },
  healthScoreCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  scoreLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#374151',
  },
  gradeBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradeText: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#fff',
  },
  scoreContent: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: '700' as const,
  },
  scoreMax: {
    fontSize: 24,
    color: '#6B7280',
    marginLeft: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 12,
  },
  listItem: {
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#EF4444',
    lineHeight: 20,
  },
  positiveText: {
    fontSize: 14,
    color: '#10B981',
    lineHeight: 20,
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  nutritionItem: {
    width: (width - 64) / 2,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  nutritionLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#111827',
  },
  ingredientsText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
});
