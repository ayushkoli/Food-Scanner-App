import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Heart } from 'lucide-react-native';
import { useFoodScanner } from '../../contexts/FoodScannerContext';
import { Product } from '../../types/product';

export default function FavoritesScreen() {
  const { favorites } = useFoodScanner();
  const router = useRouter();

  const renderItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.favoriteItem}
      onPress={() => router.push(`/product/${item.code}` as any)}
    >
      {item.image_small_url ? (
        <Image source={{ uri: item.image_small_url }} style={styles.productImage} />
      ) : (
        <View style={[styles.productImage, styles.placeholderImage]}>
          <Text style={styles.placeholderText}>No Image</Text>
        </View>
      )}
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.product_name}
        </Text>
        {item.brands && (
          <Text style={styles.brandName} numberOfLines={1}>
            {item.brands}
          </Text>
        )}
        {item.quantity && (
          <Text style={styles.quantity} numberOfLines={1}>
            {item.quantity}
          </Text>
        )}
      </View>
      <Heart size={20} color="#EF4444" fill="#EF4444" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Favorites',
          headerStyle: { backgroundColor: '#7C3AED' },
          headerTintColor: '#fff',
        }}
      />

      {favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Heart size={64} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>No Favorites Yet</Text>
          <Text style={styles.emptyText}>
            Tap the heart icon on products to save them here
          </Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderItem}
          keyExtractor={(item) => item.code}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  listContent: {
    padding: 16,
  },
  favoriteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  placeholderImage: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#111827',
    marginBottom: 4,
  },
  brandName: {
    fontSize: 14,
    color: '#7C3AED',
    marginBottom: 4,
  },
  quantity: {
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
