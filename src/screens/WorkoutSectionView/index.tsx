import React, {useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Svg, {Path} from 'react-native-svg';

import {useAppSelector} from '../../store';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {NavigationProp, RouteProp} from '@react-navigation/native';
import type {MainStackParamList, WorkoutFlowParamList} from '../../navigation/MainStack';

const ACCENT = '#8FFF19';
const BACKGROUND = '#171717';

const WorkoutSectionView = () => {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const route = useRoute<RouteProp<WorkoutFlowParamList, 'WorkoutSectionView'>>();
  const {section, dayName} = route.params;
  const {fitnessPlan} = useAppSelector(state => state.home);
  const hasVideoAccess = fitnessPlan?.has_video_access === true;

  // Use fitnessPlan from redux for reactive updates
  const activeSection = useMemo(() => {
    if (!fitnessPlan?.days) return section;
    for (const day of fitnessPlan.days) {
      const found = day.sections?.find(s => s.id === section.id);
      if (found) return found;
    }
    return section;
  }, [fitnessPlan, section]);

  const exercises = activeSection?.exercises || [];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Svg width={28} height={28} viewBox="0 0 28 28">
                <Path d="M18 5L9 14L18 23" stroke="#FFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{activeSection?.section_name?.toUpperCase() || 'WORKOUT'}</Text>
            <View style={styles.headerSpacer} />
          </View>

          <Text style={styles.daySubtitle}>{dayName}</Text>

          {exercises.map((ex, index) => (
            <View key={ex.id || index} style={styles.exerciseCard}>
              <TouchableOpacity 
                activeOpacity={0.8}
                onPress={() => navigation.navigate('ExercisePlayerView', {
                  exercise: ex,
                  sectionName: activeSection?.section_name,
                  hasVideoAccess,
                })}
                style={styles.exerciseInfo}
              >
                <Text style={styles.exerciseName}>{ex.exercise_name}</Text>
                <Text style={styles.exerciseMeta}>{ex.sets} Sets | {ex.reps} Reps</Text>
              </TouchableOpacity>

              <View
                style={[styles.checkbox, ex.is_completed && styles.checkboxActive]}
              >
                {ex.is_completed && (
                  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                    <Path d="M20 6L9 17L4 12" stroke={BACKGROUND} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                )}
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: BACKGROUND},
  container: {flex: 1, backgroundColor: BACKGROUND},
  content: {paddingHorizontal: 34, paddingBottom: 50},
  header: {height: 82, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10},
  backButton: {width: 42, height: 42, justifyContent: 'center'},
  headerTitle: {color: '#FFF', fontSize: 24, fontFamily: 'Raleway-Black'},
  headerSpacer: {width: 42},
  daySubtitle: {color: '#FFF', fontSize: 18, fontFamily: 'Raleway-Bold', marginBottom: 30},
  exerciseCard: {
    backgroundColor: '#2E2E2E',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  exerciseInfo: {flex: 1},
  exerciseName: {color: '#FFF', fontSize: 18, fontFamily: 'Raleway-Bold', marginBottom: 4},
  exerciseMeta: {color: '#AAA', fontSize: 14, fontFamily: 'Raleway-Medium'},
  checkbox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 15,
  },
  checkboxActive: {
    backgroundColor: ACCENT,
  },
});

export default WorkoutSectionView;
