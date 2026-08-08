import {Text, TouchableOpacity, StyleSheet, ActivityIndicator} from 'react-native';
import React from 'react';

interface PrimaryButtonCmpProps {
  text: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

const PrimaryButtonCmp = ({
  text,
  onPress,
  loading = false,
  disabled = false,
}: PrimaryButtonCmpProps) => {
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
    backgroundColor: '#65FD08',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    width: '100%',
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

export default PrimaryButtonCmp;
