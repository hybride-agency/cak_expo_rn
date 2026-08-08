import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  ImageBackground,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Svg, {Circle, Path} from 'react-native-svg';
import {SCREEN_PADDING} from '../../../theme';
import {useNavigation} from '@react-navigation/native';
import {useAppDispatch, useAppSelector} from '../../store';
import {
  getFitnessPlan,
  getHomepage,
  getMealPlan,
  getMobilePlans,
  getProfile,
  updateTodayWaterIntake,
} from '../../slice/HomeSlice';
import {setIsLoggedIn} from '../../slice/LoginSlice';
import {setIsPlan, setIsQuestion, setIsWelcome} from '../../slice/WelcomeSlice';
import type {NavigationProp} from '@react-navigation/native';
import type {MainStackParamList} from '../../navigation/MainStack';
import type {
  ApiItem,
  HomepageData,
  HomepageSection,
  MobilePlansData,
  ProfileData,
} from '../../types/home';
import type {FitnessPlan, MealPlan, WorkoutExercise} from '../../types/plans';
import type {AuthResponse} from '../../types/auth';

const ACCENT = '#68FE00';
const BACKGROUND = '#171717';
const SURFACE = '#343434';
const WATER_STEPS = [150, 250, 300, 500, 1000];
const FALLBACK_AVATAR = require('../../../assets/images/male.png');
const FALLBACK_SUBSCRIPTION_IMAGE = require('../../../assets/images/generate.png');
const ListSeparator = () => <View style={styles.listSeparator} />;
const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const HomepageListView = () => {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const dispatch = useAppDispatch();
  const {homepage, profile, mobilePlans, mealPlan, fitnessPlan, loading, refreshing, waterLoading} =
    useAppSelector(state => state.home);
  const loginUser = useAppSelector(state => state.login.user);
  const [selectedWaterStep, setSelectedWaterStep] = useState<number>(250);

  const fetchHomeData = useCallback(async () => {
    const profileResult = await dispatch(getProfile());
    const profileData =
      getProfile.fulfilled.match(profileResult) ? profileResult.payload : null;
    const nextProfile = profileData?.data ?? profileData;
    const homepageAccess = profileData?.homepage_access ?? nextProfile?.homepage_access;
    const canAccess = homepageAccess?.can_access_homepage !== false;

    if (profileHasActivePlan(nextProfile, loginUser)) {
      if (canAccess) {
        dispatch(getHomepage());
        dispatch(getMealPlan());
        dispatch(getFitnessPlan());
      } else {
        // Access blocked - redirect based on codes
        const codes = homepageAccess?.blocking_codes || [];
        if (codes.includes('missing_quiz')) {
          dispatch(setIsQuestion(true));
          dispatch(setIsPlan(false));
          dispatch(setIsWelcome(false));
          dispatch(setIsLoggedIn(false));
        } else if (codes.includes('missing_subscription')) {
          dispatch(setIsQuestion(false));
          dispatch(setIsPlan(true));
          dispatch(setIsWelcome(false));
          dispatch(setIsLoggedIn(false));
        }
      }
    } else {
      dispatch(getMobilePlans());
    }
  }, [dispatch, loginUser]);

  useEffect(() => {
    fetchHomeData();
  }, [fetchHomeData]);

  const resolvedProfile = useMemo(
    () => firstObject(profile?.user, homepage?.user, loginUser?.data?.user, loginUser?.user, profile),
    [homepage, loginUser, profile],
  );

  const fullName = firstString(
    resolvedProfile?.name,
    homepage?.greeting_name,
    loginUser?.data?.user?.name,
    '',
  );
  const firstName = fullName.split(' ')[0] || fullName;
  const avatarUri = firstString(
    resolvedProfile?.avatar_url,
    resolvedProfile?.profile_photo_url,
    resolvedProfile?.image_url,
  );
  const workoutProgressSection = getHomepageSection(homepage, 'workout_progress');
  const weeklyWorkoutSection = getHomepageSection(homepage, 'weekly_workout_overview');
  const tipsSection = getHomepageSection(homepage, 'tips');
  const waterSection = getHomepageSection(homepage, 'water_intake');
  const mealKcalSection = getHomepageSection(homepage, 'meal_kcal_progress');
  const upgradeOffersSection = getHomepageSection(homepage, 'upgrade_offers');

  const subscriptionStatus = normalizeSubscriptionStatus(
    firstString(
      homepage?.subscription?.status,
      homepage?.active_plan?.status,
      profile?.subscription?.status,
      profile?.current_subscription?.status,
      profile?.active_plan?.status,
      loginUser?.data?.active_plan?.status,
      resolvedProfile?.subscription_status,
    ),
  );

  const activePlanAlias = firstString(
    homepage?.plan_info?.active_plan_alias,
    homepage?.plan_info?.plan_name,
    profile?.active_plan?.alias,
    profile?.active_plan?.plan?.alias,
    profile?.active_plan?.name,
    profile?.active_plan?.plan?.name,
    profile?.current_subscription?.plan?.alias,
    profile?.current_subscription?.plan?.name,
    homepage?.active_plan?.alias,
    homepage?.active_plan?.plan?.alias,
    homepage?.active_plan?.name,
    homepage?.active_plan?.plan?.name,
    homepage?.subscription?.plan?.alias,
    homepage?.subscription?.plan?.name,
    loginUser?.data?.active_plan?.alias,
    loginUser?.data?.active_plan?.plan?.alias,
    loginUser?.data?.active_plan?.name,
    loginUser?.data?.active_plan?.plan?.name,
  ).toLowerCase();

  const hasSubscription =
    subscriptionStatus === 'active' ||
    homepage?.plan_info?.is_active ||
    profileHasActivePlan(profile, loginUser) ||
    Boolean(homepage?.active_plan || homepage?.subscription);

  const homepageWater = firstObject(
    waterSection?.progress,
    homepage?.water_intake,
    homepage?.hydration,
    mealPlan?.water_progress,
    mealPlan?.water_intake,
    mealPlan?.hydration,
  );

  const waterGoal = firstNumber(
    homepageWater?.goal_ml,
    homepageWater?.target_ml,
    homepageWater?.daily_goal_ml,
    0,
  );
  const waterTotal = clampNumber(
    firstNumber(
      homepageWater?.total_ml,
      homepageWater?.current_ml,
      homepageWater?.consumed_ml,
      homepageWater?.today_total_ml,
      0,
    ),
    0,
    Math.max(waterGoal, 1),
  );

  const calorieSummary = firstObject(
    mealKcalSection?.progress,
    homepage?.calories,
    mealPlan?.calories,
    mealPlan?.today_progress,
    mealPlan?.daily_summary,
    homepage?.daily_summary,
  );

  const calorieGoal = firstNumber(
    calorieSummary?.goal,
    calorieSummary?.goal_kcal,
    calorieSummary?.target,
    calorieSummary?.target_kcal,
    0,
  );
  const calorieConsumed = firstNumber(
    calorieSummary?.consumed,
    calorieSummary?.consumed_kcal,
    calorieSummary?.eaten,
    calorieSummary?.taken,
    0,
  );
  const calorieRemaining = Math.max(calorieGoal - calorieConsumed, 0);

  const todayWorkout = firstObject(
    workoutProgressSection?.today_next_exercise,
    homepage?.today_workout,
    fitnessPlan?.today_workout,
    fitnessPlan?.current_workout,
    fitnessPlan?.workout,
  );

  const workoutDuration = firstNumber(
    todayWorkout?.duration_minutes,
    todayWorkout?.duration,
    todayWorkout?.minutes,
    todayWorkout?.estimated_minutes,
    0,
  );

  const weeklyBars = useMemo(
    () => buildWeeklyBars(homepage, fitnessPlan, todayWorkout, workoutProgressSection),
    [fitnessPlan, homepage, todayWorkout, workoutProgressSection],
  );

  const promoPlans = useMemo(
    () => buildPromoPlans(homepage, profile, mobilePlans),
    [homepage, mobilePlans, profile],
  );
  const upgradePlans = useMemo(
    () => buildUpgradePlans(upgradeOffersSection),
    [upgradeOffersSection],
  );

  const overviewCards = useMemo(
    () => buildOverviewCards(activePlanAlias, homepage, fitnessPlan, mealPlan, weeklyWorkoutSection),
    [activePlanAlias, fitnessPlan, homepage, mealPlan, weeklyWorkoutSection],
  );

  const tips = useMemo(
    () => buildTips(homepage, mealPlan, activePlanAlias, tipsSection),
    [activePlanAlias, homepage, mealPlan, tipsSection],
  );
  const normalizedPlanAlias = normalizePlanAlias(activePlanAlias);
  const hasWorkoutAccess =
    homepage?.plan_info?.has_workout ||
    ['starter', 'master', 'starter+meal', 'master+meal'].includes(normalizedPlanAlias);
  const showWorkoutSection =
    hasSubscription &&
    (hasWorkoutAccess || Boolean(workoutProgressSection || weeklyWorkoutSection));

  const showWaterSection = hasSubscription && Boolean(waterSection);
  const showCalorieSection = hasSubscription && Boolean(mealKcalSection);
  const nutritionTileCount =
    Number(showWaterSection) + Number(showCalorieSection);

  const onAddWater = (amount: number) => {
    const nextTotal = Math.min(waterTotal + amount, waterGoal);
    setSelectedWaterStep(amount);
    dispatch(updateTodayWaterIntake({total_ml: nextTotal}));
  };

  const openTodayWorkout = () => {
    if (!todayWorkout) return;

    let fullExercise: WorkoutExercise | null = null;
    let sectionName: string | undefined;

    for (const day of fitnessPlan?.days ?? []) {
      for (const section of day.sections ?? []) {
        const match = section.exercises?.find(
          exercise =>
            exercise.exercise_name?.toLowerCase() ===
              todayWorkout.exercise_name?.toLowerCase() ||
            exercise.id === todayWorkout.id,
        );
        if (match) {
          fullExercise = match;
          sectionName = section.section_name;
          break;
        }
      }
      if (fullExercise) break;
    }

    if (fullExercise) {
      navigation.navigate('ExercisePlayerView', {
        exercise: fullExercise,
        sectionName: sectionName || todayWorkout.category,
      });
      return;
    }

    navigation.navigate('WorkoutSectionView', {
      section: toWorkoutSection(todayWorkout),
      dayName: "Today's Workout",
    });
  };

  if (loading && !homepage && !profile && !mealPlan && !fitnessPlan) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={ACCENT} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={fetchHomeData}
              tintColor={ACCENT}
            />
          }>
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={styles.greeting}>Hello, {firstName}!</Text>
              <Text style={styles.subtitle}>You're in. Let's train. CAK style!</Text>
            </View>
            <Image
              source={avatarUri ? {uri: avatarUri} : FALLBACK_AVATAR}
              style={styles.avatar}
            />
          </View>

          {!hasSubscription && promoPlans.length > 0 ? (
            <View style={styles.sectionBlock}>
              <SectionHeader title="" action="See all" />
              <FlatList
                data={promoPlans}
                horizontal
                keyExtractor={item => item.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.promoList}
                ItemSeparatorComponent={ListSeparator}
                renderItem={({item}) => <SubscriptionCard item={item} compact />}
              />
              <View style={styles.pagination}>
                {promoPlans.slice(0, 4).map(item => (
                  <View
                    key={item.id}
                    style={[
                      styles.paginationDot,
                      item.id === promoPlans[0].id && styles.paginationDotActive,
                    ]}
                  />
                ))}
              </View>
            </View>
          ) : null}

          {hasSubscription && upgradePlans.length > 0 ? (
            <View style={styles.sectionBlock}>
              <SectionHeader
                title={firstString(upgradeOffersSection?.title, 'Available upgrades')}
                action="See all"
              />
              <FlatList
                data={upgradePlans}
                horizontal
                keyExtractor={item => item.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.promoList}
                ItemSeparatorComponent={ListSeparator}
                renderItem={({item}) => <SubscriptionCard item={item} compact />}
              />
            </View>
          ) : null}

          {nutritionTileCount > 0 ? (
            <View style={styles.topStatsRow}>
              {showWaterSection ? (
                <WaterCard
                  amount={selectedWaterStep}
                  total={waterTotal}
                  goal={waterGoal}
                  loading={waterLoading}
                  onSelect={setSelectedWaterStep}
                  onAddWater={onAddWater}
                  containerStyle={nutritionTileCount === 1 ? styles.singleStatCard : undefined}
                />
              ) : null}
              {showCalorieSection ? (
                <CalorieRing
                  consumed={calorieConsumed}
                  goal={calorieGoal}
                  remaining={calorieRemaining}
                  containerStyle={nutritionTileCount === 1 ? styles.singleStatCard : undefined}
                />
              ) : null}
            </View>
          ) : null}

          {showWorkoutSection ? (
            <>
              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.quickActionCard}
                disabled={!todayWorkout}
                onPress={openTodayWorkout}>
                <Text style={styles.quickActionTitle}>Today's workout</Text>
                <ChevronRight />
              </TouchableOpacity>

              {weeklyBars.length > 0 ? (
                <View style={styles.progressCard}>
                  <View style={styles.weekBarsRow}>
                    {weeklyBars.map(day => (
                      <View key={day.label} style={styles.barColumn}>
                        <View style={styles.barTrack}>
                          <View
                            style={[
                              styles.barFill,
                              {height: `${Math.max(18, day.value * 100)}%`},
                            ]}
                          />
                        </View>
                        <Text style={styles.barLabel}>{day.label}</Text>
                      </View>
                    ))}
                  </View>

                  <Text style={styles.metaLabel}>Progress</Text>
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>
                      {firstString(
                        todayWorkout?.category,
                        todayWorkout?.type,
                        activePlanAlias.includes('meal') ? 'Nutrition' : 'Workout',
                      )}
                    </Text>
                  </View>

                  <Text style={styles.primaryCardTitle}>
                    {firstString(
                      todayWorkout?.title,
                      todayWorkout?.name,
                      todayWorkout?.focus,
                      "Today's workout",
                    )}
                  </Text>

                  {workoutDuration > 0 ? (
                    <View style={styles.durationRow}>
                      <ClockIcon />
                      <Text style={styles.durationText}>{workoutDuration} mins</Text>
                    </View>
                  ) : null}

                  <TouchableOpacity 
                    activeOpacity={0.9} 
                    disabled={!todayWorkout}
                    onPress={openTodayWorkout}
                    style={styles.primaryCta}
                  >
                    <Text style={styles.primaryCtaText}>Continue To Workout</Text>
                    <View style={styles.primaryCtaIcon}>
                      <ChevronRight dark />
                    </View>
                  </TouchableOpacity>
                </View>
              ) : null}
            </>
          ) : null}

          {overviewCards.length > 0 ? (
            <View style={styles.sectionBlock}>
              <SectionHeader
                title={showWorkoutSection ? 'Weekly Workout Overview' : 'Weekly Meal Overview'}
                action="See all"
              />
              <FlatList
                data={overviewCards}
                horizontal
                keyExtractor={item => item.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.overviewList}
                ItemSeparatorComponent={ListSeparator}
                renderItem={({item}) => <OverviewCard item={item} />}
              />
            </View>
          ) : null}

          {tips.length > 0 ? (
            <View style={styles.sectionBlock}>
              <Text style={styles.tipsTitle}>TIPS</Text>
              <View style={styles.tipCard}>
                <Text style={styles.tipHeadline}>{tips[0].title}</Text>
                <Text style={styles.tipBody}>{tips[0].description}</Text>
              </View>
            </View>
          ) : null}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const SectionHeader = ({title, action}: {title: string; action?: string}) => (
  <View style={styles.sectionHeader}>
    {title ? <Text style={styles.sectionTitle}>{title}</Text> : <View />}
    {action ? <Text style={styles.sectionAction}>{action}</Text> : null}
  </View>
);

