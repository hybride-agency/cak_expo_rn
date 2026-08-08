import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SCREEN_PADDING } from '../../../theme';
import Arrow_Back_Logo_SVG from '../../../assets/SVG/Arrow_Back_Logo_SVG';
import { CustomTextInput, PrimaryButtonCmp } from '../../components';
import { useNavigation, useRoute } from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import axiosInstance from '../../axiosConfig';
import Eye_Open_SVG from '../../../assets/SVG/Eye_Open_SVG';
import Eye_Closed_SVG from '../../../assets/SVG/Eye_Closed_SVG';
import type {AuthStackParamList} from '../../navigation/AuthenticationStack';

const NewPasswordView = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList>>();

  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState<boolean>(false);

  const { email, code } = useRoute().params as { email: string; code: string };

  const handleNewPassword = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.post('/auth/reset-password', {
        email,
        otp: code,
        password,
        password_confirmation: confirmPassword,
      });

      if (response.status === 200) {
        navigation.navigate('Login');
      }

      setLoading(false);
    } catch (error) {
      console.error('New password error:', error);
      setLoading(false);
    }
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
          <Text style={styles.title}>New Password</Text>
          <Text style={styles.description}>
            Please write your new password.
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.inputItemContainer}>
            <Text style={styles.label}>Password</Text>
            <CustomTextInput
              placeholder="Password"
              value={password}
              icon={isPasswordVisible ? <Eye_Open_SVG /> : <Eye_Closed_SVG />}
              onIconPress={() => setIsPasswordVisible(!isPasswordVisible)}
              onChangeText={setPassword}
              secureTextEntry={!isPasswordVisible}
            />
          </View>

          <View style={styles.inputItemContainer}>
            <Text style={styles.label}>Confirm Password</Text>
            <CustomTextInput
              placeholder="Confirm Password"
              value={confirmPassword}
              icon={isConfirmPasswordVisible ? <Eye_Open_SVG /> : <Eye_Closed_SVG />}
              onIconPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
              onChangeText={setConfirmPassword}
              secureTextEntry={!isConfirmPasswordVisible}
            />
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <PrimaryButtonCmp
            text="Confirm Password"
            loading={loading}
            disabled={loading}
            onPress={handleNewPassword}
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
    marginBottom: 96,
  },
  titleContainer: {
    marginBottom: 48,
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
  inputItemContainer: {
    gap: 13,
  },
  label: {
    color: '#C5C5C5',
    fontSize: 16,
    fontFamily: 'Raleway-Light',
  },
  inputContainer: {
    gap: 22,
    marginBottom: 44,
  },
  buttonContainer: {},
});

export default NewPasswordView;
