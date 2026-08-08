import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SCREEN_PADDING } from '../../../theme';
import { useNavigation } from '@react-navigation/native';
import Close_Logo_SVG from '../../../assets/SVG/Close_Logo_SVG';
import {
  CustomTextInput,
  PrimaryButtonCmp,
  SocialMediaButtonCmp,
} from '../../components';
import { signUpUser, setUser } from '../../slice/SignUpSlice';
import { useAppDispatch, useAppSelector } from '../../store';
import Eye_Closed_SVG from '../../../assets/SVG/Eye_Closed_SVG';
import Eye_Open_SVG from '../../../assets/SVG/Eye_Open_SVG';
import {
  clearError,
  googleAuthUser,
  setIsLoggedIn,
} from '../../slice/LoginSlice';
import { saveAuthSession } from '../../utils/authSession';
import { setIsQuestion } from '../../slice/WelcomeSlice';
import { completeAuthSession } from '../../utils/completeAuthSession';
import { getGoogleAuthPayload } from '../../utils/googleSignIn';

const SignUpView = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [number, setNumber] = useState<string>('');
  const [nameError, setNameError] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [phoneError, setPhoneError] = useState<string>('');
  const [googleError, setGoogleError] = useState<string>('');
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);

  const { loading, error: apiError } = useAppSelector(state => state.signUp);
  const { loading: googleLoading, error: googleApiError } = useAppSelector(
    state => state.login,
  );

  const validateEmail = (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const validatePhone = (phone: string): boolean => {
    // Check if phone contains only numbers, spaces, dashes, and parentheses
    const phoneRegex = /^[0-9\s\-()]+$/;
    return phoneRegex.test(phone);
  };

  const clearErrors = () => {
    setNameError('');
    setEmailError('');
    setPasswordError('');
    setPhoneError('');
    setGoogleError('');
    dispatch(clearError());
  };

  const handleSignUp = async () => {
    clearErrors();

    // Check if required fields are empty
    if (!name.trim()) {
      setNameError('Name is required');
      return;
    }

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

    // Validate phone number if provided
    if (number.trim() && !validatePhone(number.trim())) {
      setPhoneError(
        'Phone number can only contain numbers, spaces, dashes, and parentheses',
      );
      return;
    }

    if (loading) {
      return;
    }

    try {
      console.log('name', name);
      console.log('email', email);
      console.log('password', password);
      const resultAction = await dispatch(
        signUpUser({
          name: name.trim(),
          email: email.trim(),
          password,
          password_confirmation: password,
        }),
      );

      if (signUpUser.fulfilled.match(resultAction)) {
        const sessionData = resultAction?.payload?.data ?? {};
        dispatch(setUser(sessionData));
        dispatch(setIsLoggedIn(true));
        await saveAuthSession({
          token: sessionData?.token ?? null,
          action_plan: sessionData?.action_plan ?? '',
          loginUser: resultAction?.payload ?? null,
          isLoggedIn: true,
          isWelcome: false,
          isQuestion: true,
          isPlan: false,
        });
        dispatch(setIsQuestion(true));
      }
    } catch (error) {
      console.error('Sign up error:', error);
    }
  };

  const handleGoogleSignUp = async () => {
    clearErrors();

    if (googleLoading || loading) {
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
      setGoogleError(error instanceof Error ? error.message : 'Google sign-up failed');
      console.error('Google sign up error:', error);
    }
  };

  // Clear validation errors when user starts typing
  const handleNameChange = (text: string) => {
    setName(text);
    if (nameError) setNameError('');
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (emailError) setEmailError('');
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (passwordError) setPasswordError('');
  };

  const handlePhoneChange = (text: string) => {
    setNumber(text);
    if (phoneError) setPhoneError('');
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
              <Text style={styles.title}>Create an account</Text>
            </View>

            <View style={styles.buttonContainer}>
              {Platform.OS === 'ios' && (
                <SocialMediaButtonCmp
                  icon={'apple'}
                  text={'Sign up with Apple'}
                  disabled
                />
              )}
              <SocialMediaButtonCmp
                icon={'google'}
                text={
                  googleLoading || loading
                    ? 'Signing up with Google...'
                    : 'Sign up with Google'
                }
                onPress={handleGoogleSignUp}
                disabled={googleLoading || loading}
              />
            </View>

            <View style={styles.lineContainer}>
              <View style={styles.line} />
              <Text style={styles.lineText}>Or sign up with an Email</Text>
              <View style={styles.line} />
            </View>

            <View style={styles.inputContainer}>
              <CustomTextInput
                placeholder="Your name *"
                value={name}
                onChangeText={handleNameChange}
                error={!!nameError}
              />
              {nameError && (
                <Text style={styles.fieldErrorText}>{nameError}</Text>
              )}

              <CustomTextInput
                placeholder="Phone number"
                value={number}
                onChangeText={handlePhoneChange}
                error={!!phoneError}
              />
              {phoneError && (
                <Text style={styles.fieldErrorText}>{phoneError}</Text>
              )}

              <CustomTextInput
                placeholder="Email *"
                value={email}
                keyboardType="email-address"
                onChangeText={handleEmailChange}
                error={!!emailError}
              />
              {emailError && (
                <Text style={styles.fieldErrorText}>{emailError}</Text>
              )}

              <CustomTextInput
                placeholder="Password *"
                value={password}
                onChangeText={handlePasswordChange}
                secureTextEntry={!isPasswordVisible}
                error={!!passwordError}
                icon={isPasswordVisible ? <Eye_Open_SVG /> : <Eye_Closed_SVG />}
                onIconPress={() => setIsPasswordVisible(!isPasswordVisible)}
              />
              {passwordError && (
                <Text style={styles.fieldErrorText}>{passwordError}</Text>
              )}
            </View>

            {(googleApiError || googleError || apiError) && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>
                  {googleApiError || googleError || apiError}
                </Text>
              </View>
            )}

            <View style={styles.buttonPrimaryContainer}>
              <PrimaryButtonCmp
                text="Sign up"
                loading={loading}
                disabled={loading || googleLoading}
                onPress={() => {
                  handleSignUp();
                }}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <TouchableOpacity
        style={styles.bottomContainer}
        onPress={() => {
          navigation.navigate('Login' as never);
        }}
      >
        <Text style={styles.bottomText}>
          Already have an account?{' '}
          <Text style={styles.bottomTextLink}>Sign in </Text>
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
  inputContainer: {
    gap: 15,
  },
  fieldErrorText: {
    color: '#FF6B6B',
    fontSize: 12,
    fontFamily: 'Raleway-Medium',
    marginLeft: 0,
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
});

export default SignUpView;
