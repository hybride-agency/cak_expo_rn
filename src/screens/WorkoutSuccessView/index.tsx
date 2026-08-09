import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Svg, {Path, Circle} from 'react-native-svg';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {NavigationProp, RouteProp} from '@react-navigation/native';
import type {MainStackParamList, WorkoutFlowParamList} from '../../navigation/MainStack';

const ACCENT = '#68FE00';
const BACKGROUND = '#171717';

const WorkoutSuccessView = () => {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const route = useRoute<RouteProp<WorkoutFlowParamList, 'WorkoutSuccessView'>>();
  const {exercise} = route.params;

  const navigateHome = () => {
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

    navigation.getParent?.()?.navigate('HomeTab', {
      screen: 'HomepageListView',
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path d="M15 18L9 12L15 6" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={styles.title}>Congratulations!</Text>
          <Text style={styles.subtitle}>You have completed the workout!</Text>

          <View style={styles.statsRow}>
            <StatCard icon="exercise" label={exercise.exercise_name || 'Completed'} />
            <StatCard
              icon="burn"
              label={exercise.kcal_burned || exercise.calories_burned || exercise.kcal
                ? `${exercise.kcal_burned ?? exercise.calories_burned ?? exercise.kcal} kcal`
                : '— kcal'}
            />
            <StatCard
              icon="time"
              label={exercise.estimated_minutes ? `${exercise.estimated_minutes} mins` : '— mins'}
            />
          </View>

          <TouchableOpacity 
            onPress={() => navigation.navigate('WorkoutSurveyView', {currentExerciseId: exercise.id})}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>Next Workout</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={navigateHome}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>Back to home</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const StatCard = ({icon, label}: {icon: string; label: string}) => (
  <View style={styles.statCard}>
    <View style={styles.iconCircle}>
       {icon === 'exercise' && (
         <Svg width={24} height={24} viewBox="0 0 24 24" fill="#FFF">
           <Path d="M20.57 14.86L22 13.43L20.57 12L17 15.57L8.43 7L12 3.43L10.57 2L9.14 3.43L7.71 2L5.57 4.14L4.14 2.71L2.71 4.14L4.14 5.57L2 7.71L3.43 9.14L2 10.57L3.43 12L7 8.43L15.57 17L12 20.57L13.43 22L14.86 20.57L16.29 22L18.43 19.86L19.86 21.29L21.29 19.86L19.86 18.43L22 16.29L20.57 14.86Z" />
         </Svg>
       )}
       {icon === 'burn' && (
         <Svg width={24} height={24} viewBox="0 0 24 24" fill="#FFF">
           <Path d="M13.5,0.67c0,0-2.97,0.33-4.52,4.42c-0.1,0.26-0.34,0.46-0.62,0.52C7.38,5.81,6,7.56,6,9.5c0,2.18,1.55,3.99,3.61,4.4c0.28,0.06,0.47,0.29,0.49,0.57c0.03,0.31,0.05,0.61,0.05,0.92c0,1.25-0.5,2.39-1.32,3.22c-0.2-0.2-0.53,0.18-0.7-0.05C7.35,17.38,6.88,16,7.16,14.4c0.05-0.27-0.15-0.53-0.42-0.57c-0.27-0.04-0.53,0.15-0.57,0.42c-0.43,2.44,0.38,4.7,1.96,6.18C8.94,21.2,10.18,22,11.5,22c2.48,0,4.5-2.02,4.5-4.5c0-1.15-0.43-2.2-1.15-3c-0.2-0.22-0.18-0.56,0.04-0.76c0.69-0.63,1.38-1.55,1.75-2.83c0.11-0.38-0.16-0.78-0.56-0.84c-0.32-0.05-0.61,0.15-0.7,0.45c-0.34,1.15-1,1.87-1.6,2.23c-0.29,0.18-0.67,0.02-0.75-0.31c-0.19-0.79-0.28-1.74-0.28-2.73c0-1.73,0.31-3.32,0.85-4.71c0.11-0.29,0-0.62-0.26-0.78c-0.26-0.16-0.6-0.09-0.78,0.16c-0.33,0.45-0.61,0.93-0.85,1.44c-0.12,0.25-0.42,0.36-0.67,0.24c-0.25-0.12-0.36-0.42-0.24-0.67c0.3-0.63,0.65-1.23,1.06-1.78C13.5,0.67,13.5,0.67,13.5,0.67z" />
         </Svg>
       )}
       {icon === 'time' && (
         <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
           <Circle cx="12" cy="12" r="10" stroke="#FFF" strokeWidth="2" />
           <Path d="M12 7V12L15 15" stroke="#FFF" strokeWidth="2" strokeLinecap="round" />
         </Svg>
       )}
    </View>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: BACKGROUND},
  container: {flex: 1, paddingHorizontal: 30},
  backButton: {marginTop: 20, width: 40, height: 40, justifyContent: 'center'},
  content: {flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 60},
  title: {color: '#FFF', fontSize: 36, fontFamily: 'Raleway-Black', marginBottom: 12, textAlign: 'center'},
  subtitle: {color: '#BBB', fontSize: 16, fontFamily: 'Raleway-Medium', marginBottom: 40, textAlign: 'center'},
  statsRow: {flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 60},
  statCard: {
    width: '30%',
    height: 110,
    backgroundColor: ACCENT,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statLabel: {color: BACKGROUND, fontSize: 14, fontFamily: 'Raleway-Medium'},
  primaryButton: {
    width: '100%',
    height: 60,
    backgroundColor: ACCENT,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  primaryButtonText: {color: BACKGROUND, fontSize: 20, fontFamily: 'Raleway-Bold'},
  secondaryButton: {
    width: '100%',
    height: 60,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {color: ACCENT, fontSize: 20, fontFamily: 'Raleway-Bold'},
});

export default WorkoutSuccessView;
