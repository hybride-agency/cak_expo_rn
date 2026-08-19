import * as ImagePicker from "expo-image-picker";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import {
  updateProgressPhotoSchedule,
  uploadProgressPhotos,
} from "../../slice/HomeSlice";
import { useAppDispatch, useAppSelector } from "../../store";
import {
  ensureMediaPermission,
  type MediaSource,
} from "../../utils/mediaPermissions";
import type { ProgressPhotoPose } from "../../types/plans";
import PoseGuide from "./PoseGuide";

const ACCENT = "#68FE00";
const BACKGROUND = "#171717";
const SURFACE = "#232323";
const SURFACE_ALT = "#2A2A2A";
const MUTED = "#9B9B9B";
const WARNING = "#FFB74D";

const POSES: { pose: ProgressPhotoPose; label: string; hint: string }[] = [
  { pose: "front", label: "Front", hint: "Face the camera, arms relaxed at your sides." },
  { pose: "back", label: "Back", hint: "Turn around, feet level, shoulders square." },
  { pose: "left_side", label: "Left side", hint: "Turn your left shoulder to the camera." },
  { pose: "right_side", label: "Right side", hint: "Turn your right shoulder to the camera." },
];

const WEEKDAYS = [
  { weekday: 1, short: "Mon" },
  { weekday: 2, short: "Tue" },
  { weekday: 3, short: "Wed" },
  { weekday: 4, short: "Thu" },
  { weekday: 5, short: "Fri" },
  { weekday: 6, short: "Sat" },
  { weekday: 7, short: "Sun" },
];

type PickedPhoto = { uri: string; name: string; type: string };

const toUploadFile = (uri: string, pose: ProgressPhotoPose): PickedPhoto => {
  const extension = (uri.split(".").pop() || "jpeg").split("?")[0];

  return {
    uri: Platform.OS === "ios" ? uri.replace("file://", "") : uri,
    name: `${pose}.${extension}`,
    type: `image/${extension === "jpg" ? "jpeg" : extension}`,
  };
};

/**
 * First-run progress photo check-in: four angles, then the weekday the user
 * repeats them on. Any angle can be skipped.
 */