const UPGRADE_IMAGE_URL = 'https://d1t9z5ilqoa9lf.cloudfront.net/pages/subs.png';

const SubscriptionCard = ({item, compact = false}: {item: PromoPlan; compact?: boolean}) => (
  <ImageBackground
    source={compact ? {uri: UPGRADE_IMAGE_URL} : (item.image_url ? {uri: item.image_url} : FALLBACK_SUBSCRIPTION_IMAGE)}
    imageStyle={[styles.subscriptionImage, compact && styles.upgradeImage]}
    resizeMode="cover"
    style={[styles.subscriptionCard, compact && styles.upgradeCard]}>
    <View style={styles.subscriptionOverlay} />
    <View style={[styles.subscriptionBody, compact && styles.upgradeBody]}>
      <View style={styles.subscriptionCopy}>
        <Text style={[styles.subscriptionTitle, compact && styles.upgradeTitle]}>{item.name}</Text>
        <Text style={[styles.subscriptionDescription, compact && styles.upgradeDescription]}>
          {item.description}
        </Text>
      </View>
      <View style={[styles.subscriptionPricing, compact && styles.upgradePricing]}>
        <View style={[styles.priceBadge, compact && styles.upgradePriceBadge]}>
          <Text style={[styles.priceValue, compact && styles.upgradePriceValue]}>{item.priceLabel}</Text>
          <Text style={[styles.priceTerm, compact && styles.upgradePriceTerm]}>{item.intervalLabel}</Text>
        </View>
        <TouchableOpacity activeOpacity={0.9} style={[styles.getPlanButton, compact && styles.upgradeGetPlanButton]}>
          <Text style={[styles.getPlanText, compact && styles.upgradeGetPlanText]}>Get Plan</Text>
        </TouchableOpacity>
      </View>
    </View>
  </ImageBackground>
);

