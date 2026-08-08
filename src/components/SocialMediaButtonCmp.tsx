import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import React from 'react';
import Google_Logo_SVG from '../../assets/SVG/Google_Logo_SVG';
import Apple_Logo_SVG from '../../assets/SVG/Apple_Logo_SVG';

interface SocialMediaButtonCmpProps {
  icon: string;
  text: string;
  onPress?: () => void;
  disabled?: boolean;
}

const SocialMediaButtonCmp = ({
  icon,
  text,
  onPress,
  disabled = false,
}: SocialMediaButtonCmpProps) => {
  const renderIcon = () => {
    switch (icon) {
      case 'google':
        return <Google_Logo_SVG />;
      case 'apple':
        return <Apple_Logo_SVG />;
      default:
        return <View />;
    }
  };
  return (
    <TouchableOpacity
      style={[styles.container, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
    >
      {renderIcon()}
      <Text style={styles.text}>{text}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 21,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  text: {
    fontSize: 16,
    fontFamily: 'Raleway-Medium',
    color: '#171717',
    padding: 0,
    margin: 0,
    includeFontPadding: false,
  },
  disabled: {
    opacity: 0.7,
  },
});

export default SocialMediaButtonCmp;
