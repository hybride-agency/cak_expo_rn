import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GenerateView, QuestionListView, TdeeEstimationView } from '../screens';

export type QuestionStackParamList = {
  Question: undefined;
  TdeeEstimation: {tdee: string | number};
  Generate: undefined;
};

const Stack = createNativeStackNavigator<QuestionStackParamList>();

const QuestionNavigator = () => (
  <Stack.Navigator initialRouteName="Question">
    <Stack.Screen
      name="Question"
      component={QuestionListView}
      options={{ headerShown: false }}
    />
      <Stack.Screen
        name="TdeeEstimation"
        component={TdeeEstimationView}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Generate"
        component={GenerateView}
        options={{ headerShown: false }}
      />
  </Stack.Navigator>
);

export default QuestionNavigator;
