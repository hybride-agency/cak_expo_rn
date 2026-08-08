import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PlanListView, PlanView, SuccessView } from '../screens';

export type PlanStackParamList = {
  PlanList: undefined;
  PlanView: undefined;
  SuccessView: undefined;
};

const Stack = createNativeStackNavigator<PlanStackParamList>();

const PlanNavigator = () => (
  <Stack.Navigator initialRouteName="PlanList">
    <Stack.Screen
      name="PlanList"
      component={PlanListView}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="PlanView"
      component={PlanView}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="SuccessView"
      component={SuccessView}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

export default PlanNavigator;
