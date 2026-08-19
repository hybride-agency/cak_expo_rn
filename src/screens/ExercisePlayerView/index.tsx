import React, {useMemo} from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Svg, {Circle, Path} from 'react-native-svg';
import {useEvent} from 'expo';
import {VideoView, useVideoPlayer} from 'expo-video';
import type {VideoSource} from 'expo-video';

import {getHomepage, updateExerciseCompletion} from '../../slice/HomeSlice';
import {useAppDispatch} from '../../store';
import {getRestLabel} from '../../utils/restTime';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {NavigationProp, RouteProp} from '@react-navigation/native';
import type {
  MainStackParamList,
  WorkoutFlowParamList,
} from '../../navigation/MainStack';
import {buildExerciseInstructionSteps} from '../../utils/exerciseInstructions';

const ACCENT = '#68FE00';
const BACKGROUND = '#171717';
const STARTER_IMAGE_URL =
  'https://d1t9z5ilqoa9lf.cloudfront.net/pages/background-workout-starter.png';

const ExercisePlayerView = () => {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const route = useRoute<RouteProp<WorkoutFlowParamList, 'ExercisePlayerView'>>();
  const {exercise, sectionName, hasVideoAccess} = route.params;
  const dispatch = useAppDispatch();
  const showVideo = hasVideoAccess && Boolean(exercise.video_url);
  const videoSource = useMemo<VideoSource>(
    () => getVideoSource(showVideo ? exercise.video_url : null),
    [exercise.video_url, showVideo],
  );
  const player = useVideoPlayer(videoSource, videoPlayer => {
    videoPlayer.bufferOptions = {
      preferredForwardBufferDuration: 12,
      waitsToMinimizeStalling: true,
      minBufferForPlayback: 2,
      maxBufferBytes: 0,
      prioritizeTimeOverSizeThreshold: true,
    };
  });
  const playerState = useEvent(player, 'statusChange', {
    status: player.status,
  });
  const [renderedVideoUrl, setRenderedVideoUrl] = React.useState<string | null>(
    null,
  );
  const [isRetrying, setIsRetrying] = React.useState(false);
  const [retryError, setRetryError] = React.useState<string | null>(null);
  const hasRenderedFirstFrame = renderedVideoUrl === exercise.video_url;
  const isBuffering = showVideo && playerState.status === 'loading';
  const hasPlaybackError = showVideo && playerState.status === 'error';

  const steps = useMemo(
    () => buildExerciseInstructionSteps(exercise),
    [exercise],
  );

  const onFinish = async () => {
    let completedExercise = {...exercise, is_completed: true};

    if (exercise.id) {
      const response = await dispatch(
        updateExerciseCompletion({
          userWorkoutExerciseId: exercise.id,
          is_completed: true,
        }),
      ).unwrap();
      const updatedExercise = response?.data ?? response;
      completedExercise = {...completedExercise, ...updatedExercise};
    }
    dispatch(getHomepage());
    navigation.navigate('WorkoutSuccessView', {exercise: completedExercise});
  };

  const retryVideo = async () => {
    if (!videoSource) return;

    setIsRetrying(true);
    setRenderedVideoUrl(null);
    setRetryError(null);
    try {
      await player.replaceAsync(videoSource);
      player.play();
    } catch (error: unknown) {
      setRetryError(
        error instanceof Error ? error.message : 'Unable to reload the video.',
      );
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <Path
                d="M15 18L9 12L15 6"
                stroke="#FFF"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>
          <Text numberOfLines={1} style={styles.headerTitle}>
            {exercise.exercise_name || sectionName || 'Workout'}
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {showVideo ? (
            <View style={styles.videoFrame}>
              <VideoView
                player={player}
                style={styles.video}
                nativeControls
                contentFit="contain"
                fullscreenOptions={{enable: true}}
                onFirstFrameRender={() =>
                  setRenderedVideoUrl(exercise.video_url || null)
                }
              />
              {isBuffering || isRetrying ? (
                <View pointerEvents="none" style={styles.playerOverlay}>
                  <ActivityIndicator color={ACCENT} size="large" />
                  <Text style={styles.playerOverlayText}>
                    {hasRenderedFirstFrame ? 'Buffering…' : 'Loading video…'}
                  </Text>
                </View>
              ) : null}
              {hasPlaybackError && !isRetrying ? (
                <View style={styles.playerOverlay}>
                  <Text style={styles.playerErrorTitle}>Video unavailable</Text>
                  <Text style={styles.playerErrorText}>
                    {retryError ||
                      playerState.error?.message ||
                      'Check your connection and try again.'}
                  </Text>
                  <TouchableOpacity
                    disabled={isRetrying}
                    onPress={retryVideo}
                    style={styles.retryVideoButton}>
                    <Text style={styles.retryVideoButtonText}>Try again</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </View>
          ) : (
            <Image
              source={{uri: exercise.image_url || STARTER_IMAGE_URL}}
              style={styles.exerciseImage}
              resizeMode="cover"
            />
          )}

          <View style={styles.modeRow}>
            <Text style={styles.modeLabel}>
              {showVideo ? 'VIDEO WORKOUT' : 'WORKOUT'}
            </Text>
            {hasVideoAccess && !exercise.video_url ? (
              <Text style={styles.fallbackLabel}>TEXT GUIDE</Text>
            ) : null}
          </View>

          <Text style={styles.sectionTitle}>How to perform</Text>
          {steps.map((step, index) => (
            <View key={`${step.title}-${index}`} style={styles.stepCard}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>{index + 1}</Text>
              </View>
              <View style={styles.stepCopy}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                {step.description !== step.title ? (
                  <Text style={styles.stepText}>{step.description}</Text>
                ) : null}
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.durationBadge}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Circle cx="12" cy="12" r="10" stroke={ACCENT} strokeWidth="2" />
              <Path
                d="M12 7V12L15 15"
                stroke={ACCENT}
                strokeWidth="2"
                strokeLinecap="round"
              />
            </Svg>
            <Text style={styles.durationText}>
              {getRestLabel(exercise)} rest
            </Text>
          </View>
          <TouchableOpacity onPress={onFinish} activeOpacity={0.8} style={styles.finishButton}>
            <Text style={styles.finishButtonText}>Complete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const getVideoSource = (uri?: string | null): VideoSource => {
  if (!uri) return null;

  const pathname = uri.split(/[?#]/)[0].toLowerCase();
  const contentType = pathname.endsWith('.m3u8')
    ? 'hls'
    : pathname.endsWith('.mpd')
      ? 'dash'
      : 'progressive';

  return {
    uri,
    contentType,
    useCaching: contentType === 'progressive',
  };
};

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: BACKGROUND},
  container: {flex: 1, backgroundColor: BACKGROUND, paddingHorizontal: 24},
  header: {height: 72, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  backButton: {width: 40, height: 40, justifyContent: 'center'},
  headerTitle: {color: '#FFF', fontSize: 18, fontFamily: 'Raleway-Bold', flex: 1, textAlign: 'center'},
  headerSpacer: {width: 40},
  scrollContent: {paddingBottom: 28},
  videoFrame: {height: 240, borderRadius: 20, overflow: 'hidden', backgroundColor: '#000'},
  video: {width: '100%', height: '100%'},
  playerOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  playerOverlayText: {color: '#FFF', fontSize: 13, fontFamily: 'Raleway-Medium', marginTop: 12},
  playerErrorTitle: {color: '#FFF', fontSize: 17, fontFamily: 'Raleway-Bold', textAlign: 'center'},
  playerErrorText: {color: '#C8C8C8', fontSize: 12, fontFamily: 'Raleway-Medium', textAlign: 'center', marginTop: 8},
  retryVideoButton: {backgroundColor: ACCENT, borderRadius: 20, paddingHorizontal: 20, paddingVertical: 10, marginTop: 16},
  retryVideoButtonText: {color: BACKGROUND, fontSize: 13, fontFamily: 'Raleway-Bold'},
  exerciseImage: {height: 240, width: '100%', borderRadius: 20, backgroundColor: '#2A2A2A'},
  modeRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 18, marginBottom: 24},
  modeLabel: {color: ACCENT, fontSize: 11, fontFamily: 'Raleway-Bold'},
  fallbackLabel: {color: '#AAA', fontSize: 10, fontFamily: 'Raleway-Bold'},
  sectionTitle: {color: '#FFF', fontSize: 22, fontFamily: 'Raleway-Bold', marginBottom: 20},
  stepCard: {backgroundColor: '#2A2A2A', borderRadius: 16, padding: 18, marginBottom: 14, flexDirection: 'row'},
  stepBadge: {width: 30, height: 30, borderRadius: 15, backgroundColor: ACCENT, alignItems: 'center', justifyContent: 'center', marginRight: 14},
  stepBadgeText: {color: BACKGROUND, fontSize: 14, fontFamily: 'Raleway-Bold'},
  stepCopy: {flex: 1},
  stepTitle: {color: '#FFF', fontSize: 16, fontFamily: 'Raleway-Bold'},
  stepText: {color: '#C8C8C8', fontSize: 14, fontFamily: 'Raleway-Medium', lineHeight: 21, marginTop: 8},
  footer: {paddingTop: 14, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12, borderTopWidth: 1, borderTopColor: '#2A2A2A'},
  durationBadge: {height: 50, paddingHorizontal: 16, borderRadius: 25, borderWidth: 1, borderColor: ACCENT, flexDirection: 'row', alignItems: 'center', gap: 8},
  durationText: {color: '#FFF', fontSize: 14, fontFamily: 'Raleway-Bold'},
  finishButton: {height: 50, flex: 1, borderRadius: 25, backgroundColor: ACCENT, alignItems: 'center', justifyContent: 'center'},
  finishButtonText: {color: BACKGROUND, fontSize: 16, fontFamily: 'Raleway-Bold'},
});

export default ExercisePlayerView;
