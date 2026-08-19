import { useNavigation } from "@react-navigation/native";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { getProgressPhotoComparison } from "../../slice/HomeSlice";
import { useAppDispatch, useAppSelector } from "../../store";
import type { ProgressPhotoPose } from "../../types/plans";

const ACCENT = "#68FE00";
const BACKGROUND = "#171717";
const SURFACE = "#232323";
const MUTED = "#9B9B9B";

const POSE_LABELS: Record<ProgressPhotoPose, string> = {
  front: "Front",
  back: "Back",
  left_side: "Left side",
  right_side: "Right side",
};

const formatDate = (date?: string | null) => {
  if (!date) return "—";

  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;

  return parsed.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

/** Side-by-side view of this check-in against the previous one. */
const ProgressPhotoComparisonView = ({
  onStartCheckIn,
}: {
  onStartCheckIn?: () => void;
}) => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const comparison = useAppSelector(
    (state) => state.home.progressPhotoComparison,
  );
  const status = useAppSelector((state) => state.home.progressPhotoStatus);
  const uploading = useAppSelector((state) => state.home.progressPhotoUploading);

  useEffect(() => {
    void dispatch(getProgressPhotoComparison());
  }, [dispatch]);

  const isLoading = !comparison && !uploading;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
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
          <Text style={styles.headerTitle}>Progress photos</Text>
          <View style={styles.headerSpacer} />
        </View>

        {status?.check_in_weekday_label ? (
          <Text style={styles.scheduleNote}>
            Check-in day: {status.check_in_weekday_label}
            {status.next_check_in_date
              ? ` · next on ${formatDate(status.next_check_in_date)}`
              : ""}
          </Text>
        ) : null}

        {isLoading ? (
          <ActivityIndicator color={ACCENT} style={styles.loader} />
        ) : comparison?.available ? (
          <>
            <View style={styles.legendRow}>
              <Text style={styles.legendText}>
                Before · {formatDate(comparison.baseline?.date)}
              </Text>
              <Text style={styles.legendText}>
                Now · {formatDate(comparison.latest?.date)}
              </Text>
            </View>

            {comparison.poses.map((row) => (
              <View key={row.pose} style={styles.poseBlock}>
                <Text style={styles.poseLabel}>
                  {POSE_LABELS[row.pose] ?? row.pose}
                </Text>
                <View style={styles.pairRow}>
                  <PhotoSlot uri={row.baseline_image_url} />
                  <PhotoSlot uri={row.latest_image_url} />
                </View>
              </View>
            ))}
          </>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No comparison yet</Text>
            <Text style={styles.emptyText}>
              {status?.check_in_count
                ? "Complete your next weekly check-in to see your photos side by side."
                : "Take your first set of check-in photos to start tracking your progress."}
            </Text>
          </View>
        )}

        {onStartCheckIn ? (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onStartCheckIn}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>
              {status?.is_due_today ? "Start today's check-in" : "New check-in"}
            </Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

const PhotoSlot = ({ uri }: { uri: string | null }) =>
  uri ? (
    <Image source={{ uri }} style={styles.photo} resizeMode="cover" />
  ) : (
    <View style={[styles.photo, styles.photoEmpty]}>
      <Text style={styles.photoEmptyText}>Skipped</Text>
    </View>
  );

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BACKGROUND },
  content: { paddingHorizontal: 24, paddingBottom: 48 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    marginBottom: 8,
  },
  backButton: { width: 28 },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Raleway-Bold",
  },
  headerSpacer: { width: 28 },
  scheduleNote: {
    color: MUTED,
    fontSize: 13,
    fontFamily: "Raleway-Medium",
    marginBottom: 20,
  },
  loader: { marginTop: 40 },
  legendRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    gap: 12,
  },
  legendText: {
    flex: 1,
    color: MUTED,
    fontSize: 12,
    fontFamily: "Raleway-SemiBold",
    textAlign: "center",
  },
  poseBlock: { marginBottom: 24 },
  poseLabel: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "Raleway-Bold",
    marginBottom: 10,
  },
  pairRow: { flexDirection: "row", gap: 12 },
  photo: {
    flex: 1,
    aspectRatio: 3 / 4,
    borderRadius: 16,
    backgroundColor: SURFACE,
  },
  photoEmpty: { alignItems: "center", justifyContent: "center" },
  photoEmptyText: {
    color: MUTED,
    fontSize: 13,
    fontFamily: "Raleway-Medium",
  },
  emptyCard: {
    backgroundColor: SURFACE,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontFamily: "Raleway-Bold",
    marginBottom: 8,
  },
  emptyText: {
    color: MUTED,
    fontSize: 14,
    fontFamily: "Raleway-Medium",
    textAlign: "center",
    lineHeight: 21,
  },
  primaryButton: {
    height: 54,
    borderRadius: 27,
    backgroundColor: ACCENT,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  primaryButtonText: {
    color: BACKGROUND,
    fontSize: 16,
    fontFamily: "Raleway-Bold",
  },
});

export default ProgressPhotoComparisonView;
