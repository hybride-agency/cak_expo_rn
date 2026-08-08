import {
  View,
  Text,
  StyleSheet,
  TextInput,
  KeyboardTypeOptions,
  ReturnKeyTypeOptions,
  TouchableOpacity,
} from 'react-native';
import React from 'react';

interface CustomTextInputProps {
  placeholder?: string;
  onChangeText?: (text: string) => void;
  editable?: boolean;
  onSubmitEditing?: () => void;
  keyboardType?: KeyboardTypeOptions;
  returnKeyType?: ReturnKeyTypeOptions;
  secureTextEntry?: boolean;
  value?: string;
  defaultValue?: string;
  multiline?: boolean;
  numberOfLines?: number;
  error?: boolean;
  icon?: React.ReactNode;
  onIconPress?: () => void;
}

const CustomTextInput = ({
  placeholder,
  onChangeText,
  editable,
  onSubmitEditing,
  keyboardType,
  returnKeyType,
  secureTextEntry,
  value,
  defaultValue,
  multiline,
  numberOfLines,
  error,
  icon,
  onIconPress,
}: CustomTextInputProps) => {

  const onChangeValue = (text: string) => {
    if (onChangeText) {
      onChangeText(text);
    }
  };

  // Function to render placeholder with red asterisk
  const renderPlaceholder = () => {
    if (!placeholder || (value && value.length > 0)) return null;
    
    // Check if placeholder ends with " *"
    if (placeholder.endsWith(' *')) {
      const textWithoutAsterisk = placeholder.slice(0, -2);
      return (
        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderText}>
            {textWithoutAsterisk}
          </Text>
          <Text style={styles.asterisk}> *</Text>

        </View>
      );
    }
    
    // Regular placeholder without asterisk
    return (
      <View style={styles.placeholderContainer}>
        <Text style={styles.placeholderText}>{placeholder}</Text>
      </View>
    );
  };
  
  return (
    <View style={[styles.container, error && styles.errorContainer]}>
      <TextInput
        style={styles.input}
        placeholder=""
        placeholderTextColor={'#C5C5C5'}
        onChangeText={onChangeValue}
        value={value}
        defaultValue={defaultValue}
        numberOfLines={numberOfLines}
        autoCapitalize="none"
        autoCorrect={false}
        multiline={multiline}
        autoComplete="off"
        editable={editable}
        onSubmitEditing={onSubmitEditing}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        returnKeyType={returnKeyType}
      />
      {renderPlaceholder()}
      {icon && (
        <TouchableOpacity style={styles.iconContainer} onPress={onIconPress}>
          {icon}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingLeft: 38,
    paddingRight: 19,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: '#C5C5C5',
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  errorContainer: {
    borderColor: '#FF6B6B',
  },
  input: {
    width: '100%',
    height: '100%',
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Raleway-Light'
  },
  placeholderContainer: {
    position: 'absolute',
    left: 41,
    right: 19,
    pointerEvents: 'none',
    flexDirection: 'row',
  },
  placeholderText: {
    fontSize: 16,
    color: '#C5C5C5',
    fontFamily: 'Raleway-Light',
  },
  asterisk: {
    color: '#FF0000',
    fontSize: 18,
  },
  iconContainer: {
    position: 'absolute',
    right: 19
  }
});

export default CustomTextInput;
