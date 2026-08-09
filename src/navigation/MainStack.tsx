import type { BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import type { RouteProp } from "@react-navigation/native";
import {
  NavigatorScreenParams,
  getFocusedRouteNameFromRoute,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Image, ImageSourcePropType, StyleSheet, View } from "react-native";
import {
  AboutUsView,
  ContactUsView,
  ExercisePlayerView,
  FitnessPlanView,
  HomepageListView,
  MealDetailsView,
  MealPlannerView,
  MembershipView,
  NotificationsView,
  PaymentHistoryView,
  PlanView,
  PersonalDataView,
  PrivacyPolicyView,
  ProfileView,
  SubscriptionHistoryView,
  WorkoutSectionView,
  WorkoutSuccessView,
  WorkoutSurveyView,
} from "../screens";
import { useAppSelector } from "../store";
import type { AuthResponse, UserProfile } from "../types/auth";
import type {
  DisplayMeal,
  WorkoutExercise,
  WorkoutSection,
} from "../types/plans";

const ACCENT = "#8FFF19";

type TabKey = "home" | "meal" | "workout" | "profile";

export type WorkoutFlowParamList = {
  WorkoutSectionView: { section: WorkoutSection; dayName: string };
  ExercisePlayerView: {
    exercise: WorkoutExercise;
    sectionName?: string;
    hasVideoAccess: boolean;
  };
  WorkoutSuccessView: { exercise: WorkoutExercise };
  WorkoutSurveyView: { currentExerciseId?: number };
};

export type HomeStackParamList = {
  HomepageListView: undefined;
  UpgradePlanView: { planId: number; mode: "upgrade" };
} & WorkoutFlowParamList;

export type MealStackParamList = {
  // date (YYYY-MM-DD) opens that day instead of today.
  MealPlannerView: { date?: string } | undefined;
  MealDetailsView: { meal: DisplayMeal };
};

export type WorkoutStackParamList = {
  // date (YYYY-MM-DD) opens that day instead of today.
  FitnessPlanView: { date?: string } | undefined;
} & WorkoutFlowParamList;

export type ProfileStackParamList = {
  ProfileView: undefined;
  ContactUsView: undefined;
  PrivacyPolicyView: undefined;
  NotificationsView: undefined;
  AboutUsView: undefined;
  MembershipView: undefined;
  PersonalDataView: undefined;
  SubscriptionHistoryView: undefined;
  PaymentHistoryView: undefined;
};

export type MainTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  MealTab: NavigatorScreenParams<MealStackParamList>;
  WorkoutTab: NavigatorScreenParams<WorkoutStackParamList>;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};

export type MainStackParamList = HomeStackParamList &
  MealStackParamList &
  WorkoutStackParamList &
  ProfileStackParamList;

const Tab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const MealStack = createNativeStackNavigator<MealStackParamList>();
const WorkoutStack = createNativeStackNavigator<WorkoutStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

const NAV_ICON_ASSETS: Record<
  TabKey,
  { on: ImageSourcePropType; off: ImageSourcePropType }
> = {
  home: {
    on: require("../../assets/images/home-on.png"),
    off: require("../../assets/images/home-off.png"),
  },
  meal: {
    on: require("../../assets/images/meal-on.png"),
    off: require("../../assets/images/meal-off.png"),
  },
  workout: {
    on: require("../../assets/images/workout-on.png"),
    off: require("../../assets/images/workout-off.png"),
  },
  profile: {
    on: require("../../assets/images/profile-on.png"),
    off: require("../../assets/images/profile-off.png"),
  },
};

const WORKOUT_FLOW_ROUTES = new Set([
  "WorkoutSectionView",
  "ExercisePlayerView",
  "WorkoutSuccessView",
  "WorkoutSurveyView",
]);

const screenOptions = {
  headerShown: false,
};

