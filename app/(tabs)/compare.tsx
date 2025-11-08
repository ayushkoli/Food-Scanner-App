import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Dimensions,
    Platform,
  } from 'react-native';
import { Stack } from 'expo-router';
import { GitCompare, X } from 'lucide-react-native';
import { useFoodScanner } from '../../contexts/FoodScannerContext';
import { Product } from '../../types/product';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 3;

export default function CompareScreen() {
    const { comparison, removeFromComparison, clearComparison } = useFoodScanner();
  
    const getNutrientValue = (product: Product, key: keyof Product['nutriments']): string => {
      const value = product.nutriments[key];
      if (value === undefined) return 'N/A';
      return typeof value === 'number' ? value.toFixed(1) : 'N/A';
    };
  
    const nutrients = [
      { key: 'energy-kcal_100g' as const, label: 'Calories', unit: 'kcal' },
      { key: 'fat_100g' as const, label: 'Fat', unit: 'g' },
      { key: 'saturated-fat_100g' as const, label: 'Sat. Fat', unit: 'g' },
      { key: 'carbohydrates_100g' as const, label: 'Carbs', unit: 'g' },
      { key: 'sugars_100g' as const, label: 'Sugar', unit: 'g' },
      { key: 'proteins_100g' as const, label: 'Protein', unit: 'g' },
      { key: 'salt_100g' as const, label: 'Salt', unit: 'g' },
      { key: 'fiber_100g' as const, label: 'Fiber', unit: 'g' },
    ];
  
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.logo}>Compare</Text>
            {comparison.length > 0 && (
              <TouchableOpacity onPress={clearComparison} style={styles.clearButton}>
                <Text style={styles.clearButtonText}>Clear All</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
  
        {comparison.length === 0 ? (
          <View style={styles.emptyContainer}>
            <GitCompare size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No Products to Compare</Text>
            <Text style={styles.emptyText}>
              Add products to comparison from product details
            </Text>
          </View>
        ) : (
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.productsRow}>
              {comparison.map((product) => (
                <View key={product.code} style={styles.productCard}>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeFromComparison(product.code)}
                  >
                    <X size={16} color="#fff" />
                  </TouchableOpacity>
                  {product.image_small_url ? (
                    <Image
                      source={{ uri: product.image_small_url }}
                      style={styles.productImage}
                    />
                  ) : (
                    <View style={[styles.productImage, styles.placeholderImage]}>
                      <Text style={styles.placeholderText}>No Image</Text>
                    </View>
                  )}
                  <Text style={styles.productName} numberOfLines={2}>
                    {product.product_name}
                  </Text>
                  {product.brands && (
                    <Text style={styles.brandName} numberOfLines={1}>
                      {product.brands}
                    </Text>
                  )}
                </View>
              ))}
            </View>
  
            <View style={styles.comparisonTable}>
              <Text style={styles.tableTitle}>Nutrition Comparison (per 100g)</Text>
              {nutrients.map((nutrient) => (
                <View key={nutrient.key} style={styles.tableRow}>
                  <View style={styles.labelCell}>
                    <Text style={styles.nutrientLabel}>{nutrient.label}</Text>
                  </View>
                  {comparison.map((product) => (
                    <View key={product.code} style={styles.valueCell}>
                      <Text style={styles.nutrientValue}>
                        {getNutrientValue(product, nutrient.key)}
                      </Text>
                      {getNutrientValue(product, nutrient.key) !== 'N/A' && (
                        <Text style={styles.unitText}>{nutrient.unit}</Text>
                      )}
                    </View>
                  ))}
                </View>
              ))}
            </View>
          </ScrollView>
        )}
      </View>
    );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F9FAFB',
    },
    header: {
      backgroundColor: '#fff',
      paddingTop: Platform.OS === 'ios' ? 60 : 40,
      paddingBottom: 16,
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      borderBottomColor: '#E5E7EB',
    },
    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    logo: {
      fontSize: 24,
      fontWeight: '700',
      color: '#0096FF',
    },
    clearButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: '#FEF2F2',
      borderRadius: 8,
    },
    clearButtonText: {
      color: '#EF4444',
      fontSize: 14,
      fontWeight: '600' as const,
    },
    scrollView: {
      flex: 1,
    },
    productsRow: {
      flexDirection: 'row',
      padding: 20,
      gap: 8,
    },
    productCard: {
      width: CARD_WIDTH,
      backgroundColor: '#fff',
      borderRadius: 16,
      padding: 12,
      borderWidth: 1,
      borderColor: '#E5E7EB',
      position: 'relative',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    removeButton: {
      position: 'absolute',
      top: 4,
      right: 4,
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: '#EF4444',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1,
    },
    productImage: {
      width: CARD_WIDTH - 16,
      height: CARD_WIDTH - 16,
      borderRadius: 8,
      backgroundColor: '#F3F4F6',
      marginBottom: 8,
    },
    placeholderImage: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    placeholderText: {
      fontSize: 10,
      color: '#9CA3AF',
    },
    productName: {
      fontSize: 12,
      fontWeight: '600' as const,
      color: '#111827',
      marginBottom: 2,
    },
    brandName: {
      fontSize: 10,
      color: '#0096FF',
    },
    comparisonTable: {
      padding: 20,
      paddingTop: 0,
    },
    tableTitle: {
      fontSize: 20,
      fontWeight: '700' as const,
      color: '#111827',
      marginBottom: 16,
    },
    tableRow: {
      flexDirection: 'row',
      marginBottom: 12,
      backgroundColor: '#fff',
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: '#E5E7EB',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    labelCell: {
      width: 100,
      justifyContent: 'center',
    },
    nutrientLabel: {
      fontSize: 14,
      fontWeight: '600' as const,
      color: '#374151',
    },
    valueCell: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    nutrientValue: {
      fontSize: 16,
      fontWeight: '700' as const,
      color: '#111827',
    },
    unitText: {
      fontSize: 12,
      color: '#6B7280',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: '700' as const,
      color: '#111827',
      marginTop: 16,
      marginBottom: 8,
    },
    emptyText: {
      fontSize: 14,
      color: '#6B7280',
      textAlign: 'center',
    },
  });
  