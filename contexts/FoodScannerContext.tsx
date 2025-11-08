import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { Product, HistoryItem, OpenFoodFactsResponse } from '../types/product';
import { UserProfile, TrackedFood, DailyCalorieTracking } from '../types/profile';
import { calculateCalorieGoals, calculateNutritionForAmount } from '../utils/calorieCalculation';

const HISTORY_KEY = '@food_scanner_history';
const FAVORITES_KEY = '@food_scanner_favorites';
const COMPARISON_KEY = '@food_scanner_comparison';
const PROFILE_KEY = '@food_scanner_profile';
const TRACKED_FOODS_KEY = '@food_scanner_tracked_foods';
const MAX_HISTORY_ITEMS = 20;
const MAX_COMPARISON_ITEMS = 3;

export const [FoodScannerProvider, useFoodScanner] = createContextHook(() => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [comparison, setComparison] = useState<Product[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [trackedFoods, setTrackedFoods] = useState<TrackedFood[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadStoredData();
  }, []);

  const loadStoredData = async () => {
    try {
      const [historyData, favoritesData, comparisonData, profileData, trackedFoodsData] = await Promise.all([
        AsyncStorage.getItem(HISTORY_KEY),
        AsyncStorage.getItem(FAVORITES_KEY),
        AsyncStorage.getItem(COMPARISON_KEY),
        AsyncStorage.getItem(PROFILE_KEY),
        AsyncStorage.getItem(TRACKED_FOODS_KEY),
      ]);

      if (historyData) setHistory(JSON.parse(historyData));
      if (favoritesData) setFavorites(JSON.parse(favoritesData));
      if (comparisonData) setComparison(JSON.parse(comparisonData));
      if (profileData) setProfile(JSON.parse(profileData));
      if (trackedFoodsData) setTrackedFoods(JSON.parse(trackedFoodsData));
    } catch (error) {
      console.error('Error loading stored data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToHistory = useCallback(async (product: Product) => {
    setHistory((prevHistory) => {
      const newHistory = [
        { product, timestamp: Date.now() },
        ...prevHistory.filter((item) => item.product.code !== product.code),
      ].slice(0, MAX_HISTORY_ITEMS);

      AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory)).catch((error) => {
        console.error('Error saving history:', error);
      });

      return newHistory;
    });
  }, []);

  const fetchProduct = useCallback(async (barcode: string): Promise<Product | null> => {
    try {
      console.log('Fetching product:', barcode);
      const response = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
      );
      const data: OpenFoodFactsResponse = await response.json();

      if (data.status === 1 && data.product) {
        const product: Product = {
          id: data.product.code || barcode,
          code: data.product.code || barcode,
          product_name: data.product.product_name || 'Unknown Product',
          brands: data.product.brands,
          image_url: data.product.image_url,
          image_small_url: data.product.image_small_url,
          nutriments: data.product.nutriments || {},
          ingredients_text: data.product.ingredients_text,
          allergens: data.product.allergens,
          categories: data.product.categories,
          labels: data.product.labels,
          quantity: data.product.quantity,
          serving_size: data.product.serving_size,
          nutriscore_grade: data.product.nutriscore_grade,
          nova_group: data.product.nova_group,
          ecoscore_grade: data.product.ecoscore_grade,
        };

        await addToHistory(product);
        return product;
      }

      return null;
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  }, [addToHistory]);

  const clearHistory = useCallback(async () => {
    try {
      setHistory([]);
      await AsyncStorage.removeItem(HISTORY_KEY);
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  }, []);

  const toggleFavorite = useCallback(async (product: Product) => {
    setFavorites((prevFavorites) => {
      const isFavorite = prevFavorites.some((fav) => fav.code === product.code);
      const newFavorites = isFavorite
        ? prevFavorites.filter((fav) => fav.code !== product.code)
        : [...prevFavorites, product];

      AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites)).catch((error) => {
        console.error('Error saving favorites:', error);
      });

      return newFavorites;
    });
  }, []);

  const isFavorite = useCallback(
    (productCode: string): boolean => {
      return favorites.some((fav) => fav.code === productCode);
    },
    [favorites]
  );

  const addToComparison = useCallback(async (product: Product): Promise<boolean> => {
    let success = false;
    setComparison((prevComparison) => {
      if (prevComparison.length >= MAX_COMPARISON_ITEMS) {
        console.log('Maximum comparison items reached');
        return prevComparison;
      }

      if (prevComparison.some((item) => item.code === product.code)) {
        console.log('Product already in comparison');
        return prevComparison;
      }

      const newComparison = [...prevComparison, product];
      success = true;

      AsyncStorage.setItem(COMPARISON_KEY, JSON.stringify(newComparison)).catch((error) => {
        console.error('Error saving comparison:', error);
      });

      return newComparison;
    });

    return success;
  }, []);

  const removeFromComparison = useCallback(async (productCode: string) => {
    setComparison((prevComparison) => {
      const newComparison = prevComparison.filter((item) => item.code !== productCode);

      AsyncStorage.setItem(COMPARISON_KEY, JSON.stringify(newComparison)).catch((error) => {
        console.error('Error saving comparison:', error);
      });

      return newComparison;
    });
  }, []);

  const clearComparison = useCallback(async () => {
    try {
      setComparison([]);
      await AsyncStorage.removeItem(COMPARISON_KEY);
    } catch (error) {
      console.error('Error clearing comparison:', error);
    }
  }, []);

  const isInComparison = useCallback(
    (productCode: string): boolean => {
      return comparison.some((item) => item.code === productCode);
    },
    [comparison]
  );

  const saveProfile = useCallback(async (userProfile: UserProfile) => {
    try {
      setProfile(userProfile);
      await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(userProfile));
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  }, []);

  const getCalorieGoals = useCallback(() => {
    if (!profile) return null;
    return calculateCalorieGoals(profile);
  }, [profile]);

  const addTrackedFood = useCallback(async (product: Product, amount: number, servingSize?: number) => {
    const today = new Date().toISOString().split('T')[0];
    const trackedFood: TrackedFood = {
      id: `${product.code}-${Date.now()}`,
      product: {
        code: product.code,
        product_name: product.product_name,
        image_url: product.image_url,
        nutriments: product.nutriments,
      },
      amount,
      servingSize,
      date: today,
      timestamp: Date.now(),
    };

    setTrackedFoods((prev) => {
      const newFoods = [...prev, trackedFood];
      AsyncStorage.setItem(TRACKED_FOODS_KEY, JSON.stringify(newFoods)).catch((error) => {
        console.error('Error saving tracked foods:', error);
      });
      return newFoods;
    });
  }, []);

  const removeTrackedFood = useCallback(async (foodId: string) => {
    setTrackedFoods((prev) => {
      const newFoods = prev.filter((food) => food.id !== foodId);
      AsyncStorage.setItem(TRACKED_FOODS_KEY, JSON.stringify(newFoods)).catch((error) => {
        console.error('Error saving tracked foods:', error);
      });
      return newFoods;
    });
  }, []);

  const getDailyTracking = useCallback((date: string): DailyCalorieTracking => {
    const dayFoods = trackedFoods.filter((food) => food.date === date);
    const totals = dayFoods.reduce(
      (acc, food) => {
        const nutrition = calculateNutritionForAmount(food.product.nutriments, food.amount);
        return {
          totalCalories: acc.totalCalories + nutrition.calories,
          totalFat: acc.totalFat + nutrition.fat,
          totalCarbs: acc.totalCarbs + nutrition.carbs,
          totalProtein: acc.totalProtein + nutrition.protein,
        };
      },
      { totalCalories: 0, totalFat: 0, totalCarbs: 0, totalProtein: 0 }
    );

    return {
      date,
      foods: dayFoods,
      ...totals,
    };
  }, [trackedFoods]);

  const getTodayTracking = useCallback((): DailyCalorieTracking => {
    const today = new Date().toISOString().split('T')[0];
    return getDailyTracking(today);
  }, [getDailyTracking]);

  return useMemo(() => ({
    history,
    favorites,
    comparison,
    profile,
    trackedFoods,
    isLoading,
    fetchProduct,
    addToHistory,
    clearHistory,
    toggleFavorite,
    isFavorite,
    addToComparison,
    removeFromComparison,
    clearComparison,
    isInComparison,
    saveProfile,
    getCalorieGoals,
    addTrackedFood,
    removeTrackedFood,
    getDailyTracking,
    getTodayTracking,
  }), [history, favorites, comparison, profile, trackedFoods, isLoading, fetchProduct, addToHistory, clearHistory, toggleFavorite, isFavorite, addToComparison, removeFromComparison, clearComparison, isInComparison, saveProfile, getCalorieGoals, addTrackedFood, removeTrackedFood, getDailyTracking, getTodayTracking]);
});
