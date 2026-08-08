import {
  View,
  Text,
  StyleSheet,
  Animated,
  ImageBackground,
} from 'react-native';
import React, {useCallback, useEffect, useRef} from 'react';
import Loading_Logo_SVG from '../../../assets/SVG/Loading_Logo_SVG';
import {
  setIsPlan,
  setIsQuestion,
  setIsWelcome,
} from '../../slice/WelcomeSlice';
import {useAppDispatch} from '../../store';
import { getPlan } from '../../slice/PlanSlice';

const GenerateView = () => {
  const dispatch = useAppDispatch();
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startRotation = () => {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000, // 2 seconds for one full rotation
          useNativeDriver: true,
        }),
      ).start();
    };

    startRotation();
  }, [rotateAnim]);

  const fetchPlan = useCallback(async () => {
    try {
      const response = await dispatch(getPlan());

      if (getPlan.fulfilled.match(response)) {
        dispatch(setIsPlan(true));
        dispatch(setIsQuestion(false));
        dispatch(setIsWelcome(false));
      }
    } catch (error) {
      console.error('Failed to generate plan:', error);
    }
  }, [dispatch]);

  useEffect(() => {
    void fetchPlan();
  }, [fetchPlan]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <ImageBackground
      source={require('../../../assets/images/generate.png')}
      style={styles.imageBackground}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <Loading_Logo_SVG />
          </Animated.View>

          <View style={styles.titleContainer}>
            <Text style={styles.title}>Your plan is being</Text>
            <Text style={styles.title}>generated...</Text>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#171717',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 30,
    fontFamily: 'Raleway-Black',
    color: '#fff',
    includeFontPadding: false,
    textAlign: 'center',
  },
  titleContainer: {
    marginTop: 31,
  },
  imageBackground: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#171717',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
   backgroundColor: 'rgba(23,23,23,0.2)', // Semi-transparent black overlay
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default GenerateView;
