import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  ForgotPasswordView,
  LoginView,
  WelcomeView,
  OtpView,
  NewPasswordView,
  SignUpView,
} from '../screens';

export type AuthStackParamList = {
  Login: undefined;
  Welcome: undefined;
  ForgotPassword: undefined;
  OtpView: { email: string };
  NewPasswordView: { email: string, code: string };
  SignUpView: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator = () => (
  <Stack.Navigator initialRouteName="Welcome">
    <Stack.Screen
      name="Welcome"
      component={WelcomeView}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="Login"
      component={LoginView}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="ForgotPassword"
      component={ForgotPasswordView}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="OtpView"
      component={OtpView}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="NewPasswordView"
      component={NewPasswordView}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="SignUpView"
      component={SignUpView}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

export default AuthNavigator;
