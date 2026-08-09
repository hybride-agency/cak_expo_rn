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
  
  interface HeightPickerCmpProps {
    onSelectHeight?: (height: number) => void;
    initialHeight?: number;
    minHeight?: number;
    maxHeight?: number;
  }
  
  const HeightPickerCmp = ({
    onSelectHeight,
    initialHeight = 172,
    minHeight = 0,
    maxHeight = 300,
  }: HeightPickerCmpProps) => {
    const scrollViewRef = useRef<ScrollView>(null);
    const [selectedHeight, setSelectedHeight] = useState<number>(initialHeight);
    // Calculate item height and container height
    const itemHeight = 80;
    const containerHeight = itemHeight * 5; // Show 5 items at once
    const centerOffset = containerHeight / 2 - itemHeight / 2;
  
    // Generate age array
    const heights = useMemo(
      () =>
        Array.from(
          {length: maxHeight - minHeight + 1},
          (_, i) => minHeight + i,
        ),
      [maxHeight, minHeight],
    );
    const initialIndex = useMemo(() => {
      const idx = heights.indexOf(initialHeight);
      return idx >= 0 ? idx : 0;
    }, [heights, initialHeight]);
  
    // Remove timeout-based initial scroll; rely on contentOffset for reliable initial positioning

    const onSelectHeightRef = useRef(onSelectHeight);
    onSelectHeightRef.current = onSelectHeight;

    // Only re-fires when the selected value changes, not when the parent
    // passes a new (often unmemoized) callback identity on every render.
    useEffect(() => {
      onSelectHeightRef.current?.(selectedHeight);
    }, [selectedHeight]);
  
    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const scrollY = event.nativeEvent.contentOffset.y;
      const index = Math.round(scrollY / itemHeight);
      const clampedIndex = Math.max(0, Math.min(heights.length - 1, index));
      const newHeight = heights[clampedIndex];
      
      if (newHeight !== undefined && newHeight !== selectedHeight) {
        setSelectedHeight(newHeight);
      }
    };
  
    const handleMomentumScrollEnd = (
      event: NativeSyntheticEvent<NativeScrollEvent>,
    ) => {
      const scrollY = event.nativeEvent.contentOffset.y;
      const index = Math.round(scrollY / itemHeight);
      const clampedIndex = Math.max(0, Math.min(heights.length - 1, index));
      
      // Snap to nearest item
      scrollViewRef.current?.scrollTo({
        y: clampedIndex * itemHeight,
        animated: true,
      });
    };
  
    const renderHeightItem = (height: number, index: number) => {
      const isSelected = height === selectedHeight;
      const selectedIndex = heights.indexOf(selectedHeight);
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
        <View key={height} style={[styles.ageItem, { height: itemHeight }]}>
          <Text
            style={[
              styles.ageText,
              isSelected && styles.selectedAgeText,
              { opacity, position: 'relative' }
            ]}
          >
            {height}
          </Text>
          {isSelected && <Text style={styles.selectedHeightText}>cm</Text>}
        </View>
      );
    };
  
    return (
      <View style={styles.container}>
        <View style={[styles.pickerContainer, { height: containerHeight }]}>
          
          {/* Selection indicator */}
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
            {heights.map(renderHeightItem)}
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
      width: 200,
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
    selectedHeightText: {
        color: '#68FE00',
        fontSize: 20,
        fontFamily: 'Raleway-ExtraBold',
        position: 'absolute',
        right: 10,
        bottom: 10,
    }
  });
  
  export default HeightPickerCmp;
