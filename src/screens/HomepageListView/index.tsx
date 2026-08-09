import type { NavigationProp } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, Path } from "react-native-svg";
import { SCREEN_PADDING } from "../../../theme";
import type { MainStackParamList } from "../../navigation/MainStack";
import {
  getFitnessPlan,
  getHomepage,
  getMealPlan,
  getMobilePlans,
  getProfile,
  updateTodayWaterIntake,
} from "../../slice/HomeSlice";
import { setIsLoggedIn } from "../../slice/LoginSlice";
import {
  setIsPlan,
  setIsQuestion,
  setIsWelcome,
} from "../../slice/WelcomeSlice";
import { useAppDispatch, useAppSelector } from "../../store";
import type { AuthResponse } from "../../types/auth";
import type {
  ApiItem,
  HomepageData,
  HomepageSection,
  MobilePlansData,
  ProfileData,
} from "../../types/home";
import type { FitnessPlan, MealPlan, WorkoutExercise } from "../../types/plans";
import WaterGlass from "./WaterGlass";

const ACCENT = "#68FE00";
const BACKGROUND = "#171717";
const SURFACE = "#232323";
const MUTED = "#9B9B9B";
const WATER_STEPS = [150, 250, 300, 500, 1000];
const FALLBACK_AVATAR = require("../../../assets/images/male.png");
const FALLBACK_SUBSCRIPTION_IMAGE = require("../../../assets/images/generate.png");
// Stand-ins for days the API sends without an image_url. LoremFlickr serves
// free keyword-matched photos with no API key; ?lock pins each slot to one
// image so a card never changes photo between renders.
const WORKOUT_FALLBACK_IMAGE_COUNT = 12;
const workoutFallbackUri = (slot: number) =>
  `https://loremflickr.com/600/800/gym,workout,fitness?lock=${slot}`;
const mealFallbackUri = (slot: number) =>
  `https://loremflickr.com/600/800/food,meal,healthy?lock=${slot}`;
