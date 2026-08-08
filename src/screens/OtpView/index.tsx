import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Arrow_Back_Logo_SVG from '../../../assets/SVG/Arrow_Back_Logo_SVG';
import { useNavigation, useRoute } from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import { SCREEN_PADDING } from '../../../theme';
import Email_Logo_SVG from '../../../assets/SVG/Email_Logo_SVG';
import { OtpInput } from 'react-native-otp-entry';
import PrimaryButtonCmp from '../../components/PrimaryButtonCmp';
import axiosInstance from '../../axiosConfig';
import type {AuthStackParamList} from '../../navigation/AuthenticationStack';

const OtpView = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList>>();

  const [time, setTime] = useState(120);
  const [code, setCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const {email} = useRoute<RouteProp<AuthStackParamList, 'OtpView'>>().params;

  useEffect(() => {
    if (time > 0) {
      const interval = setInterval(() => {
        setTime(prevTime => prevTime - 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [time]);

  const handleValidateCode = async (text: string) => {
    try {
      setLoading(true);
      console.log('code', code);
      const response = await axiosInstance.post('/auth/validate-otp', {
        email: email,
        otp: text,
      });

      if (response.status === 200) {
        navigation.navigate('NewPasswordView', {
          email: email,
          code: text,
        });
      }

      setLoading(false);
    } catch (error) {
      console.error('Validate code error:', error);
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      const response = await axiosInstance.post('/auth/forgot-password', {
        email: email.trim(),
      });

      if (response.status === 200) {
        setTime(120);
      }
    } catch (error) {
      console.error('Resend code error:', error);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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

          <View style={styles.EmailLogoContainer}>
            <Email_Logo_SVG />
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Verify email address</Text>
            <Text style={styles.description}>
              Verification code sent to{' '}
              <Text style={styles.email}>{email}</Text>
            </Text>
          </View>

          <View style={styles.otpContainer}>
            <OtpInput
              numberOfDigits={4}
              autoFocus={false}
              onTextChange={text => {
                setCode(text);
                console.log('text', text);
              }}
              onFilled={text => {
                handleValidateCode(text);
              }}
              theme={{
                containerStyle: {
                  width: '100%',
                },
                pinCodeContainerStyle: {
                  height: 71,
                  width: 71,
                  borderColor: '#666466',
                },
                focusStickStyle: {
                  backgroundColor: '#68FE00',
                },
                focusedPinCodeContainerStyle: {
                  borderColor: '#68FE00',
                },
                filledPinCodeContainerStyle: {
                  borderColor: '#68FE00',
                },
                pinCodeTextStyle: {
                  color: '#68FE00',
                },
              }}
            />
          </View>

          <View style={styles.buttonContainer}>
            <PrimaryButtonCmp
              text="Confirm code"
              loading={loading}
              disabled={loading}
              onPress={() => {
                handleValidateCode(code);
              }}
            />
          </View>

          <TouchableOpacity style={styles.resendCodeContainer} onPress={handleResendCode} disabled={time > 0}>
            <Text style={styles.timer}>
              {Math.floor(time / 60)}:{(time % 60).toString().padStart(2, '0')}
            </Text>
            <Text style={styles.resendCodeText}>resend confirmation code</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    </TouchableWithoutFeedback>
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
    marginBottom: 145,
  },
  EmailLogoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 44,
  },
  titleContainer: {
    marginBottom: 29,
    gap: 9,
  },
  title: {
    fontSize: 24,
    color: '#fff',
    fontFamily: 'Raleway-Bold',
    includeFontPadding: false,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#C5C5C5',
    fontFamily: 'Raleway-Medium',
    includeFontPadding: false,
    textAlign: 'center',
  },
  email: {
    color: '#666466',
  },
  otpContainer: {
    marginBottom: 68,
  },
  buttonContainer: {
    marginBottom: 20,
  },
  timer: {
    fontSize: 14,
    color: '#68FE00',
  },
  resendCodeText: {
    fontSize: 14,
    color: '#666466',
    fontFamily: 'Raleway-Medium',
    includeFontPadding: false,
  },
  resendCodeContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 3,
  },
});

export default OtpView;