const WaterCard = ({
  amount,
  total,
  goal,
  loading,
  onSelect,
  onAddWater,
  containerStyle,
}: {
  amount: number;
  total: number;
  goal: number;
  loading: boolean;
  onSelect: (value: number) => void;
  onAddWater: (value: number) => void;
  containerStyle?: ViewStyle;
}) => (
  <View style={[styles.waterCard, containerStyle]}>
    <Text style={styles.waterTitle}>Water Intake</Text>
    <View style={styles.glassWrap}>
      <View style={styles.glass}>
        <View style={[styles.glassFill, {height: `${Math.max(16, (total / Math.max(goal, 1)) * 100)}%`}]} />
      </View>
    </View>
    <View style={styles.waterControls}>
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.waterArrowButton}
        onPress={() => cycleWaterStep(amount, -1, onSelect)}>
        <Text style={styles.waterArrow}>{'<'}</Text>
      </TouchableOpacity>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        bounces={false}
        contentContainerStyle={styles.waterAmountList}>
        {WATER_STEPS.map(step => (
          <TouchableOpacity
            key={step}
            activeOpacity={0.9}
            onPress={() => onSelect(step)}
            style={[styles.waterPill, amount === step && styles.waterPillActive]}>
            <Text style={[styles.waterPillText, amount === step && styles.waterPillTextActive]}>
              {formatWaterStep(step)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.waterArrowButton}
        onPress={() => cycleWaterStep(amount, 1, onSelect)}>
        <Text style={styles.waterArrow}>{'>'}</Text>
      </TouchableOpacity>
    </View>
    <TouchableOpacity activeOpacity={0.9} style={styles.waterAddButton} onPress={() => onAddWater(amount)}>
      {loading ? (
        <ActivityIndicator size="small" color={BACKGROUND} />
      ) : (
        <Text style={styles.waterAddButtonText}>
          + Add {amount}mL ({total}/{goal}mL)
        </Text>
      )}
    </TouchableOpacity>
  </View>
);

const CalorieRing = ({
  consumed,
  goal,
  remaining,
  containerStyle,
}: {
  consumed: number;
  goal: number;
  remaining: number;
  containerStyle?: ViewStyle;
}) => {
  const size = 138;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(consumed / Math.max(goal, 1), 1);
  const dashOffset = circumference * (1 - progress);

  return (
    <View style={[styles.ringCard, containerStyle]}>
      <Svg width={size} height={size}>
        <Circle
          stroke="#292929"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <Circle
          stroke={ACCENT}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={styles.ringCenter}>
        <Text style={styles.ringValue}>{remaining} Kcal</Text>
        <Text style={styles.ringMeta}>remaining</Text>
        <Text style={styles.ringMeta}>out of {goal}</Text>
      </View>
    </View>
  );
};

const OverviewCard = ({item}: {item: OverviewCardData}) => {
  const isWorkout = item.kind === 'workout';
  
  if (isWorkout) {
    return (
      <View style={[styles.overviewCard, {backgroundColor: '#274318'}]}>
        <View style={styles.overviewContent}>
          <Text style={styles.overviewDay}>{item.title}</Text>
          <ChevronRight />
        </View>
      </View>
    );
  }

  return (
    <ImageBackground
      source={item.image_url ? {uri: item.image_url} : FALLBACK_SUBSCRIPTION_IMAGE}
      imageStyle={styles.overviewImage}
      style={styles.overviewCard}>
      <View style={styles.overviewOverlay} />
      <View style={styles.overviewContent}>
        <Text style={styles.overviewDay}>{item.title}</Text>
        <ChevronRight />
      </View>
    </ImageBackground>
  );
};

const ChevronRight = ({dark = false}: {dark?: boolean}) => (
  <Svg width={28} height={28} viewBox="0 0 28 28" fill="none">
    <Path
      d="M10 6L18 14L10 22"
      stroke={dark ? ACCENT : ACCENT}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ClockIcon = ({small = false}: {small?: boolean}) => (
  <Svg width={small ? 14 : 16} height={small ? 14 : 16} viewBox="0 0 16 16" fill="none">
    <Circle cx="8" cy="8" r="7" stroke="#FFFFFF" strokeWidth="1.5" />
    <Path d="M8 4.5V8L10.5 9.5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
  </Svg>
);

type PromoPlan = {
  id: string;
  name: string;
  description: string;
  priceLabel: string;
  intervalLabel: string;
  image_url?: string;
};

type OverviewCardData = {
  id: string;
  title: string;
  subtitle: string;
  image_url?: string;
  kind: 'meal' | 'workout';
};

const buildPromoPlans = (
  homepage: HomepageData | null,
  profile: ProfileData | null,
  mobilePlans: MobilePlansData | null,
): PromoPlan[] => {
  const sources = [
    ...toArray(homepage?.plans),
    ...toArray(homepage?.recommended_plans),
    ...toArray(homepage?.subscription_plans),
    ...toArray(profile?.available_plans),
    ...toArray(mobilePlans?.plans),
  ];
  const planSection = firstObject(mobilePlans?.section, homepage?.section, profile?.section);
  if (!sources.length) {
    return [];
  }

  return sources.slice(0, 5).map((item, index) => ({
    id: String(item?.id ?? `plan-${index}`),
    name: firstString(item?.name, item?.title, 'Plan'),
    description: firstString(
      item?.description,
      item?.short_description,
      planSection?.description,
      'Enjoy a 7-day free trial. Cancel anytime.',
    ),
    priceLabel: formatOptionalPrice(
      item?.price,
      item?.monthly_price,
      item?.pricings?.[0]?.price,
    ),
    intervalLabel: firstString(
      item?.interval,
      item?.pricings?.[0]?.interval,
      'per month',
    ),
    image_url: firstString(item?.image_url, item?.thumbnail_url, planSection?.image_url),
  }));
};

function buildUpgradePlans(upgradeOffersSection?: HomepageSection): PromoPlan[] {
  return toArray(upgradeOffersSection?.upgrades).map((item, index) => ({
    id: String(item?.id ?? `upgrade-${index}`),
    name: firstString(item?.name, item?.title, 'Upgrade'),
    description: firstString(
      item?.description,
      item?.features,
      'Enjoy a 7-day free trial. Cancel anytime.',
    ),
    priceLabel: formatOptionalPrice(
      item?.starting_price,
      item?.price,
      item?.pricing_options?.[0]?.price,
    ),
    intervalLabel: firstString(
      item?.pricing_options?.[0]?.type === 'monthly' ? 'per month' : '',
      item?.interval,
      'per month',
    ),
    image_url: firstString(item?.image_url, item?.thumbnail_url),
  }));
}

const buildOverviewCards = (
  actionPlan: string,
  homepage: HomepageData | null,
  fitnessPlan: FitnessPlan | null,
  mealPlan: MealPlan | null,
  weeklyWorkoutSection?: HomepageSection,
): OverviewCardData[] => {
  const normalizedPlan = normalizePlanAlias(actionPlan);
  
  const workoutItems = [
    ...toArray(weeklyWorkoutSection?.days),
    ...toArray(homepage?.weekly_workout_overview?.days),
    ...toArray(homepage?.weekly_overview),
    ...toArray(homepage?.workouts),
    ...toArray(fitnessPlan?.days),
  ]
    .slice(0, 7)
    .map((item, index) => ({
      id: `workout-${item?.id ?? index}`,
      title: firstString(item?.day_name, item?.day, item?.title, dayLabels[index % dayLabels.length]),
      subtitle: formatOptionalMetric('mins', item?.duration, item?.duration_minutes, item?.minutes),
      image_url: firstString(item?.image_url, item?.thumbnail_url),
      kind: 'workout' as const,
    }));

  const mealItems = [
    ...toArray(mealPlan?.days),
    ...toArray(homepage?.weekly_progress), // From the JSON provided
    ...toArray(mealPlan?.meals),
    ...toArray(homepage?.meals),
  ]
    .slice(0, 7)
    .map((item, index) => ({
      id: `meal-${item?.id ?? index}`,
      title: firstString(item?.day_name, item?.day, item?.title, item?.name, dayLabels[index % dayLabels.length]),
      subtitle: formatOptionalMetric('kcal', item?.target_kcal, item?.kcal, item?.calories),
      image_url: firstString(item?.image_url, item?.thumbnail_url),
      kind: 'meal' as const,
    }));

  if (['starter+meal', 'master+meal'].includes(normalizedPlan)) {
    // If it's a combo plan, we show meals if we have them, otherwise workouts
    return mealItems.length ? mealItems : workoutItems;
  }

  if (normalizedPlan === 'meal') {
    return mealItems;
  }

  return workoutItems.length ? workoutItems : mealItems;
};

const normalizePlanAlias = (planAlias: string) =>
  planAlias
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/&/g, '+')
    .replace(/plus/g, '+');

const buildTips = (
  homepage: HomepageData | null,
  mealPlan: MealPlan | null,
  actionPlan: string,
  tipsSection?: HomepageSection,
) => {
  const apiTips = [
    ...(tipsSection ? [tipsSection] : []),
    ...toArray(homepage?.tips),
    ...toArray(homepage?.advice),
    ...toArray(mealPlan?.tips),
  ]
    .slice(0, 3)
    .map((item, index) => ({
      id: String(item?.id ?? index),
      title: firstString(item?.title, item?.name, 'Tip'),
      description: firstString(
        item?.message,
        item?.description,
        item?.content,
        '',
      ),
    }));

  return apiTips;
};

const buildWeeklyBars = (
  homepage: HomepageData | null,
  fitnessPlan: FitnessPlan | null,
  todayWorkout: ApiItem | undefined,
  workoutProgressSection?: HomepageSection,
) => {
  const source = [
    ...toArray(workoutProgressSection?.daily_progress),
    ...toArray(homepage?.weekly_progress),
    ...toArray(fitnessPlan?.weekly_progress),
    ...toArray(fitnessPlan?.days),
  ];

  if (!source.length) return [];

  // Filter out duplicates if multiple sources provided
  const uniqueDays = Array.from(new Set(source.map(d => d.date)))
    .map(date => source.find(d => d.date === date))
    .slice(0, 7);

  return uniqueDays.map((item, index) => ({
    label: `Day ${item?.day_number ?? index + 1}`,
    value: clampNumber(
      (firstNumber(item?.completion_percentage, item?.progress, 0)) / 100,
      0.18,
      1,
    ),
  }));
};

const getHomepageSection = (homepage: HomepageData | null, type: string) =>
  toArray(homepage?.sections).find(section => section?.type === type);

const normalizeSubscriptionStatus = (value: string) => value.trim().toLowerCase();

const profileHasActivePlan = (
  profile: ProfileData | null | undefined,
  loginUser: AuthResponse | null,
) =>
  Boolean(
    profile?.active_plan ||
      profile?.current_subscription ||
      profile?.subscription ||
      profile?.user?.has_active_plan ||
      profile?.has_active_plan ||
      loginUser?.data?.active_plan ||
      loginUser?.data?.user?.has_active_plan,
  );

const cycleWaterStep = (
  current: number,
  direction: -1 | 1,
  onChange: (value: number) => void,
) => {
  const index = WATER_STEPS.indexOf(current);
  const nextIndex =
    index === -1
      ? 0
      : (index + direction + WATER_STEPS.length) % WATER_STEPS.length;
  onChange(WATER_STEPS[nextIndex]);
};

const formatWaterStep = (value: number) =>
  value >= 1000 && value % 1000 === 0 ? `${value / 1000}L` : `${value}mL`;

const toWorkoutSection = (value?: ApiItem) => ({
  id: Number(value?.id ?? 0),
  section_name: firstString(value?.category, value?.title, value?.name, 'Workout'),
  exercises: value?.exercises ?? [],
});

const toArray = (value: unknown): ApiItem[] =>
  Array.isArray(value)
    ? value.filter(
        (item): item is ApiItem =>
          typeof item === 'object' && item !== null && !Array.isArray(item),
      )
    : [];

const firstObject = (...values: unknown[]): ApiItem | undefined =>
  values.find(
    (value): value is ApiItem =>
      typeof value === 'object' && value !== null && !Array.isArray(value),
  );

const firstString = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim().length) return value.trim();
  }
  return '';
};

