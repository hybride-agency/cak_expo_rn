import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import Small_Check_Logo_SVG from '../../assets/SVG/Small_Check_Logo_SVG';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  connectorProgress?: number;
  showCompletedChecks?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  currentStep,
  totalSteps,
  connectorProgress = 0,
  showCompletedChecks = false,
}) => {
  const circleAnimatedValuesRef = useRef<Animated.Value[]>([]);
  const connectorAnimatedValuesRef = useRef<Animated.Value[]>([]);

  if (circleAnimatedValuesRef.current.length !== totalSteps) {
    circleAnimatedValuesRef.current = Array.from(
      { length: totalSteps },
      (_, index) =>
        circleAnimatedValuesRef.current[index] || new Animated.Value(0),
    );
  }

  const connectorCount = Math.max(totalSteps - 1, 0);

  if (connectorAnimatedValuesRef.current.length !== connectorCount) {
    connectorAnimatedValuesRef.current = Array.from(
      { length: connectorCount },
      (_, index) =>
        connectorAnimatedValuesRef.current[index] || new Animated.Value(0),
    );
  }

  const circleAnimatedValues = circleAnimatedValuesRef.current;
  const connectorAnimatedValues = connectorAnimatedValuesRef.current;
  const safeCurrentStep = Math.min(Math.max(currentStep, -1), totalSteps - 1);
  const safeConnectorProgress = Math.min(Math.max(connectorProgress, 0), 1);

  useEffect(() => {
    circleAnimatedValues.forEach((animValue, index) => {
      const targetValue = index <= safeCurrentStep ? 1 : 0;

      Animated.timing(animValue, {
        toValue: targetValue,
        duration: 300,
        useNativeDriver: false,
      }).start();
    });

    connectorAnimatedValues.forEach((animValue, index) => {
      const targetValue =
        index < safeCurrentStep
          ? 1
          : index === safeCurrentStep
          ? safeConnectorProgress
          : 0;

      Animated.timing(animValue, {
        toValue: targetValue,
        duration: 300,
        useNativeDriver: false,
      }).start();
    });
  }, [
    circleAnimatedValues,
    connectorAnimatedValues,
    safeConnectorProgress,
    safeCurrentStep,
    totalSteps,
  ]);

  const renderCircle = (index: number) => {
    const animatedValue = circleAnimatedValues[index];
    const showCheck = showCompletedChecks && index <= safeCurrentStep;

    const backgroundColor = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['#171717', '#68FE00'],
    });

    const borderColor = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['#C5C5C5', '#68FE00'],
    });

    return (
      <Animated.View
        key={`circle-${index}`}
        style={[
          styles.circle,
          {
            backgroundColor,
            borderColor,
          },
        ]}
      >
        {showCheck && (
          <Small_Check_Logo_SVG width={8} height={6} color="#171717" />
        )}
      </Animated.View>
    );
  };

  const renderConnector = (index: number) => {
    const animatedValue = connectorAnimatedValues[index];
    const width = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['0%', '100%'],
    });

    return (
      <View key={`connector-${index}`} style={styles.connectorWrapper}>
        <View style={styles.connectorBackground} />
        <Animated.View
          style={[
            styles.connectorForeground,
            {
              width,
            },
          ]}
        />
      </View>
    );
  };

  if (totalSteps === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {Array.from({ length: totalSteps }, (_, index) => (
        <React.Fragment key={index}>
          {renderCircle(index)}
          {index < totalSteps - 1 && renderConnector(index)}
        </React.Fragment>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 0,
  },
  circle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectorWrapper: {
    height: 2,
    flex: 1,
    maxWidth: 30,
    position: 'relative',
    overflow: 'hidden',
  },
  connectorBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#C5C5C5',
  },
  connectorForeground: {
    position: 'absolute',
    height: '100%',
    backgroundColor: '#68FE00',
  },
});

export default ProgressBar;
