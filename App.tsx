/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { ActivityIndicator, AppState, Linking, Platform, StyleSheet, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { NavigationBar } from 'expo-navigation-bar';
import AuthNavigator from './src/navigation/AuthenticationStack';
import { NavigationContainer } from '@react-navigation/native';
import TutorialNavigator from './src/navigation/TutorialStack';
import { Provider, useSelector } from 'react-redux';
import { RootState, store, useAppDispatch } from './src/store';
import QuestionNavigator from './src/navigation/QuestionStack';
import PlanNavigator from './src/navigation/PlanStack';
import MainNavigator from './src/navigation/MainStack';
import OnboardingNavigator from './src/navigation/OnboardingStack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import {useFonts} from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import {StatusBar} from 'expo-status-bar';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import { hydrateLoginSession } from './src/slice/LoginSlice';
import { getProfile } from './src/slice/HomeSlice';
import { setUser } from './src/slice/SignUpSlice';
import {
  clearStaleSessionOnFreshInstall,
  consumeOpenAuthOnNextLaunch,
  loadAuthSession,
} from './src/utils/authSession';
import { setIsPlan, setIsQuestion, setIsWelcome } from './src/slice/WelcomeSlice';
import { resumePendingWhishPayment } from './src/utils/resumePendingWhishPayment';
import { registerForPushNotifications } from './src/utils/pushNotifications';
import { isWhishPaymentRedirect } from './src/utils/whishRedirect';
import {refreshAuthenticatedSession} from './src/utils/completeAuthSession';
import ActivationWaitView from './src/screens/ActivationWaitView';

void SplashScreen.preventAutoHideAsync();

function AppContent() {
  const dispatch = useAppDispatch();
  const isWelcome = useSelector((state: RootState) => state.welcome.isWelcome);
  const isQuestion = useSelector(
    (state: RootState) => state.welcome.isQuestion,
  );
  const isPlan = useSelector((state: RootState) => state.welcome.isPlan);
  const isLoggedIn = useSelector((state: RootState) => state.login.isLoggedIn);
  const loginUser = useSelector((state: RootState) => state.login.user);
  const profile = useSelector((state: RootState) => state.home.profile);
  const authToken = useSelector((state: RootState) => state.signUp.token);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  // Set once the post-purchase setup has been walked through (or skipped) in
  // this session, so finishing it does not bounce the user straight back.
  const [onboardingDismissed, setOnboardingDismissed] = useState(false);

  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        await clearStaleSessionOnFreshInstall();

        if (await consumeOpenAuthOnNextLaunch()) {
          dispatch(setIsQuestion(false));
          dispatch(setIsPlan(false));
          dispatch(setIsWelcome(true));
        }

        const savedSession = await loadAuthSession();

        if (savedSession?.token) {
          dispatch(
            hydrateLoginSession({
              isLoggedIn: savedSession.isLoggedIn,
              user: savedSession.loginUser,
            }),
          );
          dispatch(
            setUser({
              token: savedSession.token,
              action_plan: savedSession.action_plan,
            }),
          );
          dispatch(setIsWelcome(Boolean(savedSession.isWelcome)));
          dispatch(setIsQuestion(Boolean(savedSession.isQuestion)));
          dispatch(setIsPlan(Boolean(savedSession.isPlan)));

          await refreshAuthenticatedSession(dispatch, savedSession);
          void resumePendingWhishPayment(dispatch);
        }
      } finally {
        setIsBootstrapping(false);
      }
    };

    bootstrapAuth();
  }, [dispatch]);

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    void registerForPushNotifications();
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    const subscription = AppState.addEventListener('change', nextState => {
      if (nextState === 'active') {
        void resumePendingWhishPayment(dispatch);
      }
    });

    return () => subscription.remove();
  }, [dispatch, isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    const handleUrl = (url: string) => {
      if (!isWhishPaymentRedirect(url)) {
        return;
      }

      // The hosted checkout view may still be presented on top of the app;
      // close it and re-check the payment we already have stored locally.
      // The redirect's result is never trusted on its own (see the Whish
      // mobile integration guide) — resumePendingWhishPayment always
      // re-verifies with Laravel.
      if (Platform.OS === 'ios') {
        void WebBrowser.dismissBrowser().catch(() => undefined);
      }
      void resumePendingWhishPayment(dispatch);
    };

    Linking.getInitialURL().then(url => {
      if (url) {
        handleUrl(url);
      }
    });

    const subscription = Linking.addEventListener('url', ({url}) => handleUrl(url));

    return () => subscription.remove();
  }, [dispatch, isLoggedIn]);

  if (isBootstrapping) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#68FE00" />
      </View>
    );
  }

  const userHasActivePlan = Boolean(
    authToken && (hasActivePlan(loginUser) || hasActivePlan(profile)),
  );

  const onboarding = profile?.onboarding;
  const needsSchedule = Boolean(onboarding?.workout_schedule_required);
  const needsPhotos = Boolean(onboarding?.progress_photo_required);
  const needsOnboarding =
    userHasActivePlan &&
    !onboardingDismissed &&
    (needsSchedule || needsPhotos);
  const isPendingActivation = hasBlockingCode(profile, 'pending_activation')
    || hasBlockingCode(loginUser, 'pending_activation')
    || hasBlockingCode(profile, 'pending_gym_payment')
    || hasBlockingCode(loginUser, 'pending_gym_payment');
  const isPendingGymPayment = hasBlockingCode(profile, 'pending_gym_payment')
    || hasBlockingCode(loginUser, 'pending_gym_payment');

  if (isPendingActivation) {
    return <ActivationWaitView awaitingGymPayment={isPendingGymPayment} />;
  }

  return (
    <NavigationContainer>
      {isQuestion ? (
        <QuestionNavigator />
      ) : needsOnboarding ? (
        <OnboardingNavigator
          needsSchedule={needsSchedule}
          needsPhotos={needsPhotos}
          onComplete={() => {
            setOnboardingDismissed(true);
            // Refresh so the server-side flags match on the next launch.
            void dispatch(getProfile());
          }}
        />
      ) : userHasActivePlan ? (
        <MainNavigator />
      ) : isPlan ? (
        <PlanNavigator />
      ) : isLoggedIn && !hasActivePlan(loginUser) ? (
        <PlanNavigator />
      ) : isLoggedIn ? (
        <MainNavigator />
      ) : isWelcome ? (
        <AuthNavigator />
      ) : (
        <TutorialNavigator />
      )}
    </NavigationContainer>
  );
}

