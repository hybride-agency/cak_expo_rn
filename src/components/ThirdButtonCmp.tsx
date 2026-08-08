import {Text, TouchableOpacity, StyleSheet, ActivityIndicator} from 'react-native';
import React from 'react';

interface ThirdButtonCmpProps {
  text: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

const ThirdButtonCmp = ({
  text,
  onPress,
  loading = false,
  disabled = false,
}: ThirdButtonCmpProps) => {
  return (
    <TouchableOpacity style={styles.container} disabled={disabled} onPress={onPress}>
      {loading ? (
        <ActivityIndicator size="small" color="#171717" />
      ) : (
        <Text style={styles.text}>{text}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 21,
    backgroundColor: '#2A2A2A',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    width: '100%',
  },
  text: {
    fontSize: 20,
    fontFamily: 'Raleway-Bold',
    color: '#68FE00',
    padding: 0,
    margin: 0,
    includeFontPadding: false,
  },
});

export default ThirdButtonCmp;
