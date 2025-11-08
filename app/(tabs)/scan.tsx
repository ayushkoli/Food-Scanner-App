import { useState, useRef } from 'react';
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
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Stack, useRouter } from 'expo-router';
import { Scan, Keyboard, Camera, X } from 'lucide-react-native';
import { useFoodScanner } from '../../contexts/FoodScannerContext';

const { width } = Dimensions.get('window');

export default function ScanScreen() {
  const [barcode, setBarcode] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing] = useState<CameraType>('back');
  const { fetchProduct } = useFoodScanner();
  const router = useRouter();
  const hasScannedRef = useRef<boolean>(false);

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

    console.log('Barcode scanned:', data);
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
      <Stack.Screen
        options={{
          title: 'Scan Product',
          headerStyle: { backgroundColor: '#7C3AED' },
          headerTintColor: '#fff',
        }}
      />

      {isScanning ? (
        <View style={styles.cameraContainer}>
          <CameraView
            style={styles.camera}
            facing={facing}
            onBarcodeScanned={(result) => {
              if (result.data) {
                handleBarcodeScanned(result.data);
              }
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
      ) : (
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Scan size={48} color="#7C3AED" />
            </View>
            <Text style={styles.title}>Food Scanner</Text>
            <Text style={styles.subtitle}>
              Scan barcodes to get instant nutrition information
            </Text>
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.label}>Enter Barcode Manually</Text>
            <View style={styles.inputContainer}>
              <Keyboard size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter barcode number"
                placeholderTextColor="#9CA3AF"
                value={barcode}
                onChangeText={setBarcode}
                keyboardType="numeric"
                editable={!isLoading}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, styles.primaryButton, isLoading && styles.buttonDisabled]}
              onPress={handleManualLookup}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Scan size={20} color="#fff" />
                  <Text style={styles.buttonText}>Look Up Product</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.cameraSection}>
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={startScanning}
              disabled={isLoading}
            >
              <Camera size={20} color="#7C3AED" />
              <Text style={styles.secondaryButtonText}>Scan with Camera</Text>
            </TouchableOpacity>
            <Text style={styles.hint}>
              Point your camera at a product barcode to scan
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  inputSection: {
    marginBottom: 32,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 52,
    fontSize: 16,
    color: '#111827',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 12,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#7C3AED',
  },
  secondaryButton: {
    backgroundColor: '#EDE9FE',
    borderWidth: 1,
    borderColor: '#7C3AED',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#7C3AED',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#9CA3AF',
  },
  cameraSection: {
    alignItems: 'center',
  },
  hint: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
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
    fontWeight: '600' as const,
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