function App() {
  const [fontsLoaded, fontError] = useFonts({
    'Raleway-Black': require('./assets/fonts/Raleway-Black.ttf'),
    'Raleway-BlackItalic': require('./assets/fonts/Raleway-BlackItalic.ttf'),
    'Raleway-Bold': require('./assets/fonts/Raleway-Bold.ttf'),
    'Raleway-BoldItalic': require('./assets/fonts/Raleway-BoldItalic.ttf'),
    'Raleway-ExtraBold': require('./assets/fonts/Raleway-ExtraBold.ttf'),
    'Raleway-ExtraBoldItalic': require('./assets/fonts/Raleway-ExtraBoldItalic.ttf'),
    'Raleway-ExtraLight': require('./assets/fonts/Raleway-ExtraLight.ttf'),
    'Raleway-ExtraLightItalic': require('./assets/fonts/Raleway-ExtraLightItalic.ttf'),
    'Raleway-Italic': require('./assets/fonts/Raleway-Italic.ttf'),
    'Raleway-Light': require('./assets/fonts/Raleway-Light.ttf'),
    'Raleway-LightItalic': require('./assets/fonts/Raleway-LightItalic.ttf'),
    'Raleway-Medium': require('./assets/fonts/Raleway-Medium.ttf'),
    'Raleway-MediumItalic': require('./assets/fonts/Raleway-MediumItalic.ttf'),
    'Raleway-Regular': require('./assets/fonts/Raleway-Regular.ttf'),
    'Raleway-SemiBold': require('./assets/fonts/Raleway-SemiBold.ttf'),
    'Raleway-SemiBoldItalic': require('./assets/fonts/Raleway-SemiBoldItalic.ttf'),
    'Raleway-Thin': require('./assets/fonts/Raleway-Thin.ttf'),
    'Raleway-ThinItalic': require('./assets/fonts/Raleway-ThinItalic.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      void SplashScreen.hideAsync();
    }
  }, [fontError, fontsLoaded]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.appRoot}>
      <SafeAreaProvider>
        <Provider store={store}>
          {Platform.OS === 'android' && <NavigationBar hidden />}
          <StatusBar style="light" />
          <AppContent />
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    // flex: 1,
  },
  appRoot: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#171717',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default App;

const hasActivePlan = (loginUser: unknown) => {
  const root = asRecord(loginUser);
  const data = asRecord(root?.data);
  const rootUser = asRecord(root?.user);
  const dataUser = asRecord(data?.user);

  return Boolean(
    data?.active_plan ||
      root?.active_plan ||
      dataUser?.has_active_plan ||
      rootUser?.has_active_plan,
  );
};

const asRecord = (value: unknown): Record<string, unknown> | null =>
  typeof value === 'object' && value !== null
    ? (value as Record<string, unknown>)
    : null;

const hasBlockingCode = (value: unknown, code: string): boolean => {
  const root = asRecord(value);
  const data = asRecord(root?.data);
  const access = asRecord(root?.homepage_access) ?? asRecord(data?.homepage_access);
  return Array.isArray(access?.blocking_codes) && access.blocking_codes.includes(code);
};
