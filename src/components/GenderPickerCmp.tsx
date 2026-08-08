import {
  View,
  StyleSheet,
  Image,
  Pressable,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';

interface GenderPickerCmpProps {
  onSelectGender: (gender: string) => void;
  onChangeGender?: (gender: string) => void;
  selectedGender?: string | null;
}

const GenderPickerCmp = ({
  onSelectGender,
  onChangeGender,
  selectedGender: controlledSelectedGender,
}: GenderPickerCmpProps) => {
  const [selectedGender, setSelectedGender] = useState<string>('');
  const selectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeGender = controlledSelectedGender ?? selectedGender;

  useEffect(() => {
    return () => {
      if (selectTimeoutRef.current) {
        clearTimeout(selectTimeoutRef.current);
      }
    };
  }, []);

  const handleSelectGender = (gender: string) => {
    setSelectedGender(gender);
    onChangeGender?.(gender);

    if (onSelectGender) {
      if (selectTimeoutRef.current) {
        clearTimeout(selectTimeoutRef.current);
      }

      selectTimeoutRef.current = setTimeout(() => {
        onSelectGender(gender);
      }, 500);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => handleSelectGender('f')}
        style={[
          styles.imageContainer,
          {
            borderColor: activeGender === 'f' ? '#68FE00' : '#2A2A2A',
          },
        ]}
      >
        <Image
          source={require('../../assets/images/female.png')}
          style={[
            styles.image,
            {
              marginLeft: 15,
            },
          ]}
          resizeMode="cover"
        />
      </Pressable>
      <Pressable
        onPress={() => handleSelectGender('m')}
        style={[
          styles.imageContainer,
          {
            borderColor: activeGender === 'm' ? '#68FE00' : '#2A2A2A',
          },
        ]}
      >
        <Image
          source={require('../../assets/images/male.png')}
          style={styles.image}
          resizeMode="cover"
        />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 28,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageContainer: {
    width: '100%',
    flex: 1,
    height: 278,
    borderWidth: 3,
    borderRadius: 15,
  },
});

export default GenderPickerCmp;
