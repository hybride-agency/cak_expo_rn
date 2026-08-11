import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Svg, {Path} from 'react-native-svg';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useAppDispatch} from '../../store';
import {updateMealCompletion} from '../../slice/HomeSlice';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RouteProp} from '@react-navigation/native';
import type {MealStackParamList} from '../../navigation/MainStack';

const ACCENT = '#8FFF19';
const BACKGROUND = '#171717';

type MealDetailsRouteProp = RouteProp<MealStackParamList, 'MealDetailsView'>;

const MealDetailsView = () => {
  const navigation = useNavigation<NativeStackNavigationProp<MealStackParamList>>();
  const route = useRoute<MealDetailsRouteProp>();
  const dispatch = useAppDispatch();
  const {meal} = route.params;

  const handleToggleDone = () => {
    if (meal.rawId !== undefined && meal.rawId !== null) {
      dispatch(
        updateMealCompletion({
          userMealId: Number(meal.rawId),
          is_completed: !meal.is_completed,
        }),
      );
      // Go back after toggling
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <Path d="M15 18L9 12L15 6" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{meal.label}</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={[styles.mealTitle, {marginTop: 24}]}>{meal.title}</Text>
          <Text style={styles.mealKcal}>{meal.kcal} Kcal</Text>

          <View style={styles.macroRow}>
            <View style={styles.macroBox}>
              <Text style={styles.macroValue}>{meal.protein || '0g'}</Text>
              <Text style={styles.macroLabel}>Protein</Text>
            </View>
            <View style={styles.macroBox}>
              <Text style={styles.macroValue}>{meal.carbs || '0g'}</Text>
              <Text style={styles.macroLabel}>Carbs</Text>
            </View>
            <View style={styles.macroBox}>
              <Text style={styles.macroValue}>{meal.fat || '0g'}</Text>
              <Text style={styles.macroLabel}>Fat</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ingredients</Text>
            {meal.ingredients && meal.ingredients.length > 0 ? (
              meal.ingredients.map((ingredient, idx) => (
                <View key={idx} style={styles.listItem}>
                  <View style={styles.bullet} />
                  <Text style={styles.listText}>{ingredient}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No ingredients listed.</Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preparation Steps</Text>
            {meal.recipe && meal.recipe.length > 0 ? (
              meal.recipe.map((step, idx) => (
                <View key={idx} style={styles.listItem}>
                  <Text style={styles.stepNumber}>{idx + 1}.</Text>
                  <Text style={styles.listText}>{step}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No preparation steps listed.</Text>
            )}
          </View>

        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.actionButton, meal.is_completed && styles.actionButtonDone]} 
            activeOpacity={0.8}
            onPress={handleToggleDone}
          >
            <Text style={[styles.actionButtonText, meal.is_completed && styles.actionButtonTextDone]}>
              {meal.is_completed ? 'Mark as Undone' : 'Mark as Done'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1, 
    backgroundColor: BACKGROUND
  },
  container: {
    flex: 1, 
    backgroundColor: BACKGROUND
  },
  header: {
    height: 60, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  backButton: {
    width: 40, 
    height: 40, 
    justifyContent: 'center'
  },
  headerTitle: {
    color: '#888', 
    fontSize: 16, 
    fontFamily: 'Raleway-Bold', 
    includeFontPadding: false
  },
  headerSpacer: {
    width: 40
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  mealTitle: {
    color: '#FFF', 
    fontSize: 28, 
    fontFamily: 'Raleway-Bold', 
    marginBottom: 8,
  },
  mealKcal: {
    color: ACCENT, 
    fontSize: 18, 
    fontFamily: 'Raleway-Bold', 
    marginBottom: 24,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#2A2A2A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
  },
  macroBox: {
    alignItems: 'center',
  },
  macroValue: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Raleway-Bold',
    marginBottom: 4,
  },
  macroLabel: {
    color: '#888',
    fontSize: 12,
    fontFamily: 'Raleway-Medium',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 20,
    fontFamily: 'Raleway-Bold',
    marginBottom: 16,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: ACCENT,
    marginTop: 8,
    marginRight: 12,
  },
  stepNumber: {
    color: ACCENT,
    fontSize: 16,
    fontFamily: 'Raleway-Bold',
    marginRight: 12,
    width: 20,
  },
  listText: {
    color: '#CCC',
    fontSize: 16,
    fontFamily: 'Raleway-Medium',
    lineHeight: 24,
    flex: 1,
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
    fontFamily: 'Raleway-Medium',
    fontStyle: 'italic',
  },
  footer: {
    padding: 24,
    paddingBottom: 34, // Safe area bottom padding roughly
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
  },
  actionButton: {
    backgroundColor: ACCENT,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  actionButtonDone: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: ACCENT,
  },
  actionButtonText: {
    color: '#000',
    fontSize: 18,
    fontFamily: 'Raleway-Bold',
  },
  actionButtonTextDone: {
    color: ACCENT,
  }
});

export default MealDetailsView;
