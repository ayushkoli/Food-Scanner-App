import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  Image,
  Platform,
} from 'react-native';
import { User, Trash2 } from 'lucide-react-native';
import { Stack } from 'expo-router';
import { useFoodScanner } from '../../contexts/FoodScannerContext';
import { UserProfile } from '../../types/profile';
import { calculateCalorieGoals, calculateNutritionForAmount } from '../../utils/calorieCalculation';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const { profile, saveProfile, getCalorieGoals, getTodayTracking, removeTrackedFood } = useFoodScanner();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [activityLevel, setActivityLevel] = useState<UserProfile['activityLevel']>('moderate');
  const [calorieGoals, setCalorieGoals] = useState(calculateCalorieGoals({
    name: '',
    age: 0,
    height: 0,
    weight: 0,
    gender: 'male',
    activityLevel: 'moderate',
  }));

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setAge(profile.age.toString());
      setHeight(profile.height.toString());
      setWeight(profile.weight.toString());
      setGender(profile.gender);
      setActivityLevel(profile.activityLevel);
      const goals = calculateCalorieGoals(profile);
      setCalorieGoals(goals);
    }
  }, [profile]);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    if (!age || isNaN(Number(age)) || Number(age) <= 0) {
      Alert.alert('Error', 'Please enter a valid age');
      return;
    }
    if (!height || isNaN(Number(height)) || Number(height) <= 0) {
      Alert.alert('Error', 'Please enter a valid height (in cm)');
      return;
    }
    if (!weight || isNaN(Number(weight)) || Number(weight) <= 0) {
      Alert.alert('Error', 'Please enter a valid weight (in kg)');
      return;
    }

    const userProfile: UserProfile = {
      name: name.trim(),
      age: Number(age),
      height: Number(height),
      weight: Number(weight),
      gender,
      activityLevel,
    };

    saveProfile(userProfile);
    const goals = calculateCalorieGoals(userProfile);
    setCalorieGoals(goals);
    Alert.alert('Success', 'Profile saved successfully!');
  };

  const todayTracking = getTodayTracking();
  const goals = getCalorieGoals();

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.pageHeader}>
        <View style={styles.headerContent}>
          <Text style={styles.logo}>Profile</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Age</Text>
            <TextInput
              style={styles.input}
              value={age}
              onChangeText={setAge}
              placeholder="Enter your age"
              keyboardType="numeric"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Height (cm)</Text>
            <TextInput
              style={styles.input}
              value={height}
              onChangeText={setHeight}
              placeholder="Enter height in cm"
              keyboardType="numeric"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Weight (kg)</Text>
            <TextInput
              style={styles.input}
              value={weight}
              onChangeText={setWeight}
              placeholder="Enter weight in kg"
              keyboardType="numeric"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Gender</Text>
            <View style={styles.genderContainer}>
              <TouchableOpacity
                style={[styles.genderButton, gender === 'male' && styles.genderButtonActive]}
                onPress={() => setGender('male')}
              >
                <Text style={[styles.genderButtonText, gender === 'male' && styles.genderButtonTextActive]}>
                  Male
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.genderButton, gender === 'female' && styles.genderButtonActive]}
                onPress={() => setGender('female')}
              >
                <Text style={[styles.genderButtonText, gender === 'female' && styles.genderButtonTextActive]}>
                  Female
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Activity Level</Text>
            <View style={styles.activityContainer}>
              {(['sedentary', 'light', 'moderate', 'active', 'very_active'] as const).map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[styles.activityButton, activityLevel === level && styles.activityButtonActive]}
                  onPress={() => setActivityLevel(level)}
                >
                  <Text style={[styles.activityButtonText, activityLevel === level && styles.activityButtonTextActive]}>
                    {level.charAt(0).toUpperCase() + level.slice(1).replace('_', ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Profile</Text>
          </TouchableOpacity>
        </View>

        {goals && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Calorie Goals</Text>
            <View style={styles.goalsCard}>
              <View style={styles.goalItem}>
                <Text style={styles.goalLabel}>BMR (Basal Metabolic Rate)</Text>
                <Text style={styles.goalValue}>{goals.bmr} kcal</Text>
              </View>
              <View style={styles.goalItem}>
                <Text style={styles.goalLabel}>TDEE (Total Daily Energy)</Text>
                <Text style={styles.goalValue}>{goals.tdee} kcal</Text>
              </View>
              <View style={styles.goalItem}>
                <Text style={styles.goalLabel}>Maintenance</Text>
                <Text style={styles.goalValue}>{goals.maintenance} kcal</Text>
              </View>
              <View style={styles.goalItem}>
                <Text style={styles.goalLabel}>Weight Loss (-500 cal)</Text>
                <Text style={[styles.goalValue, { color: '#10B981' }]}>{goals.weightLoss} kcal</Text>
              </View>
              <View style={styles.goalItem}>
                <Text style={styles.goalLabel}>Weight Gain (+500 cal)</Text>
                <Text style={[styles.goalValue, { color: '#EF4444' }]}>{goals.weightGain} kcal</Text>
              </View>
            </View>
          </View>
        )}

        {goals && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today's Progress</Text>
            <View style={styles.progressCard}>
              <View style={styles.progressItem}>
                <Text style={styles.progressLabel}>Calories Consumed</Text>
                <Text style={styles.progressValue}>
                  {Math.round(todayTracking.totalCalories)} / {goals.maintenance} kcal
                </Text>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${Math.min((todayTracking.totalCalories / goals.maintenance) * 100, 100)}%`,
                        backgroundColor: todayTracking.totalCalories > goals.maintenance ? '#EF4444' : '#10B981',
                      },
                    ]}
                  />
                </View>
              </View>
              <View style={styles.macroGrid}>
                <View style={styles.macroItem}>
                  <Text style={styles.macroLabel}>Fat</Text>
                  <Text style={styles.macroValue}>{Math.round(todayTracking.totalFat)}g</Text>
                </View>
                <View style={styles.macroItem}>
                  <Text style={styles.macroLabel}>Carbs</Text>
                  <Text style={styles.macroValue}>{Math.round(todayTracking.totalCarbs)}g</Text>
                </View>
                <View style={styles.macroItem}>
                  <Text style={styles.macroLabel}>Protein</Text>
                  <Text style={styles.macroValue}>{Math.round(todayTracking.totalProtein)}g</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {todayTracking.foods.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today's Foods</Text>
            <View style={styles.foodsList}>
              {todayTracking.foods.map((food) => {
                const nutrition = calculateNutritionForAmount(food.product.nutriments, food.amount);
                return (
                  <View key={food.id} style={styles.foodItem}>
                    {food.product.image_url && (
                      <Image source={{ uri: food.product.image_url }} style={styles.foodImage} />
                    )}
                    <View style={styles.foodInfo}>
                      <Text style={styles.foodName} numberOfLines={1}>
                        {food.product.product_name}
                      </Text>
                      <Text style={styles.foodAmount}>
                        {food.amount.toFixed(0)}g • {Math.round(nutrition.calories)} kcal
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => {
                        Alert.alert(
                          'Remove Food',
                          'Are you sure you want to remove this food from today\'s tracking?',
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
  pageHeader: {
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#111827',
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  genderButton: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    alignItems: 'center',
  },
  genderButtonActive: {
    backgroundColor: '#0096FF',
    borderColor: '#0096FF',
  },
  genderButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#6B7280',
  },
  genderButtonTextActive: {
    color: '#fff',
  },
  activityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  activityButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
  },
  activityButtonActive: {
    backgroundColor: '#0096FF',
    borderColor: '#0096FF',
  },
  activityButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#6B7280',
  },
  activityButtonTextActive: {
    color: '#fff',
  },
  saveButton: {
    backgroundColor: '#0096FF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  goalsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  goalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  goalLabel: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  goalValue: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#111827',
  },
  progressCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  progressItem: {
    marginBottom: 20,
  },
  progressLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  progressValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  macroGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  macroItem: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    alignItems: 'center',
  },
  macroLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  macroValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#111827',
  },
  foodsList: {
    gap: 12,
  },
  foodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
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
  foodInfo: {
    flex: 1,
    gap: 4,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#111827',
  },
  foodAmount: {
    fontSize: 14,
    color: '#6B7280',
  },
  removeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
  },
});

