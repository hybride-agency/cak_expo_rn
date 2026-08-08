import {Text, StyleSheet, TouchableOpacity} from 'react-native';
import React from 'react';
import Check_Logo_SVG from '../../assets/SVG/Check_Logo_SVG';
import type {PickerItem} from './DropDownPickerCmp';

interface RadioButtonCmpProps {
  item: PickerItem;
  title: string;
  onPress: (item: PickerItem, title: string) => void;
  isSelected: boolean;
  isFollowUp?: boolean;
  follow_up_question_id?: number | null;
}

const RadioButtonCmp = ({
  item,
  title,
  onPress,
  isSelected,
  isFollowUp = false,
  follow_up_question_id,
}: RadioButtonCmpProps) => {
  const onSelect = (title: string) => {
    onPress(item, title);
  };
  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          borderWidth: isSelected ? 3 : 0,
          borderColor: isSelected ? '#68FE00' : 'transparent',
          paddingVertical: isFollowUp || follow_up_question_id === null ? 18 : 30,
        },
      ]}
      onPress={() => onSelect(title)}
    >
      <Text style={styles.title}>{title}</Text>
      {isSelected && <Check_Logo_SVG />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 30,
    paddingHorizontal: 28,
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
});

export default RadioButtonCmp;
