import React, {useEffect, useMemo} from 'react';
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
import {getFitnessPlan} from '../../slice/HomeSlice';
import {useAppDispatch, useAppSelector} from '../../store';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {WorkoutStackParamList} from '../../navigation/MainStack';
import type {FitnessPlanDay} from '../../types/plans';

const ACCENT = '#8FFF19';

const FitnessPlanView = () => {
  const navigation = useNavigation<NativeStackNavigationProp<WorkoutStackParamList>>();
  const dispatch = useAppDispatch();
  const {fitnessPlan, loading} = useAppSelector(state => state.home);
  const [selectedDayIndex, setSelectedDayIndex] = React.useState(0);
  const hasSyncedToday = React.useRef(false);

  const days = useMemo(() => Array.isArray(fitnessPlan?.days) ? fitnessPlan.days : [], [fitnessPlan]);
  const activeDay = days[selectedDayIndex] || days[0];
  const groups = useMemo(() => activeDay ? [activeDay] : [], [activeDay]);

  useEffect(() => {
    dispatch(getFitnessPlan());
  }, [dispatch]);

  // Sync selectedDayIndex to "today" if available on first load
  useEffect(() => {
    if (fitnessPlan?.days && !hasSyncedToday.current) {
      const today = new Date().toISOString().split('T')[0];
      const todayIndex = fitnessPlan.days.findIndex(d => d.date === today);
      if (todayIndex !== -1) {
        setSelectedDayIndex(todayIndex);
      }
      hasSyncedToday.current = true;
    }
  }, [fitnessPlan]);

  const formattedDate = useMemo(() => {
    if (!activeDay?.date) return 'Fitness Plan';
    const date = new Date(activeDay.date);
    return date.toLocaleDateString('en-US', {weekday: 'long', day: 'numeric', month: 'long'});
  }, [activeDay]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Header title="Fitness plan" onBack={() => navigation.goBack()} />
          
          <WeekStrip 
            days={days}
            selectedIndex={selectedDayIndex}
            onSelect={setSelectedDayIndex}
          />

          <Text style={styles.dateTitle}>{formattedDate}</Text>

          {loading && !fitnessPlan ? (
            <ActivityIndicator color={ACCENT} style={{marginTop: 50}} />
          ) : (
            groups.length > 0 ? (
              groups.map((group, index) => (
                <WorkoutGroupCard
                  key={group.id}
                  group={{...group, active: index === 0}}
                  onPress={() => {
                    const section = group.rawSection ?? group.sections?.[0];
                    if (section) {
                      navigation.navigate('WorkoutSectionView', {
                        section,
                        dayName: formattedDate,
                      });
                    }
                  }}
                />
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No workout scheduled for this day.</Text>
              </View>
            )
          )}

          <View style={styles.photoRow}>
            <View style={styles.photoCard}>
              <Text style={styles.photoTitle}>Progress{'\n'}Photos</Text>
            </View>
            <View style={[styles.photoCard, styles.compareCard]}>
              <Text style={styles.photoTitle}>Compare my{'\n'}photos</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const Header = ({title, onBack}: {title: string; onBack: () => void}) => (
  <View style={styles.header}>
    <TouchableOpacity onPress={onBack} style={styles.backButton}>
      <Svg width={28} height={28} viewBox="0 0 28 28">
        <Path d="M18 5L9 14L18 23" stroke="#FFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    </TouchableOpacity>
    <Text style={styles.headerTitle}>{title}</Text>
    <View style={styles.headerSpacer} />
  </View>
);

const WeekStrip = ({days, selectedIndex, onSelect}: {days: FitnessPlanDay[]; selectedIndex: number; onSelect: (i: number) => void}) => {
  const displayDays = useMemo(() => {
    return days;
  }, [days]);

  return (
    <View style={styles.weekStrip}>
      {displayDays.map((item, index) => {
        const isActive = index === selectedIndex;
        const dayLabel = (item.day_name || 'Day').substring(0, 3);
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


type WorkoutGroup = FitnessPlanDay & {active: boolean};

const WorkoutGroupCard = ({group, onPress}: {group: WorkoutGroup; onPress: () => void}) => (
  <TouchableOpacity 
    activeOpacity={0.9} 
    onPress={onPress}
    style={[styles.groupCard, group.active && styles.groupCardActive]}
  >
    <View style={styles.groupCopy}>
      <Text style={[styles.groupTitle, group.active && styles.groupTitleActive]}>{group.title}</Text>
      <Text style={[styles.groupDescription, group.active && styles.groupDescriptionActive]}>{group.description}</Text>
      <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={styles.viewMoreButton}>
        <Text style={styles.viewMoreText}>View more</Text>
      </TouchableOpacity>
    </View>
    <View style={styles.groupImagePlaceholder} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#171717'},
  container: {flex: 1, backgroundColor: '#171717'},
  content: {paddingHorizontal: 24, paddingBottom: 160},
  header: {height: 82, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10},
  backButton: {width: 42, height: 42, justifyContent: 'center'},
  headerTitle: {color: '#FFF', fontSize: 20, fontFamily: 'Raleway-Bold', includeFontPadding: false},
  headerSpacer: {width: 42},
  weekStrip: {flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30},
  dayItem: {alignItems: 'center', gap: 10, width: 44, paddingVertical: 8, borderRadius: 22},
  dayItemActive: {backgroundColor: ACCENT},
  dayLabel: {color: '#FFF', fontSize: 13, fontFamily: 'Raleway-Bold'},
  dayLabelActive: {color: '#111'},
  dateCircle: {width: 32, height: 32, borderRadius: 16, backgroundColor: '#2E2E2E', alignItems: 'center', justifyContent: 'center'},
  dateCircleActive: {backgroundColor: '#171717'},
  dateText: {color: '#FFF', fontSize: 12, fontFamily: 'Raleway-Bold'},
  dateTextActive: {color: ACCENT},
  dateTitle: {color: '#FFF', fontSize: 20, fontFamily: 'Raleway-Bold', marginBottom: 24},
  groupCard: {minHeight: 142, borderRadius: 20, backgroundColor: '#364821', marginBottom: 16, padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  groupCardActive: {backgroundColor: '#364821'},
  groupCopy: {flex: 1, minWidth: 0},
  groupTitle: {color: '#FFF', fontSize: 16, fontFamily: 'Raleway-Bold', marginBottom: 6},
  groupTitleActive: {color: '#FFF'},
  groupDescription: {color: '#BBB', fontSize: 13, fontFamily: 'Raleway-Medium', marginBottom: 16},
  groupDescriptionActive: {color: '#BBB'},
  viewMoreButton: {backgroundColor: '#252525', alignSelf: 'flex-start', borderRadius: 22, paddingHorizontal: 16, paddingVertical: 8},
  viewMoreText: {color: ACCENT, fontSize: 12, fontFamily: 'Raleway-Bold'},
  groupImagePlaceholder: {width: 80, height: 80, borderRadius: 40, backgroundColor: '#8B9683', marginLeft: 16},
  photoRow: {flexDirection: 'row', gap: 16, marginTop: 30},
  photoCard: {flex: 1, minHeight: 160, backgroundColor: '#2A2A2A', borderRadius: 20, alignItems: 'center', justifyContent: 'space-around', paddingVertical: 20},
  compareCard: {borderColor: ACCENT, borderWidth: 1.5, backgroundColor: '#222'},
  photoTitle: {color: '#FFF', fontSize: 18, textAlign: 'center', fontFamily: 'Raleway-Medium', lineHeight: 24},
  emptyContainer: {marginTop: 60, alignItems: 'center'},
  emptyText: {color: '#666', fontSize: 16, fontFamily: 'Raleway-Medium'},
});

export default FitnessPlanView;
