import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import React, { useRef, useState, useEffect, useMemo } from 'react';

interface AgePickerCmpProps {
  onSelectAge?: (age: number) => void;
  initialAge?: number;
  minAge?: number;
  maxAge?: number;
}

const AgePickerCmp = ({
  onSelectAge,
  initialAge = 25,
  minAge = 13,
  maxAge = 100,
}: AgePickerCmpProps) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [selectedAge, setSelectedAge] = useState<number>(initialAge);
  // Calculate item height and container height
  const itemHeight = 80;
  const containerHeight = itemHeight * 5; // Show 5 items at once
  const centerOffset = containerHeight / 2 - itemHeight / 2;

  // Generate age array
  const ages = useMemo(
    () => Array.from({length: maxAge - minAge + 1}, (_, i) => minAge + i),
    [maxAge, minAge],
  );
  const initialIndex = useMemo(() => {
    const idx = ages.indexOf(initialAge);
    return idx >= 0 ? idx : 0;
  }, [ages, initialAge]);

  // Remove timeout-based initial scroll; rely on contentOffset for reliable initial positioning

  const onSelectAgeRef = useRef(onSelectAge);
  onSelectAgeRef.current = onSelectAge;

  // Only re-fires when the selected value changes, not when the parent
  // passes a new (often unmemoized) callback identity on every render.
  useEffect(() => {
    onSelectAgeRef.current?.(selectedAge);
  }, [selectedAge]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    const index = Math.round(scrollY / itemHeight);
    const clampedIndex = Math.max(0, Math.min(ages.length - 1, index));
    const newAge = ages[clampedIndex];
    
    if (newAge !== undefined && newAge !== selectedAge) {
      setSelectedAge(newAge);
    }
  };

  const handleMomentumScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    const index = Math.round(scrollY / itemHeight);
    const clampedIndex = Math.max(0, Math.min(ages.length - 1, index));
    
    // Snap to nearest item
    scrollViewRef.current?.scrollTo({
      y: clampedIndex * itemHeight,
      animated: true,
    });
  };

  const renderAgeItem = (age: number, index: number) => {
    const isSelected = age === selectedAge;
    const selectedIndex = ages.indexOf(selectedAge);
    const distance = Math.abs(index - selectedIndex);
    
    // Calculate opacity based on distance from selected item
    let opacity = 1;
    if (distance >= 3) {
      opacity = 0.3; // Very faded for distant items
    } else if (distance === 2) {
      opacity = 0.3; // Slightly faded for items 2 positions away
    }
    // distance 0 (selected) and 1 (adjacent) keep full opacity
    
    return (
      <View key={age} style={[styles.ageItem, { height: itemHeight }]}>
        <Text
          style={[
            styles.ageText,
            isSelected && styles.selectedAgeText,
            { opacity }
          ]}
        >
          {age}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.pickerContainer, { height: containerHeight }]}>
        
        {/* Selection indicator - allow touches to pass through */}
        <View pointerEvents="none" style={[styles.selectionIndicator, { top: centerOffset }]} />
        
        {/* ScrollView with ages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentOffset={{ x: 0, y: initialIndex * itemHeight }}
          contentContainerStyle={{
            paddingTop: centerOffset,
            paddingBottom: centerOffset,
          }}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          scrollEventThrottle={16}
          snapToInterval={itemHeight}
          snapToAlignment="start"
          decelerationRate={Platform.OS === 'ios' ? 'fast' : 0.9}
          nestedScrollEnabled
          bounces={false}
          overScrollMode="never"
        >
          {ages.map(renderAgeItem)}
        </ScrollView>
        
      </View>
    
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  pickerContainer: {
    width: 120,
    position: 'relative',
    backgroundColor: '#171717',
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  scrollView: {
    flex: 1,
  },
  ageItem: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 5, // Add some vertical padding for better spacing
  },
  ageText: {
    fontSize: 40,
    // fontFamily: 'Raleway-Medium',
    color: '#666466',
    textAlign: 'center',
    fontWeight: 'bold',
    includeFontPadding: false,
  },
  selectedAgeText: {
    color: '#68FE00',
    fontSize: 64,
    fontWeight: '900',
    includeFontPadding: false,
  },
  selectionIndicator: {
    position: 'absolute',
    left: 10,
    right: 10,
    height: 90,
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#666466',
    zIndex: 1,
  },
});

export default AgePickerCmp;
