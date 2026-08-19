import React, { useMemo, useState } from "react";
import {
  ProgressPhotoCheckInView,
  WorkoutScheduleView,
} from "../screens";

type Step = "schedule" | "photos";

/**
 * Runs once, right after a subscription is bought: pick the training days,
 * then take the first progress-photo check-in. Steps the plan does not need
 * are skipped automatically.
 */
const OnboardingNavigator = ({
  needsSchedule,
  needsPhotos,
  onComplete,
}: {
  needsSchedule: boolean;
  needsPhotos: boolean;
  onComplete: () => void;
}) => {
  const steps = useMemo(() => {
    const pending: Step[] = [];
    if (needsSchedule) pending.push("schedule");
    if (needsPhotos) pending.push("photos");
    return pending;
  }, [needsPhotos, needsSchedule]);

  const [stepIndex, setStepIndex] = useState(0);

  const advance = () => {
    if (stepIndex + 1 >= steps.length) {
      onComplete();
      return;
    }

    setStepIndex((index) => index + 1);
  };

  const step = steps[stepIndex];

  if (!step) {
    return null;
  }

  if (step === "schedule") {
    return <WorkoutScheduleView onDone={advance} onSkip={advance} />;
  }

  return <ProgressPhotoCheckInView onDone={advance} onSkip={advance} />;
};

export default OnboardingNavigator;