const HomeNavigator = () => (
  <HomeStack.Navigator initialRouteName="HomepageListView">
    <HomeStack.Screen
      name="HomepageListView"
      component={HomepageListView}
      options={screenOptions}
    />
    <HomeStack.Screen
      name="UpgradePlanView"
      component={PlanView}
      options={screenOptions}
    />
    <HomeStack.Screen
      name="WorkoutSectionView"
      component={WorkoutSectionView}
      options={screenOptions}
    />
    <HomeStack.Screen
      name="ExercisePlayerView"
      component={ExercisePlayerView}
      options={screenOptions}
    />
    <HomeStack.Screen
      name="WorkoutSuccessView"
      component={WorkoutSuccessView}
      options={screenOptions}
    />
    <HomeStack.Screen
      name="WorkoutSurveyView"
      component={WorkoutSurveyView}
      options={screenOptions}
    />
  </HomeStack.Navigator>
);

const MealNavigator = () => (
  <MealStack.Navigator initialRouteName="MealPlannerView">
    <MealStack.Screen
      name="MealPlannerView"
      component={MealPlannerView}
      options={screenOptions}
    />
    <MealStack.Screen
      name="MealDetailsView"
      component={MealDetailsView}
      options={screenOptions}
    />
  </MealStack.Navigator>
);

const WorkoutNavigator = () => (
  <WorkoutStack.Navigator initialRouteName="FitnessPlanView">
    <WorkoutStack.Screen
      name="FitnessPlanView"
      component={FitnessPlanView}
      options={screenOptions}
    />
    <WorkoutStack.Screen
      name="WorkoutSectionView"
      component={WorkoutSectionView}
      options={screenOptions}
    />
    <WorkoutStack.Screen
      name="ExercisePlayerView"
      component={ExercisePlayerView}
      options={screenOptions}
    />
    <WorkoutStack.Screen
      name="WorkoutSuccessView"
      component={WorkoutSuccessView}
      options={screenOptions}
    />
    <WorkoutStack.Screen
      name="WorkoutSurveyView"
      component={WorkoutSurveyView}
      options={screenOptions}
    />
  </WorkoutStack.Navigator>
);

const ProfileNavigator = () => (
  <ProfileStack.Navigator initialRouteName="ProfileView">
    <ProfileStack.Screen
      name="ProfileView"
      component={ProfileView}
      options={screenOptions}
    />
    <ProfileStack.Screen
      name="ContactUsView"
      component={ContactUsView}
      options={screenOptions}
    />
    <ProfileStack.Screen
      name="PrivacyPolicyView"
      component={PrivacyPolicyView}
      options={screenOptions}
    />
    <ProfileStack.Screen
      name="NotificationsView"
      component={NotificationsView}
      options={screenOptions}
    />
    <ProfileStack.Screen
      name="AboutUsView"
      component={AboutUsView}
      options={screenOptions}
    />
    <ProfileStack.Screen
      name="MembershipView"
      component={MembershipView}
      options={screenOptions}
    />
    <ProfileStack.Screen
      name="PersonalDataView"
      component={PersonalDataView}
      options={screenOptions}
    />
    <ProfileStack.Screen
      name="SubscriptionHistoryView"
      component={SubscriptionHistoryView}
      options={screenOptions}
    />
    <ProfileStack.Screen
      name="PaymentHistoryView"
      component={PaymentHistoryView}
      options={screenOptions}
    />
  </ProfileStack.Navigator>
);

const MainNavigator = () => {
  const { homepage, profile } = useAppSelector((state) => state.home);
  const loginUser = useAppSelector((state) => state.login.user);
  const enabledTabs = getEnabledTabs(
    getActivePlanAlias(homepage, profile, loginUser),
  );

  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: shouldHideTabBar(route)
          ? styles.tabBarHidden
          : styles.tabBar,
        tabBarItemStyle: styles.tabBarItem,
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeNavigator}
        options={homeTabOptions}
      />
      {enabledTabs.includes("meal") ? (
        <Tab.Screen
          name="MealTab"
          component={MealNavigator}
          options={mealTabOptions}
        />
      ) : null}
      {enabledTabs.includes("workout") ? (
        <Tab.Screen
          name="WorkoutTab"
          component={WorkoutNavigator}
          options={workoutTabOptions}
        />
      ) : null}
      <Tab.Screen
        name="ProfileTab"
        component={ProfileNavigator}
        options={profileTabOptions}
      />
    </Tab.Navigator>
  );
};