const firstNumber = (...values: unknown[]) => {
  for (const value of values) {
    const numeric =
      typeof value === 'number'
        ? value
        : typeof value === 'string'
        ? Number(value.replace(/[^0-9.-]/g, ''))
        : NaN;
    if (!Number.isNaN(numeric) && Number.isFinite(numeric)) {
      return numeric;
    }
  }
  return 0;
};

const firstOptionalNumber = (...values: unknown[]): number | null => {
  for (const value of values) {
    const numeric =
      typeof value === 'number'
        ? value
        : typeof value === 'string'
          ? Number(value.replace(/[^0-9.-]/g, ''))
          : NaN;
    if (Number.isFinite(numeric)) return numeric;
  }
  return null;
};

const formatOptionalPrice = (...values: unknown[]) => {
  const value = firstOptionalNumber(...values);
  return value === null ? '' : `${value}$`;
};

const formatOptionalMetric = (unit: string, ...values: unknown[]) => {
  const value = firstOptionalNumber(...values);
  return value === null ? '' : `${value} ${unit}`;
};

const clampNumber = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  loadingScreen: {
    flex: 1,
    backgroundColor: BACKGROUND,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 170,
  },
  header: {
    marginTop: 14,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
  },
  greeting: {
    color: '#FFFFFF',
    fontSize: 28,
    fontFamily: 'Raleway-Black',
    includeFontPadding: false,
    marginBottom: 6,
  },
  subtitle: {
    color: '#E7E7E7',
    fontSize: 14,
    fontFamily: 'Raleway-Regular',
    includeFontPadding: false,
  },
  avatar: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: '#4B4B4B',
    flexShrink: 0,
  },
  sectionBlock: {
    marginBottom: 26,
  },
  sectionHeader: {
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Raleway-Bold',
    includeFontPadding: false,
  },
  sectionAction: {
    color: ACCENT,
    fontSize: 14,
    fontFamily: 'Raleway-Bold',
    includeFontPadding: false,
  },
  promoList: {
    paddingRight: SCREEN_PADDING.right,
  },
  listSeparator: {
    width: 18,
  },
  subscriptionCard: {
    width: 290,
    minHeight: 160,
    overflow: 'hidden',
    borderRadius: 28,
    justifyContent: 'flex-end',
  },
  upgradeCard: {
    width: 279,
    minHeight: 112,
    height: 112,
    borderRadius: 22,
    backgroundColor: '#244915',
  },
  subscriptionImage: {
    borderRadius: 28,
  },
  upgradeImage: {
    borderRadius: 22,
    top: 0,
    bottom: undefined,
    height: 132,
  },
  subscriptionOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(40, 84, 18, 0.46)',
  },
  subscriptionBody: {
    paddingHorizontal: 26,
    paddingVertical: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 14,
  },
  upgradeBody: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    gap: 10,
  },
  subscriptionCopy: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'space-between',
  },
  subscriptionTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontFamily: 'Raleway-Black',
    includeFontPadding: false,
    marginBottom: 12,
  },
  upgradeTitle: {
    fontSize: 18,
    marginBottom: 6,
  },
  subscriptionDescription: {
    color: '#FFFFFF',
    fontSize: 13,
    lineHeight: 18,
    fontFamily: 'Raleway-Medium',
  },
  upgradeDescription: {
    fontSize: 7,
    lineHeight: 9,
  },
  subscriptionPricing: {
    width: 112,
    flexShrink: 0,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  upgradePricing: {
    width: 90,
  },
  priceBadge: {
    borderWidth: 3,
    borderColor: ACCENT,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minWidth: 106,
  },
  upgradePriceBadge: {
    minWidth: 74,
    borderRadius: 14,
    borderWidth: 2,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  priceValue: {
    color: '#FFFFFF',
    fontSize: 30,
    fontFamily: 'Raleway-Black',
    includeFontPadding: false,
    textAlign: 'center',
  },
  upgradePriceValue: {
    fontSize: 25,
  },
  priceTerm: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Raleway-Medium',
    includeFontPadding: false,
    textAlign: 'center',
  },
  upgradePriceTerm: {
    fontSize: 8,
  },
  getPlanButton: {
    backgroundColor: ACCENT,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 9,
  },
  upgradeGetPlanButton: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  getPlanText: {
    color: BACKGROUND,
    fontSize: 14,
    fontFamily: 'Raleway-Bold',
    includeFontPadding: false,
  },
  upgradeGetPlanText: {
    fontSize: 10,
  },
  pagination: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#777777',
  },
  paginationDotActive: {
    backgroundColor: '#FFFFFF',
  },
  topStatsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    marginBottom: 28,
    width: '100%',
  },
  singleStatCard: {
    width: '100%',
  },
  waterCard: {
    width: '47%',
    minWidth: 0,
    backgroundColor: '#3A3A3A',
    borderRadius: 22,
    paddingHorizontal: 10,
    paddingVertical: 14,
    shadowColor: '#000000',
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 6},
    elevation: 8,
  },
  waterTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'Raleway-Black',
    includeFontPadding: false,
    textAlign: 'center',
    marginBottom: 8,
  },
  glassWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  glass: {
    width: 34,
    height: 68,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  glassFill: {
    position: 'absolute',
    left: 2,
    right: 2,
    bottom: 2,
    borderRadius: 7,
    backgroundColor: '#6BCFFF',
  },
  waterControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    width: '100%',
    overflow: 'hidden',
  },
  waterArrowButton: {
    width: 18,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  waterArrow: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Raleway-Bold',
    includeFontPadding: false,
    textAlign: 'center',
  },
  waterAmountList: {
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 4,
  },
  waterPill: {
    borderRadius: 16,
    paddingHorizontal: 6,
    paddingVertical: 4,
    minWidth: 48,
    alignItems: 'center',
  },
  waterPillActive: {
    backgroundColor: ACCENT,
  },
  waterPillText: {
    color: '#CFCFCF',
    fontSize: 10,
    fontFamily: 'Raleway-Medium',
    includeFontPadding: false,
  },
  waterPillTextActive: {
    color: BACKGROUND,
    fontFamily: 'Raleway-Bold',
  },
  waterAddButton: {
    backgroundColor: '#232323',
    borderRadius: 16,
    paddingVertical: 9,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  waterAddButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: 'Raleway-SemiBold',
    includeFontPadding: false,
    textAlign: 'center',
  },
  ringCard: {
    width: '47%',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 178,
    minWidth: 0,
    overflow: 'hidden',
  },
  ringCenter: {
    position: 'absolute',
    alignItems: 'center',
  },
  ringValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Raleway-Bold',
    includeFontPadding: false,
    marginBottom: 4,
  },
  ringMeta: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'Raleway-Medium',
    includeFontPadding: false,
  },
  quickActionCard: {
    backgroundColor: SURFACE,
    borderRadius: 22,
    paddingHorizontal: 28,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  quickActionTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontFamily: 'Raleway-Black',
    includeFontPadding: false,
    flexShrink: 1,
    paddingRight: 12,
  },
  progressCard: {
    backgroundColor: '#3A3A3A',
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingVertical: 24,
    marginBottom: 30,
    shadowColor: '#000000',
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 6},
    elevation: 8,
  },
  weekBarsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 22,
    width: '100%',
  },
  barColumn: {
    alignItems: 'center',
    width: `${100 / 7}%`,
  },
  barTrack: {
    width: 18,
    height: 142,
    borderRadius: 12,
    backgroundColor: '#000000',
    justifyContent: 'flex-end',
    paddingBottom: 0,
    overflow: 'hidden',
    marginBottom: 10,
  },
  barFill: {
    width: '100%',
    borderRadius: 12,
    backgroundColor: ACCENT,
  },
  barLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Raleway-Medium',
    includeFontPadding: false,
  },
  metaLabel: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: 'Raleway-Medium',
    includeFontPadding: false,
    marginBottom: 12,
  },
  tag: {
    alignSelf: 'flex-start',
    backgroundColor: ACCENT,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginBottom: 12,
  },
  tagText: {
    color: BACKGROUND,
    fontSize: 12,
    fontFamily: 'Raleway-Bold',
    includeFontPadding: false,
  },
  primaryCardTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontFamily: 'Raleway-Black',
    includeFontPadding: false,
    marginBottom: 10,
    flexShrink: 1,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 22,
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: 'Raleway-Medium',
    includeFontPadding: false,
  },
  primaryCta: {
    backgroundColor: ACCENT,
    borderRadius: 28,
    paddingLeft: 22,
    paddingRight: 10,
    paddingVertical: 10,
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  primaryCtaText: {
    color: BACKGROUND,
    fontSize: 18,
    fontFamily: 'Raleway-Black',
    includeFontPadding: false,
    flexShrink: 1,
    paddingRight: 12,
  },
  primaryCtaIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#313131',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overviewList: {
    paddingRight: SCREEN_PADDING.right,
  },
  overviewCard: {
    width: 220,
    height: 300,
    borderRadius: 24,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  overviewImage: {
    borderRadius: 24,
  },
  overviewOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  overviewContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 25,
  },
  overviewCopy: {
    flex: 1,
    minWidth: 0,
  },
  overviewDay: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: 'Raleway-Black',
    includeFontPadding: false,
    marginBottom: 6,
    flexShrink: 1,
  },
  overviewDurationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  overviewDuration: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Raleway-Medium',
    includeFontPadding: false,
  },
  tipsTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Raleway-Black',
    includeFontPadding: false,
    marginBottom: 14,
  },
  tipCard: {
    backgroundColor: ACCENT,
    borderRadius: 28,
    minHeight: 220,
    paddingHorizontal: 24,
    paddingVertical: 22,
    justifyContent: 'center',
  },
  tipHeadline: {
    color: BACKGROUND,
    fontSize: 22,
    fontFamily: 'Raleway-Black',
    includeFontPadding: false,
    marginBottom: 12,
  },
  tipBody: {
    color: BACKGROUND,
    fontSize: 15,
    lineHeight: 24,
    fontFamily: 'Raleway-Medium',
  },
});

export default HomepageListView;
