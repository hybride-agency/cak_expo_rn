import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {TutorialView} from '../screens';

export type TutorialStackParamList = {
  Tutorial: undefined;
};

const Stack = createNativeStackNavigator<TutorialStackParamList>();

const TutorialNavigator = () => (
  <Stack.Navigator initialRouteName="Tutorial">
      <Stack.Screen
      name="Tutorial"
      component={TutorialView}
      options={{headerShown: false}}
    />
  </Stack.Navigator>
);

export default TutorialNavigator;
