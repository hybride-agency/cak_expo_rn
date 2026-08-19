import React, {useEffect, useMemo} from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Svg, {Path, Circle} from 'react-native-svg';
import {getMealPlan} from '../../slice/HomeSlice';
import {useAppDispatch, useAppSelector} from '../../store';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {MealStackParamList} from '../../navigation/MainStack';
import type {DisplayMeal, MealPlanDay} from '../../types/plans';

const ACCENT = '#8FFF19';
const BACKGROUND = '#171717';

// Plan endpoints may send "2026-08-09" or "2026-08-09T00:00:00.000000Z";
// compare on the calendar date alone.
const isoDate = (value?: string) => value?.slice(0, 10);

// Today where the user is. toISOString() would report the UTC day, which is
// already tomorrow (or still yesterday) for much of the world.
const localIsoDate = () => {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, '0');

  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

const MealPlannerView = () => {
  const navigation = useNavigation<NativeStackNavigationProp<MealStackParamList>>();
  const route = useRoute<RouteProp<MealStackParamList, 'MealPlannerView'>>();
  const requestedDate = route.params?.date;
  const dispatch = useAppDispatch();
  const {mealPlan, loading} = useAppSelector(state => state.home);
  const [selectedDayIndex, setSelectedDayIndex] = React.useState(0);
  
  const days = useMemo(() => mealPlan?.days ?? [], [mealPlan]);
  const activeDay = days[selectedDayIndex] || days[0];
  const meals = useMemo(() => buildMeals(activeDay), [activeDay]);

  const hasSyncedToday = React.useRef(false);

  useEffect(() => {
    dispatch(getMealPlan());
  }, [dispatch]);

  // Sync selectedDayIndex to "today" if available on first load only
  useEffect(() => {
    if (mealPlan?.days && !hasSyncedToday.current) {
      const today = localIsoDate();
      const todayIndex = mealPlan.days.findIndex(d => isoDate(d.date) === today);
      if (todayIndex !== -1) {
        setSelectedDayIndex(todayIndex);
      }
      hasSyncedToday.current = true;
    }
  }, [mealPlan]);

  // Opening a specific day from elsewhere wins over the today sync above, and
  // re-runs if the screen is already mounted when another day is picked.
  useEffect(() => {
    if (!requestedDate || days.length === 0) {
      return;
    }

    const index = days.findIndex(day => isoDate(day.date) === requestedDate);

    if (index !== -1) {
      setSelectedDayIndex(index);
      hasSyncedToday.current = true;
    }
  }, [days, requestedDate]);

  const formattedDate = useMemo(() => {
    if (!activeDay?.date) return 'Meal Plan';
    const date = new Date(activeDay.date);
    return date.toLocaleDateString('en-US', {weekday: 'long', day: 'numeric', month: 'long'});
  }, [activeDay]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <ScrollView 
          contentContainerStyle={styles.content} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={() => dispatch(getMealPlan())}
              tintColor={ACCENT}
            />
          }
        >
          <Header title="Meal Planner" onBack={() => navigation.goBack()} />
          
          <WeekStrip 
            days={days} 
            selectedIndex={selectedDayIndex} 
            onSelect={setSelectedDayIndex} 
          />

          <View style={styles.dateRow}>
            <Text style={styles.dateTitle}>{formattedDate}</Text>
            {activeDay?.is_training_day === false ? (
              <View style={styles.restBadge}>
                <Text style={styles.restBadgeText}>REST DAY</Text>
              </View>
            ) : null}
          </View>

          {activeDay?.is_training_day === false ? (
            <Text style={styles.restNote}>
              Lighter on calories because you&apos;re not training today, with
              protein kept high to help you recover.
            </Text>
          ) : null}

          {activeDay?.is_training_day !== false ? (
            <View style={styles.dateSpacer} />
          ) : null}

          {loading && !mealPlan ? (
            <ActivityIndicator color={ACCENT} style={{marginTop: 50}} />
          ) : (
            meals.length > 0 ? (
              meals.map(meal => (
                <MealRow
                  key={meal.id}
                  meal={meal}
                  onToggle={() => {
                    navigation.navigate('MealDetailsView', { meal });
                  }}
                />
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No meals planned for this day.</Text>
              </View>
            )
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const Header = ({title, onBack}: {title: string; onBack: () => void}) => (
  <View style={styles.header}>
    <TouchableOpacity onPress={onBack} style={styles.backButton}>
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Path d="M15 18L9 12L15 6" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    </TouchableOpacity>
    <Text style={styles.headerTitle}>{title}</Text>
    <View style={styles.headerSpacer} />
  </View>
);

const getWeekdayLabel = (date?: string) => {
  // Noon avoids the date shifting a day either side of UTC.
  const parsed = date ? new Date(`${date}T12:00:00`) : null;

  return parsed
    ? parsed.toLocaleDateString('en-US', {weekday: 'short'})
    : 'Day';
};

const WeekStrip = ({days, selectedIndex, onSelect}: {days: MealPlanDay[]; selectedIndex: number; onSelect: (i: number) => void}) => {
  const displayDays = useMemo(() => {
    return days;
  }, [days]);

  return (
    <View style={styles.weekStrip}>
      {displayDays.map((item, index) => {
        const isActive = index === selectedIndex;
        const dayLabel =
          (item.day_label || item.day_name)?.slice(0, 3) ||
          getWeekdayLabel(item.date);
        const dateNum = item.date ? item.date.split('-').pop() : '00';
        
        return (
          <TouchableOpacity 
            key={index} 
            activeOpacity={0.8}
            onPress={() => onSelect(index)}
            style={[styles.dayItem, isActive && styles.dayItemActive]}
          >
            <Text style={[styles.dayLabel, isActive && styles.dayLabelActive]}>{dayLabel}</Text>
            <View style={[styles.dateCircle, isActive && styles.dateCircleActive]}>
              <Text style={[styles.dateText, isActive && styles.dateTextActive]}>{dateNum}</Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const MealRow = ({meal, onToggle}: {meal: DisplayMeal; onToggle: () => void}) => (
  <View style={styles.mealBlock}>
    <Text style={styles.sectionHeader}>{meal.label}</Text>
    <TouchableOpacity 
      activeOpacity={0.7}
      onPress={onToggle}
      style={styles.mealCard}
    >
      <View style={styles.mealInfo}>
        <View style={styles.mealTitleRow}>
          <Text style={styles.mealTitle}>{meal.title}</Text>
          {meal.is_completed && (
            <View style={styles.completionBadge}>
               <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                <Circle cx="12" cy="12" r="10" fill={ACCENT} />
                <Path d="M8 12L11 15L16 9" stroke={BACKGROUND} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </View>
          )}
        </View>
        <Text style={styles.mealKcal}>{meal.kcal} Kcal</Text>
        
        <View style={styles.macroRow}>
          <Text style={styles.macroText}>{meal.protein || '0g Pro'}</Text>
          <Text style={styles.macroText}>{meal.carbs || '0g Carbs'}</Text>
          <Text style={styles.macroText}>{meal.fat || '0g Fat'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  </View>
);

const buildMeals = (dayData?: MealPlanDay): DisplayMeal[] => {
  const allMeals = dayData?.meals ?? [];

  return allMeals.map((item, index) => {
    const protein = firstNumber(item?.protein_g, item?.protein);
    const carbs = firstNumber(item?.carbs_g, item?.carbs);
    const fat = firstNumber(item?.fat_g, item?.fat);

    return {
      id: String(item?.id ?? index),
      rawId: item?.id,
      label: firstString(
        item?.slot?.replace('_', ' '),
        item?.type,
        item?.meal_type,
        item?.label,
        'MEAL',
      ).toUpperCase(),
      title: firstString(item?.title, item?.name, 'Meal'),
      kcal: firstNumber(
        item?.kcal,
        item?.calories,
        item?.calories_kcal,
        0,
      ),
      protein: protein ? `${protein}g Pro` : '',
      carbs: carbs ? `${carbs}g Carbs` : '',
      fat: fat ? `${fat}g Fat` : '',
      image_url: firstString(item?.image_url, item?.thumbnail_url),
      is_completed: Boolean(item?.is_completed || item?.completed),
      ingredients: item?.ingredients || [],
      recipe: item?.recipe || [],
    };
  });
};

const firstString = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
};
const firstNumber = (...values: unknown[]): number | string => {
  for (const value of values) {
    if ((typeof value === 'string' || typeof value === 'number') && Number.isFinite(Number(value))) {
      return value;
    }
  }
  return 0;
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
  content: {
    paddingHorizontal: 24, 
    paddingBottom: 150
  },
  header: {
    height: 80, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    marginBottom: 10
  },
  backButton: {
    width: 40, 
    height: 40, 
    justifyContent: 'center'
  },
  headerTitle: {
    color: '#FFF', 
    fontSize: 22, 
    fontFamily: 'Raleway-Bold', 
    includeFontPadding: false
  },
  headerSpacer: {
    width: 40
  },
  weekStrip: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 40,
    alignItems: 'center'
  },
  dayItem: {
    alignItems: 'center',
    paddingVertical: 10,
    width: 45,
  },
  dayItemActive: {
    backgroundColor: ACCENT,
    borderRadius: 22,
    height: 80,
    justifyContent: 'center'
  },
  dayLabel: {
    color: '#888', 
    fontSize: 12, 
    fontFamily: 'Raleway-Bold',
    marginBottom: 8
  },
  dayLabelActive: {
    color: '#333',
  },
  dateCircle: {
    width: 30, 
    height: 30, 
    borderRadius: 15, 
    backgroundColor: '#222', 
    alignItems: 'center', 
    justifyContent: 'center'
  },
  dateCircleActive: {
    backgroundColor: '#1A3D0C', // Darker green inside the pill
  },
  dateText: {
    color: '#FFF', 
    fontSize: 12, 
    fontFamily: 'Raleway-Bold'
  },
  dateTextActive: {
    color: ACCENT,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 8,
  },
  dateTitle: {
    color: '#FFF',
    fontSize: 24,
    fontFamily: 'Raleway-Bold',
    flexShrink: 1,
  },
  restBadge: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  restBadgeText: {
    color: ACCENT,
    fontSize: 10,
    fontFamily: 'Raleway-Bold',
    letterSpacing: 0.5,
  },
  dateSpacer: {height: 16},
  restNote: {
    color: '#9B9B9B',
    fontSize: 13,
    fontFamily: 'Raleway-Medium',
    lineHeight: 19,
    marginBottom: 20,
  },
  mealBlock: {
    marginBottom: 32
  },
  sectionHeader: {
    color: '#888', 
    fontSize: 14, 
    fontFamily: 'Raleway-Bold', 
    marginBottom: 16,
    letterSpacing: 1
  },
  mealCard: {
    flexDirection: 'row', 
    alignItems: 'center',
  },
  imageContainer: {
    width: 100, 
    height: 100, 
    borderRadius: 20, 
    backgroundColor: '#222', 
    overflow: 'hidden',
    marginRight: 20
  },
  mealImage: {
    width: '100%', 
    height: '100%'
  },
  placeholderImage: {
    width: '100%', 
    height: '100%', 
    backgroundColor: '#333'
  },
  mealInfo: {
    flex: 1,
    justifyContent: 'center'
  },
  mealTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  mealTitle: {
    color: '#FFF', 
    fontSize: 18, 
    fontFamily: 'Raleway-Bold', 
    includeFontPadding: false,
    lineHeight: 22,
    flex: 1,
    marginRight: 10
  },
  mealKcal: {
    color: '#888', 
    fontSize: 14, 
    fontFamily: 'Raleway-Medium', 
    marginTop: 4
  },
  macroRow: {
    flexDirection: 'row', 
    gap: 15, 
    marginTop: 20
  },
  macroText: {
    color: '#666', 
    fontSize: 12, 
    fontFamily: 'Raleway-Medium'
  },
  completionBadge: {
    width: 24,
    height: 24,
    marginLeft: 10
  },
  emptyContainer: {
    marginTop: 60,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    fontFamily: 'Raleway-Medium',
  },
});

export default MealPlannerView;
