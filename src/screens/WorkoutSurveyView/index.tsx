import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Svg, {Path} from 'react-native-svg';

import {getHomepage, submitWeeklyReview} from '../../slice/HomeSlice';
import {useAppDispatch} from '../../store';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {NavigationProp, RouteProp} from '@react-navigation/native';
import type {MainStackParamList, WorkoutFlowParamList} from '../../navigation/MainStack';

const ACCENT = '#68FE00';
const BACKGROUND = '#171717';

const WorkoutSurveyView = () => {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const route = useRoute<RouteProp<WorkoutFlowParamList, 'WorkoutSurveyView'>>();
  const {workoutDayId} = route.params;
  const dispatch = useAppDispatch();
  const [rating, setRating] = React.useState(4);
  const [loading, setLoading] = React.useState(false);

  const resetToCurrentStackRoot = () => {
    const routeNames = navigation.getState?.()?.routeNames || [];

    if (routeNames.includes('HomepageListView')) {
      navigation.reset({
        index: 0,
        routes: [{name: 'HomepageListView'}],
      });
      return;
    }

    if (routeNames.includes('FitnessPlanView')) {
      navigation.reset({
        index: 0,
        routes: [{name: 'FitnessPlanView'}],
      });
    }
  };

  const navigateHome = () => {
    const routeNames = navigation.getState?.()?.routeNames || [];

    if (routeNames.includes('HomepageListView')) {
      navigation.reset({
        index: 0,
        routes: [{name: 'HomepageListView'}],
      });
      return;
    }

    resetToCurrentStackRoot();
    navigation.getParent?.()?.navigate('HomeTab', {
      screen: 'HomepageListView',
    });
  };

  const handleComplete = async (skip = false) => {
    setLoading(true);
    try {
      await dispatch(submitWeeklyReview({workoutDayId, rating, skip}));
      dispatch(getHomepage());
      
      navigateHome();
    } catch (e) {
      console.error(e);
      navigateHome();
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.container}>
        <TouchableOpacity onPress={navigateHome} style={styles.closeButton}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path d="M18 6L6 18M6 6L18 18" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>

        <View style={styles.content}>
          <View style={styles.starRow}>
            {[1, 2, 3, 4, 5].map((s) => (
              <TouchableOpacity key={s} onPress={() => setRating(s)}>
                <Svg width={40} height={40} viewBox="0 0 24 24" fill={s <= rating ? ACCENT : '#888'}>
                  <Path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </Svg>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.title}>How are we doing?</Text>
          <Text style={styles.subtitle}>Your opinion means the world.{"\n"}Please share it with us!</Text>

          <TouchableOpacity 
            onPress={() => handleComplete(false)}
            disabled={loading}
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          >
            {loading ? <ActivityIndicator color={BACKGROUND} /> : <Text style={styles.submitButtonText}>Submit</Text>}
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => handleComplete(true)}
            disabled={loading}
            style={styles.skipButton}
          >
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: BACKGROUND},
  container: {flex: 1, paddingHorizontal: 30},
  closeButton: {marginTop: 10, alignSelf: 'flex-end'},
  content: {flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 60},
  starRow: {flexDirection: 'row', gap: 10, marginBottom: 24},
  title: {color: '#FFF', fontSize: 32, fontFamily: 'Raleway-Black', marginBottom: 12, textAlign: 'center'},
  subtitle: {color: '#BBB', fontSize: 16, fontFamily: 'Raleway-Medium', marginBottom: 30, textAlign: 'center', lineHeight: 22},
  submitButton: {
    width: '100%',
    height: 60,
    backgroundColor: ACCENT,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 16,
  },
  submitButtonDisabled: {opacity: 0.7},
  submitButtonText: {color: BACKGROUND, fontSize: 20, fontFamily: 'Raleway-Bold'},
  skipButton: {padding: 10},
  skipText: {color: '#BBB', fontSize: 14, fontFamily: 'Raleway-Medium'},
});

export default WorkoutSurveyView;
