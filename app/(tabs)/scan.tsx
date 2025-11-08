import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  Dimensions,
  ScrollView,
  Image,
  Modal,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Stack, useRouter } from 'expo-router';
import { Scan, Search, Camera, X, Flag, UtensilsCrossed, Trash2 } from 'lucide-react-native';
import { useFoodScanner } from '../../contexts/FoodScannerContext';
import { calculateNutritionForAmount } from '../../utils/calorieCalculation';
import Svg, { Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');

// Circular Progress Component
const CircularProgress = ({ 
  progress, 
  size = 120, 
  strokeWidth = 10, 
  remaining, 
  color = '#0096FF' 
}: { 
  progress: number; 
  size?: number; 
  strokeWidth?: number; 
  remaining: number;
  color?: string;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  // Adjust offset to start from top (12 o'clock position)
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  const normalizedProgress = Math.min(Math.max(progress, 0), 100);
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
        <Text style={{ fontSize: 24, fontWeight: '700', color: '#111827' }}>
          {Math.round(remaining)}
        </Text>
        <Text style={{ fontSize: 14, color: '#6B7280', marginTop: 2 }}>Remaining</Text>
      </View>
    </View>
  );
};

export default function ScanScreen() {
  const [barcode, setBarcode] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing] = useState<CameraType>('back');
  const { fetchProduct, getTodayTracking, getCalorieGoals, removeTrackedFood } = useFoodScanner();
  const router = useRouter();
  const hasScannedRef = useRef<boolean>(false);

  const todayTracking = getTodayTracking();
  const goals = getCalorieGoals();
  const goal = goals?.maintenance || 2000;
  const consumed = todayTracking.totalCalories;
  const remaining = Math.max(0, goal - consumed);
  const progress = goal > 0 ? Math.min((consumed / goal) * 100, 100) : 0;
  const progressColor = consumed > goal ? '#EF4444' : '#0096FF';

  const handleManualLookup = async () => {
    if (!barcode.trim()) {
      Alert.alert('Error', 'Please enter a barcode');
      return;
    }

    setIsLoading(true);
    try {
      const product = await fetchProduct(barcode.trim());
      if (product) {
        router.push(`/product/${product.code}` as any);
      } else {
        Alert.alert('Not Found', 'Product not found in database');
      }
    } catch {
      Alert.alert('Error', 'Failed to fetch product');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBarcodeScanned = async (data: string) => {
    if (hasScannedRef.current) return;
    hasScannedRef.current = true;

    setIsScanning(false);
    setIsLoading(true);

    try {
      const product = await fetchProduct(data);
      if (product) {
        router.push(`/product/${product.code}` as any);
      } else {
        Alert.alert('Not Found', 'Product not found in database');
      }
    } catch {
      Alert.alert('Error', 'Failed to fetch product');
    } finally {
      setIsLoading(false);
      hasScannedRef.current = false;
    }
  };

  const startScanning = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert('Permission Required', 'Camera permission is required to scan barcodes');
        return;
      }
    }
    hasScannedRef.current = false;
    setIsScanning(true);
  };

  const stopScanning = () => {
    setIsScanning(false);
    hasScannedRef.current = false;
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.logo}>Food Scanner</Text>
        </View>
      </View>

      {/* Top Search/Scan Bar */}
      <View style={styles.topBar}>
        <View style={styles.searchBar}>
          <Search size={20} color="#6B7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for a food"
            placeholderTextColor="#9CA3AF"
            value={barcode}
            onChangeText={setBarcode}
            keyboardType="numeric"
            onSubmitEditing={handleManualLookup}
          />
          <TouchableOpacity
            style={styles.scanButton}
            onPress={startScanning}
            disabled={isLoading}
          >
            <Scan size={24} color="#0096FF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Today Section */}
        <View style={styles.todaySection}>
          <View style={styles.todayHeader}>
            <Text style={styles.todayTitle}>Today</Text>
            <TouchableOpacity onPress={() => router.push('/profile' as any)}>
              <Text style={styles.editButton}>Edit</Text>
            </TouchableOpacity>
          </View>

          {/* Calories Card */}
          <View style={styles.caloriesCard}>
            <Text style={styles.caloriesSubtitle}>Remaining = Goal - Food</Text>
            
            <View style={styles.caloriesContent}>
              <CircularProgress 
                progress={progress} 
                remaining={remaining}
                color={progressColor}
              />
              
              <View style={styles.caloriesBreakdown}>
                <View style={styles.caloriesItem}>
                  <Flag size={20} color="#6B7280" />
                  <View style={styles.caloriesItemText}>
                    <Text style={styles.caloriesLabel}>Base Goal</Text>
                    <Text style={styles.caloriesValue}>{goal}</Text>
                  </View>
                </View>
                <View style={styles.caloriesItem}>
                  <UtensilsCrossed size={20} color="#6B7280" />
                  <View style={styles.caloriesItemText}>
                    <Text style={styles.caloriesLabel}>Food</Text>
                    <Text style={styles.caloriesValue}>{Math.round(consumed)}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Today's Foods */}
          {todayTracking.foods.length > 0 && (
            <View style={styles.foodsSection}>
              <Text style={styles.sectionTitle}>Today's Foods</Text>
              {todayTracking.foods.map((food) => {
                const nutrition = calculateNutritionForAmount(food.product.nutriments, food.amount);
                return (
                  <View key={food.id} style={styles.foodItem}>
                    {food.product.image_url ? (
                      <Image source={{ uri: food.product.image_url }} style={styles.foodImage} />
                    ) : (
                      <View style={[styles.foodImage, styles.foodImagePlaceholder]}>
                        <UtensilsCrossed size={24} color="#9CA3AF" />
                      </View>
                    )}
                    <View style={styles.foodInfo}>
                      <Text style={styles.foodName} numberOfLines={1}>
                        {food.product.product_name}
                      </Text>
                      <Text style={styles.foodDetails}>
                        {food.amount.toFixed(0)}g • {Math.round(nutrition.calories)} kcal
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => {
                        Alert.alert(
                          'Remove Food',
                          'Are you sure you want to remove this food?',
                          [
                            { text: 'Cancel', style: 'cancel' },
                            {
                              text: 'Remove',
                              style: 'destructive',
                              onPress: () => removeTrackedFood(food.id),
                            },
                          ]
                        );
                      }}
                    >
                      <Trash2 size={18} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}

          {todayTracking.foods.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No foods tracked today</Text>
              <Text style={styles.emptyStateSubtext}>Scan or search for foods to add them</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Camera Modal */}
      <Modal
        visible={isScanning}
        animationType="slide"
        onRequestClose={stopScanning}
      >
        <View style={styles.cameraContainer}>
          <CameraView
            style={styles.camera}
            facing={facing}
            onBarcodeScanned={(result) => {
              if (result.data) handleBarcodeScanned(result.data);
            }}
            barcodeScannerSettings={{
              barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39'],
            }}
          >
            <View style={styles.scanOverlay}>
              <View style={styles.scanFrame} />
              <Text style={styles.scanText}>Position barcode within frame</Text>
            </View>
          </CameraView>

          <TouchableOpacity style={styles.closeButton} onPress={stopScanning}>
            <X size={24} color="#fff" />
          </TouchableOpacity>
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
    justifyContent: 'center',
  },
  logo: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0096FF',
  },
  topBar: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  searchIcon: {
    marginRight: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  scanButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  todaySection: {
    padding: 20,
  },
  todayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  todayTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  editButton: {
    fontSize: 16,
    color: '#0096FF',
    fontWeight: '600',
  },
  caloriesCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  caloriesSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
    textAlign: 'center',
  },
  caloriesContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  caloriesBreakdown: {
    flex: 1,
    gap: 16,
  },
  caloriesItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  caloriesItemText: {
    flex: 1,
  },
  caloriesLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  caloriesValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  foodsSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  foodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  foodImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  foodImagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  foodInfo: {
    flex: 1,
    gap: 4,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  foodDetails: {
    fontSize: 14,
    color: '#6B7280',
  },
  removeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  scanOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanFrame: {
    width: width * 0.7,
    height: width * 0.5,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  scanText: {
    marginTop: 24,
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
