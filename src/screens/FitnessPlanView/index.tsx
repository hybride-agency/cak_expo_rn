import React, {useCallback, useMemo} from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Svg, {Path} from 'react-native-svg';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

import type {WorkoutStackParamList} from '../../navigation/MainStack';
import {getFitnessPlan} from '../../slice/HomeSlice';
import {useAppDispatch, useAppSelector} from '../../store';
import type {FitnessPlanDay, WorkoutSection} from '../../types/plans';

const ACCENT = '#8FFF19';

const FitnessPlanView = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<WorkoutStackParamList>>();
  const dispatch = useAppDispatch();
  const {fitnessPlan, fitnessPlanLoading, fitnessPlanError} = useAppSelector(
    state => state.home,
  );
  const [selectedDayIndex, setSelectedDayIndex] = React.useState(0);
  const syncedWeekStart = React.useRef<string | undefined>(undefined);

  const days = useMemo(
    () => (Array.isArray(fitnessPlan?.days) ? fitnessPlan.days : []),
    [fitnessPlan],
  );
  const activeDay = days[selectedDayIndex] || days[0];
  const sections = useMemo(() => {
    if (activeDay?.sections?.length) return activeDay.sections;
    return activeDay?.rawSection ? [activeDay.rawSection] : [];
  }, [activeDay]);
  const hasVideoAccess = fitnessPlan?.has_video_access === true;

  useFocusEffect(
    useCallback(() => {
      dispatch(getFitnessPlan());
    }, [dispatch]),
  );

  React.useEffect(() => {
    const weekStart = fitnessPlan?.week?.start_date ?? days[0]?.date;
    if (days.length === 0 || syncedWeekStart.current === weekStart) return;

    const todayIndex = days.findIndex(day => day.date === getLocalDateKey());
    setSelectedDayIndex(todayIndex >= 0 ? todayIndex : 0);
    syncedWeekStart.current = weekStart;
  }, [days, fitnessPlan?.week?.start_date]);

  const formattedDate = useMemo(
    () => formatWorkoutDate(activeDay?.date),
    [activeDay?.date],
  );

  const renderPlanContent = () => {
    if (fitnessPlanLoading && !fitnessPlan) {
      return <ActivityIndicator color={ACCENT} style={styles.loader} />;
    }

    if (fitnessPlanError && !fitnessPlan) {
      return (
        <StatusCard
          message={fitnessPlanError}
          actionLabel="Try again"
          onPress={() => dispatch(getFitnessPlan())}
        />
      );
    }

    if (fitnessPlan?.requires_quiz_completion) {
      return (
        <StatusCard message="Complete your fitness quiz to generate your personalized workout plan." />
      );
    }

    if (sections.length === 0) {
      return <StatusCard message="No workout is scheduled for this day." />;
    }

    return sections.map(section => (
      <WorkoutSectionCard
        key={section.id}
        section={section}
        day={activeDay}
        hasVideoAccess={hasVideoAccess}
        onPress={() =>
          navigation.navigate('WorkoutSectionView', {
            section,
            dayName: formattedDate,
          })
        }
      />
    ));
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          <Header title="Fitness plan" onBack={() => navigation.goBack()} />

          {days.length > 0 ? (
            <WeekStrip
              days={days}
              selectedIndex={selectedDayIndex}
              onSelect={setSelectedDayIndex}
            />
          ) : null}

          <View style={styles.dateRow}>
            <Text style={styles.dateTitle}>{formattedDate}</Text>
            {fitnessPlan?.has_video_access && !fitnessPlan.requires_quiz_completion ? (
              <View style={styles.planBadge}>
                <Text style={styles.planBadgeText}>VIDEO</Text>
              </View>
            ) : null}
          </View>

          {renderPlanContent()}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const Header = ({title, onBack}: {title: string; onBack: () => void}) => (
  <View style={styles.header}>
    <TouchableOpacity onPress={onBack} style={styles.backButton}>
      <Svg width={28} height={28} viewBox="0 0 28 28">
        <Path
          d="M18 5L9 14L18 23"
          stroke="#FFF"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </TouchableOpacity>
    <Text style={styles.headerTitle}>{title}</Text>
    <View style={styles.headerSpacer} />
  </View>
);

const WeekStrip = ({
  days,
  selectedIndex,
  onSelect,
}: {
  days: FitnessPlanDay[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}) => (
  <View style={styles.weekStrip}>
    {days.map((item, index) => {
      const isActive = index === selectedIndex;
      const dayLabel = item.day_name?.slice(0, 3) || getWeekdayLabel(item.date);
      const dateNumber = item.date?.split('-').pop() || String(item.day_number || index + 1);

      return (
        <TouchableOpacity
          key={item.id ?? item.date ?? index}
          activeOpacity={0.8}
          onPress={() => onSelect(index)}
          style={[styles.dayItem, isActive && styles.dayItemActive]}>
          <Text style={[styles.dayLabel, isActive && styles.dayLabelActive]}>
            {dayLabel}
          </Text>
          <View style={[styles.dateCircle, isActive && styles.dateCircleActive]}>
            <Text style={[styles.dateText, isActive && styles.dateTextActive]}>
              {dateNumber}
            </Text>
          </View>
        </TouchableOpacity>
      );
    })}
  </View>
);

const WorkoutSectionCard = ({
  section,
  day,
  hasVideoAccess,
  onPress,
}: {
  section: WorkoutSection;
  day?: FitnessPlanDay;
  hasVideoAccess: boolean;
  onPress: () => void;
}) => {
  const exerciseCount = section.exercise_count ?? section.exercises?.length ?? 0;
  const completedCount =
    section.completed_exercise_count ??
    section.exercises?.filter(exercise => exercise.is_completed).length ??
    0;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={styles.groupCard}>
      <View style={styles.groupCopy}>
        <Text style={styles.groupTitle}>
          {section.section_name || day?.focus || 'Workout'}
        </Text>
        <Text style={styles.groupDescription}>
          {day?.summary || `${exerciseCount} exercises · ${completedCount} completed`}
        </Text>
        <View style={styles.viewMoreButton}>
          <Text style={styles.viewMoreText}>
            {hasVideoAccess ? 'Watch workout' : 'View workout'}
          </Text>
        </View>
      </View>
      <View style={styles.progressCircle}>
        <Text style={styles.progressValue}>
          {exerciseCount > 0 ? `${completedCount}/${exerciseCount}` : '0'}
        </Text>
        <Text style={styles.progressLabel}>DONE</Text>
      </View>
    </TouchableOpacity>
  );
};

const StatusCard = ({
  message,
  actionLabel,
  onPress,
}: {
  message: string;
  actionLabel?: string;
  onPress?: () => void;
}) => (
  <View style={styles.statusCard}>
    <Text style={styles.statusText}>{message}</Text>
    {actionLabel && onPress ? (
      <TouchableOpacity onPress={onPress} style={styles.retryButton}>
        <Text style={styles.retryText}>{actionLabel}</Text>
      </TouchableOpacity>
    ) : null}
  </View>
);

const getLocalDateKey = () => {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};

const parseDate = (date?: string) => (date ? new Date(`${date}T12:00:00`) : null);

const getWeekdayLabel = (date?: string) => {
  const parsedDate = parseDate(date);
  return parsedDate
    ? parsedDate.toLocaleDateString('en-US', {weekday: 'short'})
    : 'Day';
};

const formatWorkoutDate = (date?: string) => {
  const parsedDate = parseDate(date);
  return parsedDate
    ? parsedDate.toLocaleDateString('en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      })
    : 'Your workout plan';
};

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#171717'},
  container: {flex: 1, backgroundColor: '#171717'},
  content: {paddingHorizontal: 24, paddingBottom: 160},
  header: {
    height: 82,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  backButton: {width: 42, height: 42, justifyContent: 'center'},
  headerTitle: {color: '#FFF', fontSize: 20, fontFamily: 'Raleway-Bold'},
  headerSpacer: {width: 42},
  weekStrip: {flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30},
  dayItem: {alignItems: 'center', gap: 10, width: 44, paddingVertical: 8, borderRadius: 22},
  dayItemActive: {backgroundColor: ACCENT},
  dayLabel: {color: '#FFF', fontSize: 13, fontFamily: 'Raleway-Bold'},
  dayLabelActive: {color: '#111'},
  dateCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2E2E2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateCircleActive: {backgroundColor: '#171717'},
  dateText: {color: '#FFF', fontSize: 12, fontFamily: 'Raleway-Bold'},
  dateTextActive: {color: ACCENT},
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 24,
  },
  dateTitle: {color: '#FFF', fontSize: 20, fontFamily: 'Raleway-Bold', flex: 1},
  planBadge: {backgroundColor: '#334A1C', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6},
  planBadgeText: {color: ACCENT, fontSize: 9, fontFamily: 'Raleway-Bold'},
  loader: {marginTop: 50},
  groupCard: {
    minHeight: 142,
    borderRadius: 20,
    backgroundColor: '#364821',
    marginBottom: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  groupCopy: {flex: 1, minWidth: 0},
  groupTitle: {color: '#FFF', fontSize: 17, fontFamily: 'Raleway-Bold', marginBottom: 6},
  groupDescription: {color: '#C8CFBF', fontSize: 13, fontFamily: 'Raleway-Medium', marginBottom: 16},
  viewMoreButton: {backgroundColor: '#252525', alignSelf: 'flex-start', borderRadius: 22, paddingHorizontal: 16, paddingVertical: 8},
  viewMoreText: {color: ACCENT, fontSize: 12, fontFamily: 'Raleway-Bold'},
  progressCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#26351A',
    borderColor: ACCENT,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
  },
  progressValue: {color: '#FFF', fontSize: 18, fontFamily: 'Raleway-Bold'},
  progressLabel: {color: ACCENT, fontSize: 9, fontFamily: 'Raleway-Bold', marginTop: 2},
  statusCard: {backgroundColor: '#2A2A2A', borderRadius: 20, padding: 24, alignItems: 'center'},
  statusText: {color: '#BBB', fontSize: 15, fontFamily: 'Raleway-Medium', textAlign: 'center', lineHeight: 22},
  retryButton: {marginTop: 18, backgroundColor: ACCENT, borderRadius: 20, paddingHorizontal: 20, paddingVertical: 10},
  retryText: {color: '#171717', fontSize: 13, fontFamily: 'Raleway-Bold'},
});

export default FitnessPlanView;
