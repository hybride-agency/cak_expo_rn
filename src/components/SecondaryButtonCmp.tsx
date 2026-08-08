import {Text, TouchableOpacity, StyleSheet} from 'react-native';
import React from 'react';

interface SecondaryButtonCmpProps {
  text: string;
  onPress: () => void;
  disabled?: boolean;
}

const SecondaryButtonCmp = ({ text, onPress, disabled = false }: SecondaryButtonCmpProps) => {
  return (
    <TouchableOpacity
      style={[styles.container, disabled && styles.containerDisabled]}
      onPress={onPress}
      disabled={disabled}>
      <Text style={styles.text}>{text}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 16,
    backgroundColor: '#65FD08',
    borderRadius: 62,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    width: 175,
  },
  containerDisabled: {
    opacity: 0.4,
  },
  text: {
    fontSize: 16,
    fontFamily: 'Raleway-Medium',
    color: '#171717',
    padding: 0,
    margin: 0,
    includeFontPadding: false,
  },
});

export default SecondaryButtonCmp;
