import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Svg, {Circle, Path} from 'react-native-svg';

import {getHomepage, updateExerciseCompletion} from '../../slice/HomeSlice';
import {useAppDispatch} from '../../store';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {NavigationProp, RouteProp} from '@react-navigation/native';
import type {MainStackParamList, WorkoutFlowParamList} from '../../navigation/MainStack';

const ACCENT = '#68FE00';
const BACKGROUND = '#171717';

const BACKGROUND_IMAGE_URL = 'https://d1t9z5ilqoa9lf.cloudfront.net/pages/background-workout-starter.png';

const ExercisePlayerView = () => {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const route = useRoute<RouteProp<WorkoutFlowParamList, 'ExercisePlayerView'>>();
  const {exercise, sectionName} = route.params;
  const dispatch = useAppDispatch();
  
  // Parse instructions into steps if possible, or just show them
  const instructions =
    exercise?.instruction_text ||
    'Instructions are not available for this exercise.';
  const rawSteps = instructions.split('\n\n').filter(Boolean);
  const steps = rawSteps.map((s: string) => {
    const parts = s.split('\n');
    return {
      title: parts[0],
      desc: parts.slice(1).join('\n') || parts[0],
    };
  });

  const onFinish = async () => {
    if (exercise?.id) {
      await dispatch(updateExerciseCompletion({
        userWorkoutExerciseId: exercise.id,
        is_completed: true
      }));
    }
    dispatch(getHomepage());
    navigation.navigate('WorkoutSuccessView', {exercise});
  };

  return (
    <View style={styles.container}>
      <ImageBackground 
        source={{ uri: exercise?.image_url || BACKGROUND_IMAGE_URL }} 
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <SafeAreaView style={styles.overlay} edges={['top', 'left', 'right', 'bottom']}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                <Path d="M15 18L9 12L15 6" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{exercise?.exercise_name || sectionName || 'Stretching'}</Text>
            <View style={styles.headerSpacer} />
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {steps.map((step, index) => (
              <View key={index} style={[styles.stepCard, index === 0 && styles.stepCardActive]}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepBadgeText}>{index + 1}</Text>
                </View>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepText}>{step.desc}</Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity 
              onPress={onFinish}
              activeOpacity={0.8}
              style={styles.timerBadge}
            >
               <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" style={{marginRight: 8}}>
                <Circle cx="12" cy="12" r="10" stroke={ACCENT} strokeWidth="2" />
                <Path d="M12 7V12L15 15" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" />
              </Svg>
              <Text style={styles.timerText}>{exercise?.estimated_minutes || '30'} mins</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: BACKGROUND},
  backgroundImage: {flex: 1},
  overlay: {flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 24},
  header: {height: 80, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  backButton: {width: 40, height: 40, justifyContent: 'center'},
  headerTitle: {color: '#FFF', fontSize: 18, fontFamily: 'Raleway-Medium'},
  headerSpacer: {width: 40},
  scrollContent: {paddingTop: 80, paddingBottom: 40},
  stepCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginBottom: 24,
    position: 'relative',
  },
  stepCardActive: {
    backgroundColor: 'rgba(104, 254, 0, 0.4)',
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: -14,
    left: 20,
  },
  stepBadgeText: {color: '#171717', fontSize: 14, fontFamily: 'Raleway-Bold'},
  stepTitle: {color: '#FFF', fontSize: 18, fontFamily: 'Raleway-Medium', marginBottom: 10},
  stepText: {color: '#E0E0E0', fontSize: 14, fontFamily: 'Raleway-Medium', lineHeight: 22},
  footer: {paddingBottom: 40, alignItems: 'center'},
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: ACCENT,
    backgroundColor: '#000',
  },
  timerText: {color: '#FFF', fontSize: 18, fontFamily: 'Raleway-Bold'},
});

export default ExercisePlayerView;
