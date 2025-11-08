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
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Heart, ArrowLeft, GitCompare, Plus } from 'lucide-react-native';
import { useFoodScanner } from '../../contexts/FoodScannerContext';
import { Product } from '../../types/product';
import { calculateHealthScore } from '../../utils/healthScore';
import { calculateNutritionForAmount } from '../../utils/calorieCalculation';
import Svg, { Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');

// Circular Health Score Component
const CircularHealthScore = ({ 
  score, 
  color,
  label,
  size = 140, 
  strokeWidth = 12
}: { 
  score: number; 
  color: string;
  label: string;
  size?: number; 
  strokeWidth?: number;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = score / 100;
  const strokeDashoffset = circumference - (progress * circumference);
  const center = size / 2;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        {/* Background circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>
      <View style={{ position: 'absolute', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 36, fontWeight: '700', color: '#111827' }}>
          {score}
        </Text>
        <Text style={{ fontSize: 18, color: '#6B7280', marginTop: 2 }}>/100</Text>
        <Text style={{ fontSize: 16, fontWeight: '600', color: color, marginTop: 8 }}>
          {label}
        </Text>
      </View>
    </View>
  );
};

export default function ProductDetailScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [useServingSize, setUseServingSize] = useState(false);
  const { fetchProduct, toggleFavorite, isFavorite, addToComparison, isInComparison, addTrackedFood } = useFoodScanner();
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

  const handleAddToTracking = () => {
    if (!product) return;
    setShowTrackingModal(true);
  };

  const handleSaveTracking = () => {
    if (!product) return;

    let amountInGrams = 0;
    
    if (useServingSize && product.serving_size) {
      // Parse serving size (e.g., "100 g" -> 100)
      const servingMatch = product.serving_size.match(/(\d+(?:\.\d+)?)/);
      if (servingMatch) {
        const servingSize = parseFloat(servingMatch[1]);
        const servings = parseFloat(amount) || 1;
        amountInGrams = servingSize * servings;
      } else {
        Alert.alert('Error', 'Could not parse serving size');
        return;
      }
    } else {
      amountInGrams = parseFloat(amount);
    }

    if (!amountInGrams || amountInGrams <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    addTrackedFood(product, amountInGrams, useServingSize ? amountInGrams : undefined);
    setShowTrackingModal(false);
    setAmount('');
    setUseServingSize(false);
    Alert.alert('Success', 'Food added to daily tracking!');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color="#0096FF" />
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
          <View style={styles.imageContainer}>
            <View style={styles.imageCard}>
              <Image 
                source={{ uri: product.image_url }} 
                style={styles.productImage}
                resizeMode="contain"
              />
            </View>
          </View>
        )}

        <View style={styles.content}>
          <View style={styles.productHeader}>
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{product.product_name}</Text>
              {product.brands && <Text style={styles.brandName}>{product.brands}</Text>}
              {product.quantity && <Text style={styles.quantity}>{product.quantity}</Text>}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Nutrition Facts (per 100g)</Text>
              <TouchableOpacity style={styles.trackButton} onPress={handleAddToTracking}>
                <Plus size={20} color="#fff" />
                <Text style={styles.trackButtonText}>Track</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.nutritionGrid}>
              {product.nutriments['energy-kcal_100g'] !== undefined && (
                <View style={styles.nutritionBox}>
                  <Text style={styles.nutritionLabel}>Calories</Text>
                  <Text style={styles.nutritionValue}>
                    {product.nutriments['energy-kcal_100g'].toFixed(0)} kcal
                  </Text>
                </View>
              )}
              {product.nutriments.fat_100g !== undefined && (
                <View style={styles.nutritionBox}>
                  <Text style={styles.nutritionLabel}>Fat</Text>
                  <Text style={styles.nutritionValue}>
                    {product.nutriments.fat_100g.toFixed(1)}g
                  </Text>
                </View>
              )}
              {product.nutriments.carbohydrates_100g !== undefined && (
                <View style={styles.nutritionBox}>
                  <Text style={styles.nutritionLabel}>Carbs</Text>
                  <Text style={styles.nutritionValue}>
                    {product.nutriments.carbohydrates_100g.toFixed(1)}g
                  </Text>
                </View>
              )}
              {product.nutriments.proteins_100g !== undefined && (
                <View style={styles.nutritionBox}>
                  <Text style={styles.nutritionLabel}>Protein</Text>
                  <Text style={styles.nutritionValue}>
                    {product.nutriments.proteins_100g.toFixed(1)}g
                  </Text>
                </View>
              )}
              {product.nutriments.sugars_100g !== undefined && (
                <View style={styles.nutritionBox}>
                  <Text style={styles.nutritionLabel}>Sugar</Text>
                  <Text style={styles.nutritionValue}>
                    {product.nutriments.sugars_100g.toFixed(1)}g
                  </Text>
                </View>
              )}
              {product.nutriments.salt_100g !== undefined && (
                <View style={styles.nutritionBox}>
                  <Text style={styles.nutritionLabel}>Salt</Text>
                  <Text style={styles.nutritionValue}>
                    {product.nutriments.salt_100g.toFixed(2)}g
                  </Text>
                </View>
              )}
              {product.nutriments.fiber_100g !== undefined && (
                <View style={styles.nutritionBox}>
                  <Text style={styles.nutritionLabel}>Fiber</Text>
                  <Text style={styles.nutritionValue}>
                    {product.nutriments.fiber_100g.toFixed(1)}g
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Health Assessment</Text>
            </View>
            <View style={styles.healthScoreContainer}>
              <CircularHealthScore 
                score={healthScore.score}
                color={healthScore.color}
                label={healthScore.label}
              />
              <Text style={styles.healthScoreSubtext}>Based on nutritional analysis</Text>
            </View>

            {(healthScore.warnings.length > 0 || healthScore.positives.length > 0) && (
              <View style={styles.keyFactorsSection}>
                <Text style={styles.keyFactorsTitle}>Key Factors:</Text>
                {healthScore.warnings.map((warning, index) => (
                  <View key={`warning-${index}`} style={styles.factorBox}>
                    <View style={styles.factorIndicatorRed} />
                    <Text style={styles.factorText}>{warning}</Text>
                  </View>
                ))}
                {healthScore.positives.map((positive, index) => (
                  <View key={`positive-${index}`} style={styles.factorBox}>
                    <View style={styles.factorIndicatorGreen} />
                    <Text style={styles.factorText}>{positive}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {product.ingredients_text && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ingredients</Text>
              <Text style={styles.ingredientsText}>{product.ingredients_text}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <Modal
        visible={showTrackingModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTrackingModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add to Daily Tracking</Text>
            <Text style={styles.modalSubtitle}>{product.product_name}</Text>

            <View style={styles.trackingOptions}>
              <TouchableOpacity
                style={[styles.optionButton, !useServingSize && styles.optionButtonActive]}
                onPress={() => setUseServingSize(false)}
              >
                <Text style={[styles.optionText, !useServingSize && styles.optionTextActive]}>
                  By Weight (grams)
                </Text>
              </TouchableOpacity>
              {product.serving_size && (
                <TouchableOpacity
                  style={[styles.optionButton, useServingSize && styles.optionButtonActive]}
                  onPress={() => setUseServingSize(true)}
                >
                  <Text style={[styles.optionText, useServingSize && styles.optionTextActive]}>
                    By Serving Size
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {useServingSize ? 'Number of Servings' : 'Amount (grams)'}
              </Text>
              <TextInput
                style={styles.modalInput}
                value={amount}
                onChangeText={setAmount}
                placeholder={useServingSize ? 'e.g., 2' : 'e.g., 150'}
                keyboardType="numeric"
                placeholderTextColor="#9CA3AF"
              />
              {useServingSize && product.serving_size && (
                <Text style={styles.inputHint}>
                  Serving size: {product.serving_size}
                </Text>
              )}
            </View>

            {amount && product.nutriments['energy-kcal_100g'] && (
              <View style={styles.previewCard}>
                <Text style={styles.previewTitle}>Nutrition Preview</Text>
                {(() => {
                  const amountInGrams = useServingSize && product.serving_size
                    ? (() => {
                        const servingMatch = product.serving_size.match(/(\d+(?:\.\d+)?)/);
                        if (servingMatch) {
                          return parseFloat(servingMatch[1]) * (parseFloat(amount) || 1);
                        }
                        return 0;
                      })()
                    : parseFloat(amount) || 0;
                  const nutrition = calculateNutritionForAmount(product.nutriments, amountInGrams);
                  return (
                    <>
                      <View style={styles.previewRow}>
                        <Text style={styles.previewLabel}>Calories:</Text>
                        <Text style={styles.previewValue}>{Math.round(nutrition.calories)} kcal</Text>
                      </View>
                      <View style={styles.previewRow}>
                        <Text style={styles.previewLabel}>Fat:</Text>
                        <Text style={styles.previewValue}>{nutrition.fat.toFixed(1)}g</Text>
                      </View>
                      <View style={styles.previewRow}>
                        <Text style={styles.previewLabel}>Carbs:</Text>
                        <Text style={styles.previewValue}>{nutrition.carbs.toFixed(1)}g</Text>
                      </View>
                      <View style={styles.previewRow}>
                        <Text style={styles.previewLabel}>Protein:</Text>
                        <Text style={styles.previewValue}>{nutrition.protein.toFixed(1)}g</Text>
                      </View>
                    </>
                  );
                })()}
              </View>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowTrackingModal(false);
                  setAmount('');
                  setUseServingSize(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveTracking}
              >
                <Text style={styles.saveButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    backgroundColor: '#0096FF',
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
    backgroundColor: '#0096FF',
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
  imageContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageCard: {
    width: width - 40,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productImage: {
    width: width - 100,
    height: width - 100,
    backgroundColor: 'transparent',
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
    color: '#0096FF',
    fontWeight: '600' as const,
  },
  quantity: {
    fontSize: 14,
    color: '#6B7280',
  },
  healthScoreContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    marginBottom: 24,
  },
  healthScoreSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
    textAlign: 'center',
  },
  keyFactorsSection: {
    marginTop: 8,
  },
  keyFactorsTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#111827',
    marginBottom: 12,
  },
  factorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  factorIndicatorRed: {
    width: 4,
    height: 40,
    backgroundColor: '#EF4444',
    borderRadius: 2,
    marginRight: 12,
  },
  factorIndicatorGreen: {
    width: 4,
    height: 40,
    backgroundColor: '#10B981',
    borderRadius: 2,
    marginRight: 12,
  },
  factorText: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#111827',
  },
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0096FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  trackButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  nutritionBox: {
    width: (width - 64) / 2,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  nutritionLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
    fontWeight: '500' as const,
  },
  nutritionValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#111827',
  },
  ingredientsText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
  },
  trackingOptions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  optionButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    alignItems: 'center',
  },
  optionButtonActive: {
    backgroundColor: '#0096FF',
    borderColor: '#0096FF',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#6B7280',
  },
  optionTextActive: {
    color: '#fff',
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#374151',
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#111827',
  },
  inputHint: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  previewCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 12,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  previewLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  previewValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#111827',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  saveButton: {
    backgroundColor: '#0096FF',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
});
