import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Arrow_Back_Logo_SVG from '../../../assets/SVG/Arrow_Back_Logo_SVG';
import { SCREEN_PADDING } from '../../../theme';
import { useNavigation, useRoute } from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import { PrimaryButtonCmp } from '../../components';
import type {QuestionStackParamList} from '../../navigation/QuestionStack';

const TdeeEstimationView = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<QuestionStackParamList>>();
  const {tdee} =
    useRoute<RouteProp<QuestionStackParamList, 'TdeeEstimation'>>().params;

  useEffect(() => {
    console.log('tdee', tdee);
  }, [tdee]);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                navigation.goBack();
              }}
            >
              <Arrow_Back_Logo_SVG />
            </TouchableOpacity>
          </View>

          <View style={styles.titleContainer}>
            <Text style={styles.title}>Your estimated TDEE is</Text>
            <Text style={styles.tdeeValue}>{tdee} kcal/day</Text>
            <View style={styles.descriptionContainer}>
              <Text style={styles.description}>
                We’ll use this number to design your custom nutrition and
                training plan.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <PrimaryButtonCmp
            text="Continue"
            onPress={() => {
              navigation.navigate('Generate');
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
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: SCREEN_PADDING.left,
    position: 'relative',
  },
  closeButton: {},
  iconContainer: {
    marginTop: 22,
  },
  titleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginBottom: 100,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Raleway-Bold',
    color: '#fff',
    includeFontPadding: false,
  },
  tdeeValue: {
    fontSize: 24,
    fontFamily: 'Raleway-Bold',
    color: '#68FE00',
    includeFontPadding: false,
  },
  descriptionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 38,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Raleway-Regular',
    color: '#fff',
    includeFontPadding: false,
    textAlign: 'center',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 53,
    left: 0,
    right: 0,
    paddingHorizontal: SCREEN_PADDING.left,
    alignItems: 'center',
  },
});

export default TdeeEstimationView;
