import { Image, Text, StyleSheet, TouchableOpacity, View } from 'react-native';
import React from 'react';
import Check_Logo_SVG from '../../assets/SVG/Check_Logo_SVG';
import type {PickerItem} from './DropDownPickerCmp';

interface MultiSelectionPickerCmpProps {
  item: PickerItem;
  title: string;
  onPress: (item: PickerItem, title: string) => void;
  isSelected: boolean;
  isFollowUp?: boolean;
}

const MultiSelectionPickerCmp = ({
  item,
  title,
  onPress,
  isSelected,
  isFollowUp = false,
}: MultiSelectionPickerCmpProps) => {
  const onSelect = (title: string) => {
    onPress(item, title);
  };
  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          height: item.image_url ? 77 : 52,
          borderWidth: isSelected ? 3 : 0,
          borderColor: isSelected ? '#68FE00' : 'transparent',
        },
      ]}
      onPress={() => onSelect(title)}
    >
      <Text style={styles.title}>{title}</Text>
      {item.image_url && (
        <View
          style={[
            styles.imageContainer,
            {
              height: item.order === 1 ? 36 : '100%',
              paddingRight: item.order === 1 ? 20 : 0,
            },
          ]}
        >
          <Image
            source={{ uri: item.image_url }}
            style={styles.image}
            resizeMode="contain"
          />
        </View>
      )}
      {isSelected && !item.image_url && (
        <View style={styles.checkContainer}>
            <Check_Logo_SVG />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingLeft: 28,
    width: '100%',
    backgroundColor: '#2A2A2A',
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 14,
    fontFamily: 'Raleway-Bold',
    color: '#fff',
  },
  imageContainer: {
    height: '100%',
    width: 77,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  checkContainer: {
    paddingRight: 21
  }
});

export default MultiSelectionPickerCmp;
