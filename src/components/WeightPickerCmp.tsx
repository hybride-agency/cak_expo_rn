import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import React, {useEffect, useMemo, useRef, useState} from 'react';

interface WeightPickerCmpProps {
  onSelectWeight?: (weight: number) => void;
  initialWeight?: number;
  minWeight?: number;
  maxWeight?: number;
}

const WeightPickerCmp = ({
  onSelectWeight,
  initialWeight = 65,
  minWeight = 30,
  maxWeight = 300,
}: WeightPickerCmpProps) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [selectedWeight, setSelectedWeight] = useState<number>(initialWeight);
  const { width: screenWidth } = Dimensions.get('window');

  // Calculate item width and container width
  const itemWidth = 10; // Width for each weight step - reduced spacing
  const containerWidth = screenWidth;
  const centerOffset = containerWidth / 2 - itemWidth / 2;

  // Generate weight array
  const weights = useMemo(
    () =>
      Array.from(
        {length: maxWeight - minWeight + 1},
        (_, i) => minWeight + i,
      ),
    [maxWeight, minWeight],
  );

  useEffect(() => {
    // Scroll to initial weight on component mount
    const initialIndex = weights.indexOf(initialWeight);
    if (initialIndex !== -1) {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          x: initialIndex * itemWidth,
          animated: false,
        });
      }, 100);
    }
  }, [initialWeight, weights]);

  const onSelectWeightRef = useRef(onSelectWeight);
  onSelectWeightRef.current = onSelectWeight;

  // Only re-fires when the selected value changes, not when the parent
  // passes a new (often unmemoized) callback identity on every render.
  useEffect(() => {
    onSelectWeightRef.current?.(selectedWeight);
  }, [selectedWeight]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollX / itemWidth);
    const clampedIndex = Math.max(0, Math.min(weights.length - 1, index));
    const newWeight = weights[clampedIndex];

    if (newWeight !== undefined && newWeight !== selectedWeight) {
      setSelectedWeight(newWeight);
    }
  };

  const ScaleLine = React.memo(function ScaleLine({weight}: {weight: number}) {
    let barHeight = 35;
    if (weight % 10 === 0) {
      barHeight = 79;
    } else if (weight % 5 === 0) {
      barHeight = 79;
    }

    return (
      <View style={[styles.scaleItem, { width: itemWidth }]}>
        <View
          style={[
            styles.scaleLine,
            {
              height: barHeight,
              marginBottom: barHeight < 50 ? 10 : 0,
            },
          ]}
        />
      </View>
    );
  });

  const renderWeightScale = () => {
    return weights.map((weight) => (
      <ScaleLine key={weight} weight={weight} />
    ));
  };

  return (
    <View style={styles.container}>
      {/* Weight display */}
      <View style={styles.weightDisplayContainer}>
        <Text style={styles.weightNumber}>{selectedWeight}</Text>
        <Text style={styles.weightUnit}>kg</Text>
      </View>

      {/* Scale container */}
      <View style={styles.scaleContainer}>
        {/* Horizontal ScrollView with scale */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={{
            paddingLeft: centerOffset,
            paddingRight: centerOffset,
          }}
          horizontal
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          snapToInterval={itemWidth}
          snapToAlignment="start"
          decelerationRate="fast"
          nestedScrollEnabled
          bounces={false}
          overScrollMode="never"
        >
          <View style={styles.scaleContent}>{renderWeightScale()}</View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#171717',
  },
  weightDisplayContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 40,
    justifyContent: 'center',
  },
  weightNumber: {
    fontSize: 80,
    fontFamily: 'Raleway-ExtraBold',
    color: '#68FE00',
    fontWeight: '900',
    includeFontPadding: false,
    lineHeight: 80,
  },
  weightUnit: {
    fontSize: 32,
    fontFamily: 'Raleway-ExtraBold',
    color: '#68FE00',
    fontWeight: '700',
    marginLeft: 8,
    includeFontPadding: false,
  },
  scaleContainer: {
    height: 60,
    width: '100%',
    position: 'relative',
  },
  scrollView: {
    flex: 1,
  },
  scaleContent: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 60,
  },
  scaleItem: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 60,
  },
  scaleLine: {
    backgroundColor: '#666466',
    width: 1,
  },
});

export default WeightPickerCmp;