const homeTabOptions: BottomTabNavigationOptions = {
  tabBarIcon: ({ focused }) => <TabIcon tabKey="home" focused={focused} />,
};

const mealTabOptions: BottomTabNavigationOptions = {
  tabBarIcon: ({ focused }) => <TabIcon tabKey="meal" focused={focused} />,
};

const workoutTabOptions: BottomTabNavigationOptions = {
  tabBarIcon: ({ focused }) => <TabIcon tabKey="workout" focused={focused} />,
};

const profileTabOptions: BottomTabNavigationOptions = {
  tabBarIcon: ({ focused }) => <TabIcon tabKey="profile" focused={focused} />,
};

const TabIcon = ({ tabKey, focused }: { tabKey: TabKey; focused: boolean }) => (
  <View style={styles.tabIconWrap}>
    <Image
      source={
        focused ? NAV_ICON_ASSETS[tabKey].on : NAV_ICON_ASSETS[tabKey].off
      }
      style={[
        styles.tabIconImage,
        tabKey === "meal" && styles.mealTabIconImage,
      ]}
      resizeMode="contain"
    />
    {focused ? <View style={styles.tabActiveDot} /> : null}
  </View>
);

const shouldHideTabBar = (route: RouteProp<MainTabParamList>) => {
  const focusedRouteName = getFocusedRouteNameFromRoute(route);
  if (!focusedRouteName) return false;
  return (
    WORKOUT_FLOW_ROUTES.has(focusedRouteName) ||
    focusedRouteName === "UpgradePlanView" ||
    focusedRouteName === "MealDetailsView"
  );
};

const getEnabledTabs = (planAlias: string): TabKey[] => {
  const normalizedPlan = normalizePlanAlias(planAlias);

  switch (normalizedPlan) {
    case "starter":
    case "master":
      return ["home", "workout", "profile"];
    case "meal":
      return ["home", "meal", "profile"];
    case "starter+meal":
    case "master+meal":
      return ["home", "meal", "workout", "profile"];
    default:
      return ["home", "meal", "workout", "profile"];
  }
};

type PlanSource = {
  plan_info?: { active_plan_alias?: string; plan_name?: string };
  active_plan?: PlanNode;
  subscription?: { plan?: PlanNode };
};

type PlanNode = {
  alias?: string;
  name?: string;
  plan?: PlanNode;
};

type ProfilePlanSource = UserProfile & {
  active_plan?: PlanNode;
  current_subscription?: { plan?: PlanNode };
};

const getActivePlanAlias = (
  homepage: PlanSource | null,
  profile: ProfilePlanSource | null,
  loginUser: AuthResponse | null,
) =>
  firstString(
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
  );

const normalizePlanAlias = (planAlias: string) =>
  planAlias
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/&/g, "+")
    .replace(/plus/g, "+");

const firstString = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length) {
      return value.trim();
    }
  }
  return "";
};

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 92,
    backgroundColor: "#1C1C1C",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    borderTopWidth: 0,
    paddingTop: 20,
    paddingBottom: 28,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -5 },
    elevation: 20,
  },
  tabBarHidden: {
    display: "none",
  },
  tabBarItem: {
    alignItems: "center",
    justifyContent: "center",
  },
  tabIconWrap: {
    width: 56,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
  },
  tabIconImage: {
    width: 26,
    height: 26,
  },
  mealTabIconImage: {
    width: 38,
    height: 38,
  },
  tabActiveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: ACCENT,
    marginTop: 8,
  },
});

export default MainNavigator;