const ListSeparator = () => <View style={styles.listSeparator} />;
const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const HomepageListView = () => {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const dispatch = useAppDispatch();
  const {
    homepage,
    profile,
    mobilePlans,
    mealPlan,
    fitnessPlan,
    loading,
    refreshing,
    waterLoading,
  } = useAppSelector((state) => state.home);
  const loginUser = useAppSelector((state) => state.login.user);
  const [selectedWaterStep, setSelectedWaterStep] = useState<number>(250);

  const fetchHomeData = useCallback(async () => {
    const profileResult = await dispatch(getProfile());
    const profileData = getProfile.fulfilled.match(profileResult)
      ? profileResult.payload
      : null;
    const nextProfile = profileData?.data ?? profileData;
    const homepageAccess =
      profileData?.homepage_access ?? nextProfile?.homepage_access;
    const canAccess = homepageAccess?.can_access_homepage !== false;

    if (profileHasActivePlan(nextProfile, loginUser)) {
      if (canAccess) {
        dispatch(getHomepage());
        dispatch(getMealPlan());
        dispatch(getFitnessPlan());
      } else {
        // Access blocked - redirect based on codes
        const codes = homepageAccess?.blocking_codes || [];
        if (codes.includes("missing_quiz")) {
          dispatch(setIsQuestion(true));
          dispatch(setIsPlan(false));
          dispatch(setIsWelcome(false));
          dispatch(setIsLoggedIn(false));
        } else if (codes.includes("missing_subscription")) {
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

  // Tapping the Home tab refreshes, including when this screen is already
  // showing — which is the case a focus listener would miss.
  useEffect(() => {
    const parent = navigation.getParent();

    return parent?.addListener("tabPress" as never, () => {
      dispatch(getHomepage());
    });
  }, [dispatch, navigation]);

  const resolvedProfile = useMemo(
    () =>
      firstObject(
        profile?.user,
        homepage?.user,
        loginUser?.data?.user,
        loginUser?.user,
        profile,
      ),
    [homepage, loginUser, profile],
  );

  const fullName = firstString(
    resolvedProfile?.name,
    homepage?.greeting_name,
    loginUser?.data?.user?.name,
    "",
  );
  const firstName = fullName.split(" ")[0] || fullName;
  const avatarUri = firstString(
    resolvedProfile?.avatar_url,
    resolvedProfile?.profile_photo_url,
    resolvedProfile?.image_url,
  );
  const workoutProgressSection = getHomepageSection(
    homepage,
    "workout_progress",
  );
  const weeklyWorkoutSection = getHomepageSection(
    homepage,
    "weekly_workout_overview",
  );
  const tipsSection = getHomepageSection(homepage, "tips");
  const waterSection = getHomepageSection(homepage, "water_intake");
  const mealKcalSection = getHomepageSection(homepage, "meal_kcal_progress");
  const upgradeOffersSection = getHomepageSection(homepage, "upgrade_offers");
  const mealDaysSection = getHomepageSection(homepage, "meal_days_preview");

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
    subscriptionStatus === "active" ||
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

  // today_next_exercise carries the exercise but not the day's focus, so pair
  // it with the matching daily_progress row.
  const todayProgress = useMemo(() => {
    const days = toArray(workoutProgressSection?.daily_progress);
    const today = localIsoDate();

    return (
      days.find((day) => isoDate(day?.date) === today) ??
      days.find(
        (day) =>
          todayWorkout?.id !== undefined &&
          (day?.next_exercise as ApiItem | undefined)?.id === todayWorkout.id,
      )
    );
  }, [todayWorkout, workoutProgressSection]);

  const workoutDuration = firstNumber(
    todayWorkout?.day_total_estimated_minutes,
    todayProgress?.total_estimated_minutes,
    todayWorkout?.duration_minutes,
    todayWorkout?.duration,
    todayWorkout?.minutes,
    todayWorkout?.estimated_minutes,
    0,
  );

  const weeklyBars = useMemo(
    () =>
      buildWeeklyBars(
        homepage,
        fitnessPlan,
        todayWorkout,
        workoutProgressSection,
      ),
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
    () =>
      buildWorkoutOverviewCards(homepage, fitnessPlan, weeklyWorkoutSection),
    [fitnessPlan, homepage, weeklyWorkoutSection],
  );

  const mealOverviewCards = useMemo(
    () => buildMealOverviewCards(homepage, mealPlan, mealDaysSection),
    [homepage, mealDaysSection, mealPlan],
  );

  const tips = useMemo(
    () => buildTips(homepage, mealPlan, activePlanAlias, tipsSection),
    [activePlanAlias, homepage, mealPlan, tipsSection],
  );
  const normalizedPlanAlias = normalizePlanAlias(activePlanAlias);
  const hasWorkoutAccess =
    homepage?.plan_info?.has_workout ||
    ["starter", "master", "starter+meal", "master+meal"].includes(
      normalizedPlanAlias,
    );
  const showWorkoutSection =
    hasSubscription &&
    (hasWorkoutAccess ||
      Boolean(workoutProgressSection || weeklyWorkoutSection));

  const showWaterSection = hasSubscription && Boolean(waterSection);
  const showCalorieSection = hasSubscription && Boolean(mealKcalSection);
  const nutritionTileCount =
    Number(showWaterSection) + Number(showCalorieSection);

  const onAddWater = async (amount: number) => {
    const nextTotal = Math.min(waterTotal + amount, waterGoal);
    setSelectedWaterStep(amount);

    const result = await dispatch(
      updateTodayWaterIntake({ total_ml: nextTotal }),
    );

    // Water feeds several homepage sections, so re-read the whole payload
    // rather than patching one number locally.
    if (updateTodayWaterIntake.fulfilled.match(result)) {
      dispatch(getHomepage());
    }
  };

  // The card is a shortcut to the plan, so it opens the Workout tab rather
  // than jumping straight into an exercise.
  const openMealPlan = (date?: string) => {
    navigation.getParent?.()?.navigate("MealTab", {
      screen: "MealPlannerView",
      params: { date },
    });
  };

  const openFitnessPlan = (date?: string) => {
    navigation.getParent?.()?.navigate("WorkoutTab", {
      screen: "FitnessPlanView",
      params: { date },
    });
  };

  const openTodayWorkout = () => {
    if (!todayWorkout) return;

    let fullExercise: WorkoutExercise | null = null;
    let sectionName: string | undefined;

    for (const day of fitnessPlan?.days ?? []) {
      for (const section of day.sections ?? []) {
        const nextExerciseId = Number(todayWorkout.id ?? 0);
        const match = section.exercises?.find((exercise) =>
          nextExerciseId > 0
            ? exercise.id === nextExerciseId
            : exercise.exercise_name?.toLowerCase() ===
              todayWorkout.exercise_name?.toLowerCase(),
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
      navigation.navigate("ExercisePlayerView", {
        exercise: fullExercise,
        sectionName:
          sectionName ||
          firstString(todayWorkout.category_name, todayWorkout.category),
        hasVideoAccess: fitnessPlan?.has_video_access === true,
      });
      return;
    }

    navigation.navigate("WorkoutSectionView", {
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
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={fetchHomeData}
              tintColor={ACCENT}
            />
          }
        >
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={styles.greeting}>Hello, {firstName}!</Text>
              <Text style={styles.subtitle}>
                You're in. Let's train. CAK style!
              </Text>
            </View>
            <Image
              source={avatarUri ? { uri: avatarUri } : FALLBACK_AVATAR}
              style={styles.avatar}
            />
          </View>

          {!hasSubscription && promoPlans.length > 0 ? (
            <View style={styles.sectionBlock}>
              <SectionHeader title="" action="See all" />
              <FlatList
                data={promoPlans}
                horizontal
                keyExtractor={(item) => item.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.promoList}
                ItemSeparatorComponent={ListSeparator}
                renderItem={({ item }) => (
                  <SubscriptionCard item={item} compact />
                )}
              />
              <View style={styles.pagination}>
                {promoPlans.slice(0, 4).map((item) => (
                  <View
                    key={item.id}
                    style={[
                      styles.paginationDot,
                      item.id === promoPlans[0].id &&
                        styles.paginationDotActive,
                    ]}
                  />
                ))}
              </View>
            </View>
          ) : null}

          {hasSubscription && upgradePlans.length > 0 ? (
            <View style={styles.sectionBlock}>
              <SectionHeader
                title={firstString(
                  upgradeOffersSection?.title,
                  "Available upgrades",
                )}
                action="See all"
              />
              <FlatList
                data={upgradePlans}
                horizontal
                keyExtractor={(item) => item.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.promoList}
                ItemSeparatorComponent={ListSeparator}
                renderItem={({ item }) => (
                  <SubscriptionCard item={item} compact />
                )}
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
                  containerStyle={
                    nutritionTileCount === 1 ? styles.singleStatCard : undefined
                  }
                />
              ) : null}
              {showCalorieSection ? (
                <CalorieRing
                  consumed={calorieConsumed}
                  goal={calorieGoal}
                  remaining={calorieRemaining}
                  containerStyle={
                    nutritionTileCount === 1 ? styles.singleStatCard : undefined
                  }
                />
              ) : null}
            </View>
          ) : null}

          {showWorkoutSection ? (
            <>
              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.quickActionCard}
                onPress={() => openFitnessPlan(localIsoDate())}
              >
                <Text style={styles.quickActionTitle}>Today's workout</Text>
                <ChevronRight />
              </TouchableOpacity>

              {weeklyBars.length > 0 ? (
                <View style={styles.progressCard}>
                  <View style={styles.weekBarsRow}>
                    {weeklyBars.map((day) => (
                      <View key={day.label} style={styles.barColumn}>
                        <View style={styles.barTrack}>
                          <View
                            style={[
                              styles.barFill,
                              { height: `${day.value * 100}%` },
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
                        todayWorkout?.category_name,
                        todayWorkout?.category,
                        todayProgress?.focus,
                        todayWorkout?.type,
                        activePlanAlias.includes("meal")
                          ? "Nutrition"
                          : "Workout",
                      )}
                    </Text>
                  </View>

                  <Text style={styles.primaryCardTitle}>
                    {sentenceCase(
                      firstString(
                        todayWorkout?.exercise_name,
                        todayWorkout?.title,
                        todayWorkout?.name,
                        todayProgress?.focus,
                        "Today's workout",
                      ),
                    )}
                  </Text>

                  {workoutDuration > 0 ? (
                    <View style={styles.durationRow}>
                      <ClockIcon />
                      <Text style={styles.durationText}>
                        {workoutDuration} mins
                      </Text>
                    </View>
                  ) : null}

                  <TouchableOpacity
                    activeOpacity={0.9}
                    disabled={!todayWorkout}
                    onPress={openTodayWorkout}
                    style={styles.primaryCta}
                  >
                    <Text style={styles.primaryCtaText}>
                      Continue To Workout
                    </Text>
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
                title="Weekly Workout Overview"
                action="See all"
                onActionPress={() => openFitnessPlan(localIsoDate())}
              />
              <FlatList
                data={overviewCards}
                horizontal
                keyExtractor={(item) => item.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.overviewList}
                ItemSeparatorComponent={ListSeparator}
                renderItem={({ item }) => (
                  <OverviewCard
                    item={item}
                    onPress={() => openFitnessPlan(item.date)}
                  />
                )}
              />
            </View>
          ) : null}

          {mealOverviewCards.length > 0 ? (
            <View style={styles.sectionBlock}>
              <SectionHeader
                title="Weekly Meal Overview"
                action="See all"
                onActionPress={() => openMealPlan(localIsoDate())}
              />
              <FlatList
                data={mealOverviewCards}
                horizontal
                keyExtractor={(item) => item.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.overviewList}
                ItemSeparatorComponent={ListSeparator}
                renderItem={({ item }) => (
                  <OverviewCard
                    item={item}
                    onPress={() => openMealPlan(item.date)}
                  />
                )}
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

const SectionHeader = ({
  title,
  action,
  onActionPress,
}: {
  title: string;
  action?: string;
  onActionPress?: () => void;
}) => (
  <View style={styles.sectionHeader}>
    {title ? <Text style={styles.sectionTitle}>{title}</Text> : <View />}
    {action ? (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onActionPress}
        disabled={!onActionPress}
      >
        <Text style={styles.sectionAction}>{action}</Text>
      </TouchableOpacity>
    ) : null}
  </View>
);

const UPGRADE_IMAGE_URL =
  "https://d1t9z5ilqoa9lf.cloudfront.net/pages/subs.png";

const SubscriptionCard = ({
  item,
  compact = false,
}: {
  item: PromoPlan;
  compact?: boolean;
}) => (
  <ImageBackground
    source={
      compact
        ? { uri: UPGRADE_IMAGE_URL }
        : item.image_url
          ? { uri: item.image_url }
          : FALLBACK_SUBSCRIPTION_IMAGE
    }
    imageStyle={[styles.subscriptionImage, compact && styles.upgradeImage]}
    resizeMode="cover"
    style={[styles.subscriptionCard, compact && styles.upgradeCard]}
  >
    <View style={styles.subscriptionOverlay} />
    <View style={[styles.subscriptionBody, compact && styles.upgradeBody]}>
      <View style={styles.subscriptionCopy}>
        <Text
          style={[styles.subscriptionTitle, compact && styles.upgradeTitle]}
        >
          {item.name}
        </Text>
        <Text
          style={[
            styles.subscriptionDescription,
            compact && styles.upgradeDescription,
          ]}
        >
          {item.description}
        </Text>
      </View>
      <View
        style={[styles.subscriptionPricing, compact && styles.upgradePricing]}
      >
        <View style={[styles.priceBadge, compact && styles.upgradePriceBadge]}>
          <Text
            style={[styles.priceValue, compact && styles.upgradePriceValue]}
          >
            {item.priceLabel}
          </Text>
          <Text style={[styles.priceTerm, compact && styles.upgradePriceTerm]}>
            {item.intervalLabel}
          </Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.9}
          style={[styles.getPlanButton, compact && styles.upgradeGetPlanButton]}
        >
          <Text
            style={[styles.getPlanText, compact && styles.upgradeGetPlanText]}
          >
            Get Plan
          </Text>
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
}) => {
  const listRef = useRef<ScrollView>(null);
  const pillLayouts = useRef<Record<number, { x: number; width: number }>>({});
  const listWidth = useRef(0);

  // Keep the picked amount in view, whether it was chosen with the arrows or
  // tapped directly.
  const revealStep = useCallback((step: number) => {
    const pill = pillLayouts.current[step];

    if (!pill || !listWidth.current) {
      return;
    }

    const centered = pill.x + pill.width / 2 - listWidth.current / 2;

    listRef.current?.scrollTo({ x: Math.max(0, centered), animated: true });
  }, []);

  useEffect(() => {
    revealStep(amount);
  }, [amount, revealStep]);

  return (
    <View style={[styles.waterCard, containerStyle]}>
      <Text style={styles.waterTitle}>Water Intake</Text>
      <View style={styles.glassWrap}>
        <WaterGlass level={waterFillLevel(amount)} />
      </View>
      <View style={styles.waterControls}>
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.waterArrowButton}
          onPress={() => cycleWaterStep(amount, -1, onSelect)}
        >
          <Text style={styles.waterArrow}>{"<"}</Text>
        </TouchableOpacity>
        <ScrollView
          ref={listRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          bounces={false}
          onLayout={(event) => {
            listWidth.current = event.nativeEvent.layout.width;
            revealStep(amount);
          }}
          contentContainerStyle={styles.waterAmountList}
        >
          {WATER_STEPS.map((step) => (
            <TouchableOpacity
              key={step}
              activeOpacity={0.9}
              onPress={() => onSelect(step)}
              onLayout={(event) => {
                const { x, width } = event.nativeEvent.layout;
                pillLayouts.current[step] = { x, width };
              }}
              style={[
                styles.waterPill,
                amount === step && styles.waterPillActive,
              ]}
            >
              <Text
                style={[
                  styles.waterPillText,
                  amount === step && styles.waterPillTextActive,
                ]}
              >
                {formatWaterStep(step)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.waterArrowButton}
          onPress={() => cycleWaterStep(amount, 1, onSelect)}
        >
          <Text style={styles.waterArrow}>{">"}</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.waterAddButton}
        onPress={() => onAddWater(amount)}
      >
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
};

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

const OverviewCard = ({
  item,
  onPress,
}: {
  item: OverviewCardData;
  onPress: () => void;
}) => {
  const caption = (
    <View style={styles.overviewContent}>
      <View style={styles.overviewCopy}>
        <Text style={styles.overviewDay} numberOfLines={1}>
          {item.title}
        </Text>
        {item.subtitle ? (
          <View style={styles.overviewDurationRow}>
            <ClockIcon small />
            <Text style={styles.overviewDuration}>{item.subtitle}</Text>
          </View>
        ) : null}
      </View>
      <ChevronRight />
    </View>
  );

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
      <ImageBackground
        source={
          item.image_url
            ? { uri: item.image_url }
            : overviewFallbackImage(item.id, item.kind)
        }
        imageStyle={styles.overviewImage}
        style={styles.overviewCard}
      >
        <View style={styles.overviewOverlay} />
        {caption}
      </ImageBackground>
    </TouchableOpacity>
  );
};

// Derived from the id rather than random, so a card keeps the same photo
// across re-renders instead of reshuffling on every state change.
const overviewFallbackImage = (seed: string, kind: "meal" | "workout") => {
  let hash = 0;

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }

  const slot = (hash % WORKOUT_FALLBACK_IMAGE_COUNT) + 1;

  return {
    uri: kind === "meal" ? mealFallbackUri(slot) : workoutFallbackUri(slot),
  };
};

const ChevronRight = ({ dark = false }: { dark?: boolean }) => (
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

const ClockIcon = ({ small = false }: { small?: boolean }) => (
  <Svg
    width={small ? 14 : 16}
    height={small ? 14 : 16}
    viewBox="0 0 16 16"
    fill="none"
  >
    <Circle cx="8" cy="8" r="7" stroke="#FFFFFF" strokeWidth="1.5" />
    <Path
      d="M8 4.5V8L10.5 9.5"
      stroke="#FFFFFF"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
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
  date?: string;
  image_url?: string;
  kind: "meal" | "workout";
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
  const planSection = firstObject(
    mobilePlans?.section,
    homepage?.section,
    profile?.section,
  );
  if (!sources.length) {
    return [];
  }

  return sources.slice(0, 5).map((item, index) => ({
    id: String(item?.id ?? `plan-${index}`),
    name: firstString(item?.name, item?.title, "Plan"),
    description: firstString(
      item?.description,
      item?.short_description,
      planSection?.description,
      "Enjoy a 7-day free trial. Cancel anytime.",
    ),
    priceLabel: formatOptionalPrice(
      item?.price,
      item?.monthly_price,
      item?.pricings?.[0]?.price,
    ),
    intervalLabel: firstString(
      item?.interval,
      item?.pricings?.[0]?.interval,
      "per month",
    ),
    image_url: firstString(
      item?.image_url,
      item?.thumbnail_url,
      planSection?.image_url,
    ),
  }));
};

function buildUpgradePlans(
  upgradeOffersSection?: HomepageSection,
): PromoPlan[] {
  return toArray(upgradeOffersSection?.upgrades).map((item, index) => ({
    id: String(item?.id ?? `upgrade-${index}`),
    name: firstString(item?.name, item?.title, "Upgrade"),
    description: firstString(
      item?.description,
      item?.features,
      "Enjoy a 7-day free trial. Cancel anytime.",
    ),
    priceLabel: formatOptionalPrice(
      item?.starting_price,
      item?.price,
      item?.pricing_options?.[0]?.price,
    ),
    intervalLabel: firstString(
      item?.pricing_options?.[0]?.type === "monthly" ? "per month" : "",
      item?.interval,
      "per month",
    ),
    image_url: firstString(item?.image_url, item?.thumbnail_url),
  }));
}

const buildWorkoutOverviewCards = (
  homepage: HomepageData | null,
  fitnessPlan: FitnessPlan | null,
  weeklyWorkoutSection?: HomepageSection,
): OverviewCardData[] =>
  [
    ...toArray(weeklyWorkoutSection?.days),
    ...toArray(homepage?.weekly_workout_overview?.days),
    ...toArray(homepage?.weekly_overview),
    ...toArray(homepage?.workouts),
    ...toArray(fitnessPlan?.days),
  ]
    .slice(0, 7)
    .map((item, index) => ({
      id: `workout-${item?.id ?? item?.date ?? index}`,
      date: isoDate(item?.date),
      title: firstString(
        item?.day_name,
        item?.day,
        item?.title,
        weekdayLabel(item?.date, dayNames),
        dayLabels[index % dayLabels.length],
      ),
      subtitle: firstString(
        formatOptionalMetric(
          "mins",
          (item?.next_exercise as ApiItem | undefined)?.estimated_minutes,
          item?.total_estimated_minutes,
          item?.duration,
          item?.duration_minutes,
          item?.minutes,
        ),
        item?.focus,
        toArray(item?.categories).join(", "),
      ),
      image_url: firstString(item?.image_url, item?.thumbnail_url),
      kind: "workout" as const,
    }));

const buildMealOverviewCards = (
  homepage: HomepageData | null,
  mealPlan: MealPlan | null,
  mealDaysSection?: HomepageSection,
): OverviewCardData[] =>
  [
    ...toArray(mealDaysSection?.days),
    ...toArray(mealPlan?.days),
    ...toArray(homepage?.weekly_progress),
    ...toArray(mealPlan?.meals),
    ...toArray(homepage?.meals),
  ]
    .slice(0, 7)
    .map((item, index) => {
      const featured = item?.featured_meal as ApiItem | undefined;

      return {
        id: `meal-${item?.id ?? item?.date ?? index}`,
        date: isoDate(item?.date),
        title: firstString(
          item?.day_label,
          item?.day_name,
          item?.day,
          item?.title,
          item?.name,
          weekdayLabel(item?.date, dayNames),
          dayLabels[index % dayLabels.length],
        ),
        subtitle: formatOptionalMetric(
          "kcal",
          item?.target_kcal,
          item?.kcal,
          item?.calories,
        ),
        image_url: firstString(
          item?.image_url,
          item?.thumbnail_url,
          featured?.image_url,
        ),
        kind: "meal" as const,
      };
    });

const normalizePlanAlias = (planAlias: string) =>
  planAlias
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/&/g, "+")
    .replace(/plus/g, "+");

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
      title: firstString(item?.title, item?.name, "Tip"),
      description: firstString(
        item?.message,
        item?.description,
        item?.content,
        "",
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

  const completionByDate = new Map<string, number>();

  for (const item of source) {
    const date = isoDate(item?.date);

    if (date && !completionByDate.has(date)) {
      completionByDate.set(
        date,
        firstNumber(item?.completion_percentage, item?.progress, 0) / 100,
      );
    }
  }

  // daily_progress only covers days the plan schedules, so the chart is drawn
  // from the section's week instead. Otherwise a five-day plan renders five
  // bars and the rest of the week silently disappears.
  const weekStart = isoDate(workoutProgressSection?.week?.start_date);

  if (weekStart) {
    return weekDates(weekStart).map((date) => ({
      label: weekdayLabel(date, dayLabels) ?? "",
      value: clampNumber(completionByDate.get(date) ?? 0, 0, 1),
    }));
  }

  if (!source.length) return [];

  const uniqueDays = Array.from(new Set(source.map((d) => d.date)))
    .map((date) => source.find((d) => d.date === date))
    .slice(0, 7);

  return uniqueDays.map((item, index) => ({
    label:
      weekdayLabel(item?.date, dayLabels) ??
      `Day ${item?.day_number ?? index + 1}`,
    value: clampNumber(
      firstNumber(item?.completion_percentage, item?.progress, 0) / 100,
      0,
      1,
    ),
  }));
};

// Seven consecutive YYYY-MM-DD strings starting at the given day.
const weekDates = (start: string) => {
  const [year, month, day] = start.split("-").map(Number);
  const dates: string[] = [];

  for (let offset = 0; offset < 7; offset += 1) {
    const date = new Date(Date.UTC(year, month - 1, day + offset));
    dates.push(date.toISOString().slice(0, 10));
  }

  return dates;
};

// Today's calendar date where the user is, not in UTC.
const localIsoDate = () => {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");

  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

// Exercise names arrive lowercase ("seated chest press").
const sentenceCase = (value: string) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : value;

const isoDate = (value: unknown) => {
  const match = /^\d{4}-\d{2}-\d{2}/.exec(String(value ?? ""));

  return match ? match[0] : undefined;
};

const getHomepageSection = (homepage: HomepageData | null, type: string) =>
  toArray(homepage?.sections).find((section) => section?.type === type);

const normalizeSubscriptionStatus = (value: string) =>
  value.trim().toLowerCase();

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

// How full the glass looks for the amount currently picked: the smallest step
// still shows a visible pour, the largest fills the glass.
const waterFillLevel = (amount: number) => {
  const min = WATER_STEPS[0];
  const max = WATER_STEPS[WATER_STEPS.length - 1];
  const span = Math.max(max - min, 1);
  const ratio = (amount - min) / span;

  return 0.3 + 0.7 * Math.min(Math.max(ratio, 0), 1);
};

// Dates arrive as plain YYYY-MM-DD, so read them as UTC. Letting Date parse
// them locally shifts the day backwards west of Greenwich.
const weekdayLabel = (value: unknown, names: string[]) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value ?? ""));

  if (!match) {
    return undefined;
  }

  const date = new Date(
    Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])),
  );

  return names[date.getUTCDay()];
};

const formatWaterStep = (value: number) =>
  value >= 1000 && value % 1000 === 0 ? `${value / 1000}L` : `${value}mL`;

const toWorkoutSection = (value?: ApiItem) => ({
  id: Number(value?.id ?? 0),
  section_name: firstString(
    value?.category_name,
    value?.category,
    value?.title,
    value?.name,
    "Workout",
  ),
  exercises: value?.exercises ?? [],
});

const toArray = (value: unknown): ApiItem[] =>
  Array.isArray(value)
    ? value.filter(
        (item): item is ApiItem =>
          typeof item === "object" && item !== null && !Array.isArray(item),
      )
    : [];

const firstObject = (...values: unknown[]): ApiItem | undefined =>
  values.find(
    (value): value is ApiItem =>
      typeof value === "object" && value !== null && !Array.isArray(value),
  );

const firstString = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length) return value.trim();
  }
  return "";
};

const firstNumber = (...values: unknown[]) => {
  for (const value of values) {
    const numeric =
      typeof value === "number"
        ? value
        : typeof value === "string"
          ? Number(value.replace(/[^0-9.-]/g, ""))
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
      typeof value === "number"
        ? value
        : typeof value === "string"
          ? Number(value.replace(/[^0-9.-]/g, ""))
          : NaN;
    if (Number.isFinite(numeric)) return numeric;
  }
  return null;
};

const formatOptionalPrice = (...values: unknown[]) => {
  const value = firstOptionalNumber(...values);
  return value === null ? "" : `${value}$`;
};

const formatOptionalMetric = (unit: string, ...values: unknown[]) => {
  const value = firstOptionalNumber(...values);
  return value === null ? "" : `${value} ${unit}`;
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
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 170,
  },
  header: {
    marginTop: 14,
    marginBottom: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
  },
  greeting: {
    color: "#FFFFFF",
    fontSize: 28,
    fontFamily: "Raleway-Black",
    includeFontPadding: false,
    marginBottom: 6,
  },
  subtitle: {
    color: MUTED,
    fontSize: 14,
    fontFamily: "Raleway-Regular",
    includeFontPadding: false,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#4B4B4B",
    flexShrink: 0,
  },
  sectionBlock: {
    marginBottom: 26,
  },
  sectionHeader: {
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Raleway-Bold",
    includeFontPadding: false,
  },
  sectionAction: {
    color: ACCENT,
    fontSize: 14,
    fontFamily: "Raleway-Bold",
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
    overflow: "hidden",
    borderRadius: 28,
    justifyContent: "flex-end",
  },
  upgradeCard: {
    width: 279,
    minHeight: 112,
    height: 112,
    borderRadius: 22,
    backgroundColor: "#244915",
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
    backgroundColor: "rgba(40, 84, 18, 0.46)",
  },
  subscriptionBody: {
    paddingHorizontal: 26,
    paddingVertical: 22,
    flexDirection: "row",
    justifyContent: "space-between",
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
    justifyContent: "space-between",
  },
  subscriptionTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontFamily: "Raleway-Black",
    includeFontPadding: false,
    marginBottom: 12,
  },
  upgradeTitle: {
    fontSize: 18,
    marginBottom: 6,
  },
  subscriptionDescription: {
    color: "#FFFFFF",
    fontSize: 13,
    lineHeight: 18,
    fontFamily: "Raleway-Medium",
  },
  upgradeDescription: {
    fontSize: 7,
    lineHeight: 9,
  },
  subscriptionPricing: {
    width: 112,
    flexShrink: 0,
    justifyContent: "space-between",
    alignItems: "flex-end",
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
    color: "#FFFFFF",
    fontSize: 30,
    fontFamily: "Raleway-Black",
    includeFontPadding: false,
    textAlign: "center",
  },
  upgradePriceValue: {
    fontSize: 25,
  },
  priceTerm: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: "Raleway-Medium",
    includeFontPadding: false,
    textAlign: "center",
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
    fontFamily: "Raleway-Bold",
    includeFontPadding: false,
  },
  upgradeGetPlanText: {
    fontSize: 10,
  },
  pagination: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#777777",
  },
  paginationDotActive: {
    backgroundColor: "#FFFFFF",
  },
  topStatsRow: {
    flexDirection: "row",
    alignItems: "stretch",
    justifyContent: "space-between",
    marginBottom: 28,
    width: "100%",
  },
  singleStatCard: {
    width: "100%",
  },
  waterCard: {
    width: "47%",
    minWidth: 0,
    backgroundColor: SURFACE,
    borderRadius: 22,
    paddingHorizontal: 10,
    paddingVertical: 14,
    shadowColor: "#000000",
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  waterTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "Raleway-Black",
    includeFontPadding: false,
    textAlign: "center",
    marginBottom: 8,
  },
  glassWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  waterControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    width: "100%",
    overflow: "hidden",
  },
  waterArrowButton: {
    width: 18,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  waterArrow: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Raleway-Bold",
    includeFontPadding: false,
    textAlign: "center",
  },
  waterAmountList: {
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 4,
  },
  waterPill: {
    borderRadius: 16,
    paddingHorizontal: 6,
    paddingVertical: 4,
    minWidth: 48,
    alignItems: "center",
  },
  waterPillActive: {
    backgroundColor: ACCENT,
  },
  waterPillText: {
    color: "#CFCFCF",
    fontSize: 10,
    fontFamily: "Raleway-Medium",
    includeFontPadding: false,
  },
  waterPillTextActive: {
    color: BACKGROUND,
    fontFamily: "Raleway-Bold",
  },
  waterAddButton: {
    backgroundColor: "#232323",
    borderRadius: 16,
    paddingVertical: 9,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  waterAddButtonText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontFamily: "Raleway-SemiBold",
    includeFontPadding: false,
    textAlign: "center",
  },
  ringCard: {
    width: "47%",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 178,
    minWidth: 0,
    overflow: "hidden",
  },
  ringCenter: {
    position: "absolute",
    alignItems: "center",
  },
  ringValue: {
    color: "#FFFFFF",
    fontSize: 17,
    fontFamily: "Raleway-Bold",
    includeFontPadding: false,
    marginBottom: 4,
  },
  ringMeta: {
    color: MUTED,
    fontSize: 10,
    fontFamily: "Raleway-Medium",
    includeFontPadding: false,
  },
  quickActionCard: {
    backgroundColor: SURFACE,
    borderRadius: 30,
    paddingHorizontal: 26,
    paddingVertical: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  quickActionTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontFamily: "Raleway-Black",
    includeFontPadding: false,
    flexShrink: 1,
    paddingRight: 12,
  },
  progressCard: {
    backgroundColor: SURFACE,
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingVertical: 24,
    marginBottom: 30,
    shadowColor: "#000000",
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  weekBarsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 22,
    width: "100%",
  },
  barColumn: {
    alignItems: "center",
    width: `${100 / 7}%`,
  },
  barTrack: {
    width: 15,
    height: 132,
    borderRadius: 8,
    backgroundColor: "#000000",
    justifyContent: "flex-end",
    paddingBottom: 0,
    overflow: "hidden",
    marginBottom: 10,
  },
  barFill: {
    width: "100%",
    borderRadius: 8,
    backgroundColor: ACCENT,
  },
  barLabel: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: "Raleway-Medium",
    includeFontPadding: false,
  },
  metaLabel: {
    color: MUTED,
    fontSize: 12,
    fontFamily: "Raleway-Medium",
    includeFontPadding: false,
    marginBottom: 10,
  },
  tag: {
    alignSelf: "flex-start",
    backgroundColor: ACCENT,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginBottom: 12,
  },
  tagText: {
    color: BACKGROUND,
    fontSize: 12,
    fontFamily: "Raleway-Bold",
    includeFontPadding: false,
  },
  primaryCardTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontFamily: "Raleway-Black",
    includeFontPadding: false,
    marginBottom: 10,
    flexShrink: 1,
  },
  durationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 22,
  },
  durationText: {
    color: MUTED,
    fontSize: 13,
    fontFamily: "Raleway-Medium",
    includeFontPadding: false,
  },
  primaryCta: {
    backgroundColor: ACCENT,
    borderRadius: 32,
    overflow: "hidden",
    paddingLeft: 22,
    paddingRight: 10,
    paddingVertical: 10,
    minHeight: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  primaryCtaText: {
    color: BACKGROUND,
    fontSize: 18,
    fontFamily: "Raleway-Black",
    includeFontPadding: false,
    flexShrink: 1,
    paddingRight: 12,
  },
  primaryCtaIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#1B1B1B",
    alignItems: "center",
    justifyContent: "center",
  },
  overviewList: {
    paddingRight: SCREEN_PADDING.right,
  },
  overviewCard: {
    width: 215,
    height: 285,
    borderRadius: 20,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  overviewImage: {
    borderRadius: 20,
  },
  overviewOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    borderRadius: 20,
  },
  overviewContent: {
    padding: 20,
    paddingBottom: 25,
  },
  overviewMealContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  overviewCopy: {
    flex: 1,
    minWidth: 0,
  },
  overviewDay: {
    color: "#FFFFFF",
    fontSize: 19,
    fontFamily: "Raleway-Black",
    includeFontPadding: false,
    marginBottom: 6,
    flexShrink: 1,
  },
  overviewTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  overviewCategory: {
    color: ACCENT,
    fontSize: 14,
    fontFamily: "Raleway-Bold",
    includeFontPadding: false,
    marginBottom: 12,
  },
  overviewNextExercise: {
    color: "#FFFFFF",
    fontSize: 16,
    lineHeight: 21,
    fontFamily: "Raleway-SemiBold",
    includeFontPadding: false,
  },
  overviewMetrics: {
    gap: 8,
    marginTop: 14,
  },
  overviewDurationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  overviewDuration: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: "Raleway-Medium",
    includeFontPadding: false,
  },
  tipsTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Raleway-Black",
    includeFontPadding: false,
    marginBottom: 14,
  },
  tipCard: {
    backgroundColor: ACCENT,
    borderRadius: 28,
    minHeight: 220,
    paddingHorizontal: 24,
    paddingVertical: 22,
    justifyContent: "center",
  },
  tipHeadline: {
    color: BACKGROUND,
    fontSize: 22,
    fontFamily: "Raleway-Black",
    includeFontPadding: false,
    marginBottom: 12,
  },
  tipBody: {
    color: BACKGROUND,
    fontSize: 15,
    lineHeight: 24,
    fontFamily: "Raleway-Medium",
  },
});

export default HomepageListView;