const ProgressPhotoCheckInView = ({
  onDone,
  onSkip,
}: {
  onDone: () => void;
  onSkip?: () => void;
}) => {
  const dispatch = useAppDispatch();
  const uploading = useAppSelector((state) => state.home.progressPhotoUploading);

  const [showInstructions, setShowInstructions] = useState(true);
  const [poseIndex, setPoseIndex] = useState(0);
  const [photos, setPhotos] = useState<
    Partial<Record<ProgressPhotoPose, PickedPhoto>>
  >({});
  const [checkInWeekday, setCheckInWeekday] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isChoosingDay = poseIndex >= POSES.length;
  const current = POSES[poseIndex];
  const capturedCount = useMemo(() => Object.keys(photos).length, [photos]);

  const advance = () => setPoseIndex((index) => index + 1);

  const capture = async (source: MediaSource) => {
    try {
      // Handles the request, and routes to system settings when the OS will
      // no longer show its own prompt.
      if (!(await ensureMediaPermission(source))) {
        return;
      }

      const result =
        source === "camera"
          ? await ImagePicker.launchCameraAsync({
              mediaTypes: ["images"],
              // Full-resolution camera output is needlessly large for a
              // check-in and pushes each upload toward the server's limit.
              quality: 0.6,
            })
          : await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ["images"],
              quality: 0.6,
            });

      if (result.canceled || !result.assets?.length) return;

      setPhotos((existing) => ({
        ...existing,
        [current.pose]: toUploadFile(result.assets[0].uri, current.pose),
      }));
      setError(null);
      advance();
    } catch {
      setError("Something went wrong opening your camera. Try again.");
    }
  };

  const finish = async () => {
    if (capturedCount > 0) {
      const upload = await dispatch(uploadProgressPhotos(photos));

      if (uploadProgressPhotos.rejected.match(upload)) {
        setError((upload.payload as string) ?? "Your photos could not be uploaded.");
        return;
      }
    }

    const schedule = await dispatch(updateProgressPhotoSchedule(checkInWeekday));

    if (updateProgressPhotoSchedule.rejected.match(schedule)) {
      setError((schedule.payload as string) ?? "Your check-in day could not be saved.");
      return;
    }

    onDone();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <InstructionsModal
        visible={showInstructions}
        onClose={() => setShowInstructions(false)}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {isChoosingDay ? (
          <>
            <Text style={styles.title}>When should we check in?</Text>
            <Text style={styles.subtitle}>
              Pick one day a week. We&apos;ll nudge you to repeat these four
              angles then, so every set lines up against the last.
            </Text>

            <View style={styles.weekdayGrid}>
              {WEEKDAYS.map((day) => {
                const isActive = checkInWeekday === day.weekday;

                return (
                  <TouchableOpacity
                    key={day.weekday}
                    activeOpacity={0.85}
                    onPress={() => setCheckInWeekday(day.weekday)}
                    style={[
                      styles.weekdayChip,
                      isActive && styles.weekdayChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.weekdayChipText,
                        isActive && styles.weekdayChipTextActive,
                      ]}
                    >
                      {day.short}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>
                {capturedCount} of {POSES.length}
              </Text>
              <Text style={styles.summaryLabel}>
                {capturedCount === POSES.length
                  ? "angles captured — nice work"
                  : "angles captured, the rest are skipped"}
              </Text>
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={finish}
              disabled={uploading || checkInWeekday === null}
              style={[
                styles.primaryButton,
                (uploading || checkInWeekday === null) && styles.buttonDisabled,
              ]}
            >
              {uploading ? (
                <ActivityIndicator color={BACKGROUND} />
              ) : (
                <Text style={styles.primaryButtonText}>Save my check-in</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setPoseIndex(0)}
              style={styles.textButton}
            >
              <Text style={styles.textButtonLabel}>Go back to the photos</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>
                Angle {poseIndex + 1} of {POSES.length}
              </Text>
              <View style={styles.progressDots}>
                {POSES.map((item, index) => (
                  <View
                    key={item.pose}
                    style={[
                      styles.progressDot,
                      index === poseIndex && styles.progressDotActive,
                      index < poseIndex && styles.progressDotDone,
                    ]}
                  />
                ))}
              </View>
            </View>

            <Text style={styles.title}>{current.label}</Text>
            <Text style={styles.subtitle}>{current.hint}</Text>

            <View style={styles.poseCard}>
              {photos[current.pose] ? (
                <Image
                  source={{ uri: photos[current.pose]!.uri }}
                  style={styles.preview}
                  resizeMode="cover"
                />
              ) : (
                <PoseGuide pose={current.pose} />
              )}

              <Text style={styles.poseHint}>
                Line yourself up with the guides so every check-in matches.
              </Text>
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => capture("camera")}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>Take photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => capture("library")}
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryButtonText}>Choose from library</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={advance} style={styles.textButton}>
              <Text style={styles.textButtonLabel}>Skip this angle</Text>
            </TouchableOpacity>

            {onSkip ? (
              <TouchableOpacity onPress={onSkip} style={styles.textButton}>
                <Text style={styles.textButtonMuted}>Set this up later</Text>
              </TouchableOpacity>
            ) : null}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const InstructionsModal = ({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) => (
  <Modal visible={visible} transparent animationType="fade">
    <View style={styles.modalBackdrop}>
      <View style={styles.modalSheet}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Before you start</Text>
          <TouchableOpacity
            onPress={onClose}
            style={styles.modalClose}
            accessibilityLabel="Close"
          >
            <Svg width={20} height={20} viewBox="0 0 24 24">
              <Path
                d="M6 6L18 18M18 6L6 18"
                stroke="#FFFFFF"
                strokeWidth="2.4"
                strokeLinecap="round"
              />
            </Svg>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.modalBody}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.modalIntro}>
            Four quick photos give you a baseline. Repeat them each week and the
            changes become obvious.
          </Text>

          <View style={styles.tipRow}>
            <Text style={styles.tipTitle}>What to wear</Text>
            <Text style={styles.tipText}>
              Fitted training gear. Loose clothing hides the progress you&apos;re
              trying to track.
            </Text>
          </View>

          <View style={styles.tipRow}>
            <Text style={styles.tipTitle}>Where to stand</Text>
            <Text style={styles.tipText}>
              A plain, well-lit wall. Keep the same spot each week so only you
              change between shots.
            </Text>
          </View>

          <View style={styles.tipRow}>
            <Text style={styles.tipTitle}>How to stand</Text>
            <Text style={styles.tipText}>
              Stand normally and breathe out. No flexing, no holding your
              stomach in — it only skews the comparison.
            </Text>
          </View>

          <View style={styles.noticeCard}>
            <Text style={styles.noticeText}>
              Your check-in photos are stored on your profile and your coach may
              be able to view them.
            </Text>
          </View>
        </ScrollView>

        <TouchableOpacity
          onPress={onClose}
          activeOpacity={0.85}
          style={styles.modalAction}
        >
          <Text style={styles.modalActionText}>Got it, let&apos;s go</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BACKGROUND },
  content: { paddingHorizontal: 24, paddingBottom: 48, paddingTop: 12 },
  progressHeader: { marginBottom: 18 },
  progressLabel: {
    color: MUTED,
    fontSize: 13,
    fontFamily: "Raleway-SemiBold",
    marginBottom: 10,
  },
  progressDots: { flexDirection: "row", gap: 6 },
  progressDot: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: SURFACE_ALT,
  },
  progressDotActive: { backgroundColor: ACCENT },
  progressDotDone: { backgroundColor: "#3E6B18" },
  title: {
    color: "#FFFFFF",
    fontSize: 26,
    fontFamily: "Raleway-Bold",
    marginBottom: 8,
  },
  subtitle: {
    color: MUTED,
    fontSize: 14,
    fontFamily: "Raleway-Medium",
    lineHeight: 21,
    marginBottom: 22,
  },
  poseCard: {
    backgroundColor: SURFACE,
    borderRadius: 22,
    overflow: "hidden",
    marginBottom: 22,
  },
  preview: { width: "100%", aspectRatio: 220 / 260 },
  poseHint: {
    color: MUTED,
    fontSize: 13,
    fontFamily: "Raleway-Medium",
    textAlign: "center",
    lineHeight: 19,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  weekdayGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 22,
  },
  weekdayChip: {
    backgroundColor: SURFACE,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  weekdayChipActive: { borderColor: ACCENT },
  weekdayChipText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Raleway-Medium",
  },
  weekdayChipTextActive: { color: ACCENT, fontFamily: "Raleway-Bold" },
  summaryCard: {
    backgroundColor: SURFACE,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 18,
    marginBottom: 22,
  },
  summaryValue: {
    color: ACCENT,
    fontSize: 22,
    fontFamily: "Raleway-Bold",
    marginBottom: 2,
  },
  summaryLabel: {
    color: MUTED,
    fontSize: 13,
    fontFamily: "Raleway-Medium",
  },
  error: {
    color: "#FF6B6B",
    fontSize: 13,
    fontFamily: "Raleway-Medium",
    marginBottom: 14,
    textAlign: "center",
  },
  primaryButton: {
    height: 56,
    borderRadius: 30,
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
  secondaryButton: {
    height: 56,
    borderRadius: 30,
    backgroundColor: SURFACE_ALT,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  secondaryButtonText: {
    color: ACCENT,
    fontSize: 16,
    fontFamily: "Raleway-Bold",
  },
  textButton: { marginTop: 18, alignItems: "center" },
  textButtonLabel: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Raleway-SemiBold",
  },
  textButtonMuted: {
    color: MUTED,
    fontSize: 14,
    fontFamily: "Raleway-Medium",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: SURFACE,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 28,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  modalTitle: { color: ACCENT, fontSize: 20, fontFamily: "Raleway-Bold" },
  modalClose: {
    width: 32,
    height: 32,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  modalBody: { paddingBottom: 8 },
  modalIntro: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "Raleway-Medium",
    lineHeight: 22,
    marginBottom: 20,
  },
  tipRow: { marginBottom: 18 },
  tipTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "Raleway-Bold",
    marginBottom: 4,
  },
  tipText: {
    color: MUTED,
    fontSize: 14,
    fontFamily: "Raleway-Medium",
    lineHeight: 21,
  },
  noticeCard: {
    backgroundColor: SURFACE_ALT,
    borderRadius: 16,
    padding: 16,
    marginTop: 4,
  },
  noticeText: {
    color: WARNING,
    fontSize: 13,
    fontFamily: "Raleway-Medium",
    lineHeight: 20,
  },
  modalAction: {
    height: 56,
    borderRadius: 30,
    backgroundColor: ACCENT,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
  },
  modalActionText: {
    color: BACKGROUND,
    fontSize: 16,
    fontFamily: "Raleway-Bold",
  },
});

export default ProgressPhotoCheckInView;
