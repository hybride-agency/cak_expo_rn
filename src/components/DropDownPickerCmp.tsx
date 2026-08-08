import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Animated,
  TouchableOpacity,
} from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import Search_Logo_SVG from '../../assets/SVG/Search_Logo_SVG';
import Small_Close_Logo_SVG from '../../assets/SVG/Small_Close_Logo_SVG';

export interface PickerItem {
  id: number | string;
  title?: string;
  image_url?: string | null;
  order?: number;
}

interface DropDownPickerCmpProps {
  data: PickerItem[];
  onSelectionChange?: (selectedIds: string[]) => void;
}

const DropDownPickerCmp = ({
  data,
  onSelectionChange,
}: DropDownPickerCmpProps) => {
  const [searchValue, setSearchValue] = useState<string>('');
  const [selectedItems, setSelectedItems] = useState<PickerItem[]>([]);
  const scrollY = useRef(new Animated.Value(0)).current;

  const [visibleHeight, setVisibleHeight] = useState(1);
  const [contentHeight, setContentHeight] = useState(1);

  // Filter data based on search value
  const filteredData = data.filter(item =>
    (item.title ?? '').toLowerCase().includes(searchValue.toLowerCase()),
  );

  // Toggle item selection
  const toggleItemSelection = (item: PickerItem) => {
    setSelectedItems(prev => {
      const isSelected = prev.some(selected => selected.id === item.id);
      if (isSelected) {
        return prev.filter(selected => selected.id !== item.id);
      } else {
        return [...prev, item];
      }
    });
  };

  // Remove item from selection
  const removeSelectedItem = (itemToRemove: PickerItem) => {
    setSelectedItems(prev => prev.filter(item => item.id !== itemToRemove.id));
  };

  // Check if item is selected
  const isItemSelected = (item: PickerItem) => {
    return selectedItems.some(selected => selected.id === item.id);
  };

  // Call callback whenever selection changes
  useEffect(() => {
    if (onSelectionChange) {
      const selectedIds = selectedItems.map(item => String(item.id));
      onSelectionChange(selectedIds);
    }
  }, [onSelectionChange, selectedItems]);

  // thumb size = (visibleHeight² / contentHeight)
  const thumbHeight =
    contentHeight > visibleHeight
      ? (visibleHeight * visibleHeight) / contentHeight
      : visibleHeight;

  const maxThumbTranslate = visibleHeight - thumbHeight;

  const translateY = scrollY.interpolate({
    inputRange: [0, Math.max(contentHeight - visibleHeight, 1)],
    outputRange: [0, maxThumbTranslate],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Search_Logo_SVG />
        <TextInput
          style={styles.input}
          value={searchValue}
          onChangeText={setSearchValue}
          placeholder="Search"
          placeholderTextColor="#C5C5C5"
        />
      </View>

      <View style={styles.listContainer}>
        <View
          style={styles.flatListContainer}
          onLayout={e => setVisibleHeight(e.nativeEvent.layout.height)}
        >
          <FlatList
            data={filteredData}
            keyExtractor={(item, index) =>
              item.id?.toString() || index.toString()
            }
            renderItem={({ item }) => {
              const isSelected = isItemSelected(item);
              return (
                <TouchableOpacity
                  style={styles.listItem}
                  onPress={() => toggleItemSelection(item)}
                >
                  <Text style={styles.listItemText}>{item.title ?? ''}</Text>
                  <View
                    style={[
                      styles.circle,
                      {
                        backgroundColor: isSelected ? '#68FE00' : '#2A2A2A',
                        borderWidth: isSelected ? 0 : 1,
                        borderColor: isSelected ? '#68FE00' : '#C5C5C5',
                      },
                    ]}
                  />
                </TouchableOpacity>
              );
            }}
            ItemSeparatorComponent={() => (
              <View style={styles.listItemSeparator} />
            )}
            onContentSizeChange={(w, h) => setContentHeight(h)}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: false },
            )}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 21 }}
            ListHeaderComponent={() => (
              <>
                {/* Selected Items Display */}
                {selectedItems.length > 0 && (
                  <View style={styles.selectedItemsContainer}>
                    <View style={styles.selectedItemsWrapper}>
                      {selectedItems.map((item, index) => (
                        <TouchableOpacity
                          key={item.id?.toString() || index.toString()}
                          style={styles.selectedItem}
                          onPress={() => removeSelectedItem(item)}
                        >
                          <Text style={styles.selectedItemText}>
                            {item.title ?? ''}
                          </Text>
                          <Small_Close_Logo_SVG />
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}
              </>
            )}
          />

          {/* Custom Scrollbar */}
          <View style={styles.scrollbarTrack}>
            <Animated.View
              style={[
                styles.scrollbarThumb,
                {
                  height: thumbHeight,
                  transform: [{ translateY }],
                },
              ]}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: '#68FE00',
    borderRadius: 15,
    backgroundColor: '#2A2A2A',
    height: 56,
    gap: 4,
    marginBottom: 22,
  },
  input: {
    fontSize: 16,
    fontFamily: 'Raleway-Light',
    color: '#C5C5C5',
    flex: 1,
  },
  listContainer: {
    height: 371,
    width: '100%',
    backgroundColor: '#2A2A2A',
    borderRadius: 15,
  },
  flatListContainer: {
    width: '100%',
    backgroundColor: '#2A2A2A',
    borderRadius: 15,
    flexDirection: 'row',
  },
  listItemText: {
    fontSize: 14,
    fontFamily: 'Raleway-Light',
    color: '#FFFFFF',
    width: '90%',
  },
  listItemSeparator: {
    height: 38,
  },
  scrollbarTrack: {
    position: 'absolute',
    right: 11,
    top: 0,
    bottom: 0,
    width: 2,
    justifyContent: 'flex-start',
  },
  scrollbarThumb: {
    width: 2,
    backgroundColor: '#68FE00',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  circle: {
    width: 19,
    height: 19,
    borderRadius: 19,
  },
  selectedItemsContainer: {
    paddingBottom: 21
  },
  selectedItemsTitle: {
    fontSize: 16,
    fontFamily: 'Raleway-Medium',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  selectedItemsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  selectedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(217, 217, 217, 0.15)',
    borderRadius: 15,
    paddingHorizontal: 9,
    paddingVertical: 5,
    gap: 6,
  },
  selectedItemText: {
    fontSize: 10,
    fontFamily: 'Raleway-Light',
    includeFontPadding: false,
    color: '#C5C5C5',
  },
});

export default DropDownPickerCmp;
