import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { SCREEN_PADDING } from '../../../theme';
import {
  appleAuthUser,
  clearError,
  googleAuthUser,
  loginUser,
} from '../../slice/LoginSlice';
import Close_Logo_SVG from '../../../assets/SVG/Close_Logo_SVG';
import { useNavigation } from '@react-navigation/native';
import {
  CustomTextInput,
  PrimaryButtonCmp,
  SocialMediaButtonCmp,
} from '../../components';
import Eye_Closed_SVG from '../../../assets/SVG/Eye_Closed_SVG';
import Eye_Open_SVG from '../../../assets/SVG/Eye_Open_SVG';
import { completeAuthSession } from '../../utils/completeAuthSession';
import { getGoogleAuthPayload } from '../../utils/googleSignIn';
import { getAppleAuthPayload } from '../../utils/appleSignIn';

const LoginView = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const { loading, error: apiError } = useAppSelector(state => state.login);

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [validationError, setValidationError] = useState<string>('');
  const [googleError, setGoogleError] = useState<string>('');
  const [appleError, setAppleError] = useState<string>('');
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);

  const validateEmail = (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const clearErrors = () => {
    setEmailError('');
    setPasswordError('');
    setValidationError('');
    setGoogleError('');
    setAppleError('');
    dispatch(clearError());
  };

  const handleLogin = async () => {
    clearErrors();

    // Check if fields are empty
    if (!email.trim()) {
      setEmailError('Email is required');
      return;
    }

    if (!password.trim()) {
      setPasswordError('Password is required');
      return;
    }

    // Validate email format
    if (!validateEmail(email.trim())) {
      setEmailError('Please enter a valid email address');
      return;
    }

    if (loading) {
      return;
    }

    try {
      const result = await dispatch(
        loginUser({ email: email.trim(), password }),
      );
      if (loginUser.fulfilled.match(result)) {
        await completeAuthSession(dispatch, result?.payload);
        setEmail('');
        setPassword('');
        setEmailError('');
        setPasswordError('');
        setValidationError('');
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleGoogleLogin = async () => {
    clearErrors();

    if (loading) {
      return;
    }

    try {
      const googlePayload = await getGoogleAuthPayload();

      if (!googlePayload) {
        return;
      }

      const result = await dispatch(googleAuthUser(googlePayload));

      if (googleAuthUser.fulfilled.match(result)) {
        await completeAuthSession(dispatch, result?.payload);
      }
    } catch (error: unknown) {
      setGoogleError(error instanceof Error ? error.message : 'Google sign-in failed');
      console.error('Google login error:', error);
    }
  };

  const handleAppleLogin = async () => {
    clearErrors();

    if (loading) {
      return;
    }

    try {
      const applePayload = await getAppleAuthPayload();

      if (!applePayload) {
        return;
      }

      const result = await dispatch(appleAuthUser(applePayload));

      if (appleAuthUser.fulfilled.match(result)) {
        await completeAuthSession(dispatch, result?.payload);
      }
    } catch (error: unknown) {
      setAppleError(error instanceof Error ? error.message : 'Apple sign-in failed');
      console.error('Apple login error:', error);
    }
  };

  // Clear validation errors when user starts typing
  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (emailError) setEmailError('');
    if (validationError) setValidationError('');
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (passwordError) setPasswordError('');
    if (validationError) setValidationError('');
  };

  return (
    <ImageBackground
      source={require('../../../assets/images/welcomeBackground.png')}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.flexOne}
        >
          <ScrollView contentContainerStyle={styles.content}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                navigation.goBack();
              }}
            >
              <Close_Logo_SVG />
            </TouchableOpacity>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Sign in</Text>
              <Text style={styles.description}>
                Let’s sign in to your account
              </Text>
            </View>

            <View style={styles.buttonContainer}>
              {Platform.OS === 'ios' && (
                <SocialMediaButtonCmp
                  icon={'apple'}
                  text={
                    loading ? 'Signing in with Apple...' : 'Sign in with Apple'
                  }
                  onPress={handleAppleLogin}
                  disabled={loading}
                />
              )}
              <SocialMediaButtonCmp
                icon={'google'}
                text={
                  loading ? 'Signing in with Google...' : 'Sign in with Google'
                }
                onPress={handleGoogleLogin}
                disabled={loading}
              />
            </View>

            <View style={styles.lineContainer}>
              <View style={styles.line} />
              <Text style={styles.lineText}>Or sign in with an Email</Text>
              <View style={styles.line} />
            </View>

            <View style={styles.inputContainer}>
              <CustomTextInput
                placeholder="Email"
                value={email}
                keyboardType="email-address"
                onChangeText={handleEmailChange}
                error={!!emailError}
              />
              {emailError && (
                <Text style={styles.fieldErrorText}>{emailError}</Text>
              )}

              <CustomTextInput
                placeholder="Password"
                value={password}
                onChangeText={handlePasswordChange}
                secureTextEntry={!isPasswordVisible}
                icon={isPasswordVisible ? <Eye_Open_SVG /> : <Eye_Closed_SVG />}
                onIconPress={() => setIsPasswordVisible(!isPasswordVisible)}
                error={!!passwordError}
              />
              {passwordError && (
                <Text style={styles.fieldErrorText}>{passwordError}</Text>
              )}
            </View>

            {(apiError || googleError || appleError) && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>
                  {apiError || googleError || appleError}
                </Text>
              </View>
            )}

            <View style={styles.buttonPrimaryContainer}>
              <PrimaryButtonCmp
                text={loading ? 'Signing in...' : 'Sign in'}
                onPress={handleLogin}
                disabled={loading}
                loading={loading}
              />
            </View>

            <TouchableOpacity
              style={styles.forgotPasswordContainer}
              onPress={() => {
                navigation.navigate('ForgotPassword' as never);
              }}
            >
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <TouchableOpacity
        style={styles.bottomContainer}
        onPress={() => {
          navigation.navigate('SignUpView' as never);
        }}
      >
        <Text style={styles.bottomText}>
          Don’t have an account?{' '}
          <Text style={styles.bottomTextLink}>Sign up </Text>
        </Text>
      </TouchableOpacity>

      {/* Bg-opacity */}
      <Image
        source={require('../../../assets/images/bg-opacity.png')}
        style={styles.bgOpacity}
      />
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  bgOpacity: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: 0,
  },
  safeArea: {
    flex: 1,
    zIndex: 1,
  },
  flexOne: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: SCREEN_PADDING.left,
    paddingBottom: 20,
  },
  closeButton: {
    marginVertical: 22,
  },
  titleContainer: {
    gap: 6,
    marginBottom: 70,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Raleway-Bold',
    color: '#fff',
    includeFontPadding: false,
  },
  description: {
    color: '#fff',
    includeFontPadding: false,
    fontFamily: 'Raleway-Medium',
    fontSize: 14,
  },
  buttonContainer: {
    gap: 15,
    marginBottom: 35,
  },
  line: {
    borderWidth: 1,
    borderColor: '#C5C5C5',
    flex: 1,
  },
  lineText: {
    fontSize: 14,
    fontFamily: 'Raleway-Medium',
    color: '#C5C5C5',
    includeFontPadding: false,
  },
  lineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 27,
  },
  inputContainer: {
    gap: 15,
  },
  fieldErrorText: {
    color: '#FF6B6B',
    fontSize: 12,
    fontFamily: 'Raleway-Medium',
    marginLeft: 38,
    includeFontPadding: false,
  },
  errorContainer: {
    marginTop: 10,
    marginBottom: 5,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    fontFamily: 'Raleway-Medium',
    textAlign: 'center',
    includeFontPadding: false,
  },
  buttonPrimaryContainer: {
    paddingTop: 15,
    paddingBottom: 26,
  },
  forgotPasswordContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  forgotPasswordText: {
    color: '#68FE00',
    fontSize: 15,
    fontFamily: 'Raleway-Medium',
    includeFontPadding: false,
  },
  bottomContainer: {
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 53,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  bottomText: {
    fontSize: 15,
    color: '#fff',
    fontFamily: 'Raleway-Medium',
  },
  bottomTextLink: {
    color: '#68FE00',
  },
});

export default LoginView;
