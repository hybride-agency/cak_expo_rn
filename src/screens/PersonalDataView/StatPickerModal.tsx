import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, Modal, TouchableOpacity} from 'react-native';
import Svg, {Path} from 'react-native-svg';

import {toApiGender, toPickerGender} from './validation';
import {
  AgePickerCmp,
  GenderPickerCmp,
  HeightPickerCmp,
  PrimaryButtonCmp,
  WeightPickerCmp,
} from '../../components';

export type PickerField = 'height' | 'weight' | 'age' | 'gender';

const ACCENT = '#68FE00';
const SURFACE = '#222222';

const TITLES: Record<PickerField, string> = {
  height: 'Height',
  weight: 'Weight',
  age: 'Age',
  gender: 'Gender',
};

interface StatPickerModalProps {
  field: PickerField | null;
  initialValue: number | string;
  onCancel: () => void;
  onSave: (value: number | string) => void;
}

const StatPickerModal = ({
  field,
  initialValue,
  onCancel,
  onSave,
}: StatPickerModalProps) => {
  const [value, setValue] = useState<number | string>(initialValue);

  // Reset to the current profile value each time a different field is opened.
  useEffect(() => {
    if (field) {
      setValue(initialValue);
    }
  }, [field, initialValue]);

  const renderPicker = () => {
    switch (field) {
      case 'height':
        return (
          <HeightPickerCmp
            initialHeight={toNumber(initialValue, 172)}
            minHeight={50}
            maxHeight={250}
            onSelectHeight={setValue}
          />
        );
      case 'weight':
        return (
          <WeightPickerCmp
            initialWeight={toNumber(initialValue, 65)}
            minWeight={30}
            maxWeight={300}
            onSelectWeight={setValue}
          />
        );
      case 'age':
        return (
          <AgePickerCmp
            initialAge={toNumber(initialValue, 25)}
            minAge={10}
            maxAge={120}
            onSelectAge={setValue}
          />
        );
      case 'gender':
        return (
          <GenderPickerCmp
            selectedGender={toPickerGender(value)}
            onChangeGender={code => setValue(toApiGender(code))}
            // Fires on a 500ms delay to auto-advance the quiz. Here it only
            // re-sets the value already held, so the sheet stays open.
            onSelectGender={code => setValue(toApiGender(code))}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Modal
      visible={field !== null}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
              <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M18 6L6 18M6 6l12 12"
                  stroke="#FFF"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </Svg>
            </TouchableOpacity>
            <Text style={styles.title}>{field ? TITLES[field] : ''}</Text>
            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.pickerContainer}>{renderPicker()}</View>

          <PrimaryButtonCmp text="Save" onPress={() => onSave(value)} />
        </View>
      </View>
    </Modal>
  );
};

const toNumber = (value: number | string, fallback: number) => {
  const parsed = typeof value === 'number' ? value : Number(value);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const styles = StyleSheet.create({
  backdrop: {flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end'},
  sheet: {
    backgroundColor: SURFACE,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  closeButton: {width: 32, height: 32, justifyContent: 'center'},
  title: {color: ACCENT, fontSize: 18, fontFamily: 'Raleway-Bold'},
  headerSpacer: {width: 32},
  pickerContainer: {alignItems: 'center', marginBottom: 16},
});

export default StatPickerModal;
