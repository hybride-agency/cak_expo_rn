import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  getWorkoutSchedule,
  updateWorkoutSchedule,
} from "../../slice/HomeSlice";
import { useAppDispatch, useAppSelector } from "../../store";

const ACCENT = "#68FE00";
const BACKGROUND = "#171717";
const SURFACE = "#232323";
const MUTED = "#9B9B9B";

const WEEKDAYS = [
  { weekday: 1, label: "Monday", short: "Mon" },
  { weekday: 2, label: "Tuesday", short: "Tue" },
  { weekday: 3, label: "Wednesday", short: "Wed" },
  { weekday: 4, label: "Thursday", short: "Thu" },
  { weekday: 5, label: "Friday", short: "Fri" },
  { weekday: 6, label: "Saturday", short: "Sat" },
  { weekday: 7, label: "Sunday", short: "Sun" },
];

const DEFAULTS: Record<number, number[]> = {
  2: [1, 4],
  3: [1, 3, 5],
};

/**
 * Lets a new subscriber choose whether they train 2 or 3 days a week and which
 * weekdays those are. Everything else in the week becomes a rest day.
 */
const WorkoutScheduleView = ({
  onDone,
  onSkip,
  title = "Choose your workout days",
}: {
  onDone: () => void;
  onSkip?: () => void;
  title?: string;
}) => {
  const dispatch = useAppDispatch();
  const schedule = useAppSelector((state) => state.home.workoutSchedule);
  const saving = useAppSelector((state) => state.home.workoutScheduleSaving);

  const [daysPerWeek, setDaysPerWeek] = useState<number>(3);
  const [selected, setSelected] = useState<number[]>(DEFAULTS[3]);
  const [hydrated, setHydrated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void dispatch(getWorkoutSchedule());
  }, [dispatch]);

  // Seed from the quiz-derived schedule the backend already resolved.
  useEffect(() => {
    if (hydrated || !schedule) return;

    const days = schedule.days_per_week ?? 3;
    setDaysPerWeek(days);
    setSelected(
      schedule.weekdays?.length ? schedule.weekdays : (DEFAULTS[days] ?? DEFAULTS[3]),
    );
    setHydrated(true);
  }, [hydrated, schedule]);

  const isComplete = selected.length === daysPerWeek;

  const restDays = useMemo(
    () =>
      WEEKDAYS.filter((day) => !selected.includes(day.weekday)).map(
        (day) => day.short,
      ),
    [selected],
  );

  const changeDaysPerWeek = (days: number) => {
    setDaysPerWeek(days);
    setError(null);
    // Keep what the user already picked, trimming or topping up to the new count.
    setSelected((current) => {
      if (current.length === days) return current;
      if (current.length > days) return current.slice(0, days);

      const additions = (DEFAULTS[days] ?? []).filter(
        (weekday) => !current.includes(weekday),
      );

      return [...current, ...additions].slice(0, days).sort((a, b) => a - b);
    });
  };

  const toggleWeekday = (weekday: number) => {
    setError(null);
    setSelected((current) => {
      if (current.includes(weekday)) {
        return current.filter((value) => value !== weekday);
      }

      if (current.length >= daysPerWeek) {
        // Replace the oldest pick so tapping always does something.
        return [...current.slice(1), weekday].sort((a, b) => a - b);
      }

      return [...current, weekday].sort((a, b) => a - b);
    });
  };

  const onSave = async () => {
    if (!isComplete) {
      setError(`Pick exactly ${daysPerWeek} days.`);
      return;
    }

    const result = await dispatch(
      updateWorkoutSchedule({ days_per_week: daysPerWeek, weekdays: selected }),
    );

    if (updateWorkoutSchedule.rejected.match(result)) {
      setError((result.payload as string) ?? "Could not save your workout days.");
      return;
    }

    onDone();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>
          Your program runs 2 or 3 days a week. Pick the days that suit you — the
          rest of the week is for recovery.
        </Text>

        <Text style={styles.sectionLabel}>How many days a week?</Text>
        <View style={styles.frequencyRow}>
          {[2, 3].map((days) => {
            const isActive = days === daysPerWeek;

            return (
              <TouchableOpacity
                key={days}
                activeOpacity={0.85}
                onPress={() => changeDaysPerWeek(days)}
                style={[
                  styles.frequencyCard,
                  isActive && styles.frequencyCardActive,
                ]}
              >
                <Text
                  style={[
                    styles.frequencyValue,
                    isActive && styles.frequencyValueActive,
                  ]}
                >
                  {days}
                </Text>
                <Text
                  style={[
                    styles.frequencyLabel,
                    isActive && styles.frequencyLabelActive,
                  ]}
                >
                  days a week
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.sectionLabel}>
          Which days? ({selected.length}/{daysPerWeek} selected)
        </Text>
        <View style={styles.weekdayList}>
          {WEEKDAYS.map((day) => {
            const isActive = selected.includes(day.weekday);

            return (
              <TouchableOpacity
                key={day.weekday}
                activeOpacity={0.85}
                onPress={() => toggleWeekday(day.weekday)}
                style={[styles.weekdayRow, isActive && styles.weekdayRowActive]}
              >
                <Text
                  style={[
                    styles.weekdayLabel,
                    isActive && styles.weekdayLabelActive,
                  ]}
                >
                  {day.label}
                </Text>
                <View
                  style={[styles.checkbox, isActive && styles.checkboxActive]}
                >
                  {isActive ? <Text style={styles.checkboxMark}>✓</Text> : null}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {restDays.length > 0 ? (
          <Text style={styles.restNote}>
            Rest days: {restDays.join(", ")}
          </Text>
        ) : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onSave}
          disabled={saving}
          style={[styles.primaryButton, !isComplete && styles.buttonDisabled]}
        >
          {saving ? (
            <ActivityIndicator color={BACKGROUND} />
          ) : (
            <Text style={styles.primaryButtonText}>Save my workout days</Text>
          )}
        </TouchableOpacity>

        {onSkip ? (
          <TouchableOpacity onPress={onSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Decide later</Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BACKGROUND },
  content: { paddingHorizontal: 24, paddingBottom: 48, paddingTop: 12 },
  title: {
    color: "#FFFFFF",
    fontSize: 26,
    fontFamily: "Raleway-Bold",
    marginBottom: 10,
  },
  subtitle: {
    color: MUTED,
    fontSize: 14,
    fontFamily: "Raleway-Medium",
    lineHeight: 21,
    marginBottom: 28,
  },
  sectionLabel: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "Raleway-Bold",
    marginBottom: 12,
  },
  frequencyRow: { flexDirection: "row", gap: 14, marginBottom: 28 },
  frequencyCard: {
    flex: 1,
    backgroundColor: SURFACE,
    borderRadius: 20,
    paddingVertical: 22,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  frequencyCardActive: { borderColor: ACCENT },
  frequencyValue: {
    color: "#FFFFFF",
    fontSize: 30,
    fontFamily: "Raleway-Bold",
  },
  frequencyValueActive: { color: ACCENT },
  frequencyLabel: {
    color: MUTED,
    fontSize: 12,
    fontFamily: "Raleway-Medium",
    marginTop: 4,
  },
  frequencyLabelActive: { color: "#FFFFFF" },
  weekdayList: { gap: 10, marginBottom: 18 },
  weekdayRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: SURFACE,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: "transparent",
  },
  weekdayRowActive: { borderColor: ACCENT },
  weekdayLabel: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "Raleway-Medium",
  },
  weekdayLabelActive: { fontFamily: "Raleway-Bold" },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#4A4A4A",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxActive: { backgroundColor: ACCENT, borderColor: ACCENT },
  checkboxMark: {
    color: BACKGROUND,
    fontSize: 14,
    fontFamily: "Raleway-Bold",
  },
  restNote: {
    color: MUTED,
    fontSize: 13,
    fontFamily: "Raleway-Medium",
    marginBottom: 20,
  },
  error: {
    color: "#FF6B6B",
    fontSize: 13,
    fontFamily: "Raleway-Medium",
    marginBottom: 14,
  },
  primaryButton: {
    height: 54,
    borderRadius: 27,
    backgroundColor: ACCENT,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: { opacity: 0.5 },
  primaryButtonText: {
    color: BACKGROUND,
    fontSize: 16,
    fontFamily: "Raleway-Bold",
  },
  skipButton: { marginTop: 18, alignItems: "center" },
  skipText: {
    color: MUTED,
    fontSize: 14,
    fontFamily: "Raleway-Medium",
  },
});

export default WorkoutScheduleView;
