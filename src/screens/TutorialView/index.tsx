/**
 * TutorialView Component
 *
 * Displays a series of tutorial pages with the following features:
 * - Horizontal swiping between tutorial pages (via SwiperFlatList)
 * - Upward swipe detection on the last page to proceed to welcome screen
 * - Image loading management with timeout fallback
 * - Skip button for immediate navigation
 * - Responsive design with platform-specific styling
 *
 * Key functionality:
 * - Fetches tutorial data from API on mount
 * - Tracks image loading state to show loading indicator
 * - Detects upward swipes on the last tutorial page
 * - Dispatches setIsWelcome(true) when user swipes up on last page
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  ImageBackground,
  TouchableOpacity,
  Platform,
  FlatList,
} from 'react-native';
import { TutorialData } from '../../../global';
import {SvgUri} from 'react-native-svg';
import RenderHtml, { defaultSystemFonts } from 'react-native-render-html';
import { SCREEN_PADDING } from '../../../theme';
import convertCustomHtmlSyntax from '../../helper/converCustomHtmlSyntax';
import { useDispatch } from 'react-redux';
import { setIsWelcome } from '../../slice/WelcomeSlice';
import { normalizeFont } from '../../../utils/helpers/normalize-fonts';
import axiosInstance from '../../axiosConfig';

const { width } = Dimensions.get('window');

const TutorialView = () => {
  // State for tutorial data fetched from API
  const [tutorialData, setTutorialData] = useState<TutorialData[]>([]);
  // Loading state while fetching tutorial data and images
  const [loading, setLoading] = useState(true);
  // Tracks the active tutorial page.
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Redux dispatch for state management
  const dispatch = useDispatch();
  const isLastIndex =
    tutorialData.length > 0 && activeIndex === tutorialData.length - 1;

  const completeTutorial = useCallback(() => {
    dispatch(setIsWelcome(true));
  }, [dispatch]);

  useEffect(() => {
    if (!isLastIndex) {
      return;
    }

    const timeout = setTimeout(() => {
      completeTutorial();
    }, 1000);

    return () => clearTimeout(timeout);
  }, [completeTutorial, isLastIndex]);

  const fetchTutorialData = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const response = await axiosInstance.get<{data: TutorialData[]}>(
        '/tutorial-pages',
      );
      const pages = response.data.data
        .filter(page => !page.is_hidden)
        .sort((left, right) => left.order - right.order);

      if (pages.length === 0) {
        throw new Error('No tutorial pages are available.');
      }

      setTutorialData(pages);
    } catch (error: unknown) {
      setLoadError(
        error instanceof Error
          ? error.message
          : 'Unable to load the tutorial. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchTutorialData();
  }, [fetchTutorialData]);

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#000000" />
        </View>
      ) : loadError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Unable to load the tutorial</Text>
          <Text style={styles.errorMessage}>{loadError}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => void fetchTutorialData()}>
            <Text style={styles.retryButtonText}>Try again</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={completeTutorial}>
            <Text style={styles.skipErrorText}>Skip tutorial</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.tutorialContainer}>
          <FlatList
            data={tutorialData}
            horizontal
            pagingEnabled
            bounces={false}
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => String(item.id)}
            onMomentumScrollEnd={event => {
              setActiveIndex(
                Math.round(event.nativeEvent.contentOffset.x / width),
              );
            }}
            // Render each tutorial page with custom touch handling
            renderItem={({ item, index }) => (
              <View style={[styles.childContainer]}>
                {/* Background image for the tutorial page */}
                <ImageBackground
                  source={{ uri: item.image_url }}
                  style={styles.imageBackground}
                >
                  {/* Logo section at the top */}
                  <View style={styles.logoContainer}>
                    <SvgUri
                      width="71"
                      height="20"
                      uri={item.logo_url}
                    />
                  </View>

                  {/* Title section with HTML content */}
                  <View style={styles.titleContainer}>
                    <RenderHtml
                      contentWidth={width}
                      source={{
                        html: convertCustomHtmlSyntax(
                          item.tutorial_page_langinfos?.[0]?.title,
                        ),
                      }}
                      systemFonts={[
                        ...defaultSystemFonts,
                        'Raleway-Bold', // every variant you want to use
                        'Raleway-Light',
                        'Raleway-Regular',
                      ]}
                      baseStyle={{
                        fontFamily: 'Raleway-Bold',
                      }}
                      tagsStyles={{
                        p: {
                          fontSize: normalizeFont(35),
                          color: '#FFFFFF',
                          fontFamily: 'Raleway-Bold',
                        },
                        span: {
                          fontSize: normalizeFont(35),
                          color: '#68FE00',
                          fontFamily: 'Raleway-Bold',
                        },
                      }}
                    />
                  </View>

                  {/* Button section at the bottom */}
                  <View style={styles.buttonContainer}>
                    {index !== tutorialData.length - 1 && (
                      <TouchableOpacity
                        style={styles.button}
                        onPress={completeTutorial}
                      >
                        <Text style={styles.buttonText}>Skip</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </ImageBackground>
              </View>
            )}
          />
          <View style={styles.pagination} pointerEvents="none">
            {tutorialData.map((item, index) => (
              <View
                key={item.id}
                style={[
                  styles.paginationDot,
                  index === activeIndex && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#171717',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#171717',
    paddingHorizontal: 32,
  },
  errorTitle: {
    color: '#FFFFFF',
    fontFamily: 'Raleway-Bold',
    fontSize: 20,
    textAlign: 'center',
  },
  errorMessage: {
    color: '#C5C5C5',
    fontFamily: 'Raleway-Regular',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 10,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#68FE00',
    borderRadius: 10,
    marginTop: 24,
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  retryButtonText: {
    color: '#171717',
    fontFamily: 'Raleway-Bold',
    fontSize: 16,
  },
  skipErrorText: {
    color: '#C5C5C5',
    fontFamily: 'Raleway-Medium',
    fontSize: 14,
    marginTop: 20,
  },
  tutorialContainer: {
    flex: 1,
  },
  pagination: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 77 : 97,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  paginationDot: {
    width: 11,
    height: 11,
    borderRadius: 5.5,
    backgroundColor: '#D9D9D980',
  },
  paginationDotActive: {
    backgroundColor: '#D9D9D9',
  },
  childContainer: {
    width: width,
    height: '100%',
  },
  imageBackground: {
    flex: 1,
    position: 'relative',
  },
  logo: {
    width: 100,
    height: 100,
  },
  logoContainer: {
    marginTop: 67,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  titleContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 148 : 168,
    left: 0,
    right: 0,
    zIndex: 100,
    paddingHorizontal: SCREEN_PADDING.left,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 34 : 54,
    width: '100%',
    paddingHorizontal: SCREEN_PADDING.left,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonText: {
    fontSize: 16,
    color: '#C5C5C5',
    fontFamily: 'Raleway-Light',
  },
  button: {},
});

export default TutorialView;
