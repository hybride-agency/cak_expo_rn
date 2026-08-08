import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Arrow_Back_Logo_SVG from '../../../assets/SVG/Arrow_Back_Logo_SVG';
import { SCREEN_PADDING } from '../../../theme';
import { useNavigation } from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import { CustomTextInput, PrimaryButtonCmp } from '../../components';
import axiosInstance from '../../axiosConfig';
import type {AuthStackParamList} from '../../navigation/AuthenticationStack';

const ForgotPasswordView = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList>>();

  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [emailError, setEmailError] = useState<string>('');

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const clearErrors = () => {
    setEmailError('');
  };

  const handleForgotPassword = async () => {
    clearErrors();
    
    // Check if email field is empty
    if (!email.trim()) {
      setEmailError('Email is required');
      return;
    }
    
    // Validate email format
    if (!validateEmail(email.trim())) {
      setEmailError('Please enter a valid email address');
      return;
    }
    
    try {
      setLoading(true);
      const response = await axiosInstance.post('/auth/forgot-password', {
        email: email.trim(),
      });

      if (response.status === 200) {
        navigation.navigate('OtpView', {
          email: email.trim(),
        });
      }
      setLoading(false);
    } catch (error) {
      console.error('Forgot password error:', error);
      setLoading(false);
    }
  };

  // Clear validation errors when user starts typing
  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (emailError) setEmailError('');
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <TouchableOpacity
          style={styles.backButtonContainer}
          onPress={() => {
            navigation.goBack();
          }}
        >
          <Arrow_Back_Logo_SVG />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Forgot Password</Text>
          <Text style={styles.description}>
            Please write your email to receive a confirmation code to set a new
            password
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <CustomTextInput
            value={email}
            onChangeText={handleEmailChange}
            placeholder="Email"
            error={!!emailError}
          />
          {emailError && (
            <Text style={styles.fieldErrorText}>{emailError}</Text>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <PrimaryButtonCmp
            text="Send"
            loading={loading}
            disabled={loading}
            onPress={() => {
              handleForgotPassword();
            }}
          />
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#171717',
    paddingHorizontal: SCREEN_PADDING.left,
  },
  safeArea: {
    flex: 1,
  },
  backButtonContainer: {
    marginTop: 41,
    marginBottom: 91,
  },
  titleContainer: {
    gap: 9,
    marginBottom: 60,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Raleway-Bold',
    color: '#fff',
    includeFontPadding: false,
  },
  description: {
    fontSize: 14,
    fontFamily: 'Raleway-Medium',
    color: '#C5C5C5',
    includeFontPadding: false,
  },
  inputContainer: {
    gap: 13,
    marginBottom: 30,
  },
  fieldErrorText: {
    color: '#FF6B6B',
    fontSize: 12,
    fontFamily: 'Raleway-Medium',
    marginLeft: 0,
    includeFontPadding: false,
  },
  label: {
    color: '#C5C5C5',
    fontSize: 16,
    fontFamily: 'Raleway-Light',
  },
  buttonContainer: {},
});

export default ForgotPasswordView;
