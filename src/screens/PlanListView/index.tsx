import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';
import React, { useEffect } from 'react';
import {useSelector} from 'react-redux';
import {RootState, useAppDispatch} from '../../store';
import { getPlan, setSelectedPlan } from '../../slice/PlanSlice';
import Close_Logo_SVG from '../../../assets/SVG/Close_Logo_SVG';
import { SCREEN_PADDING } from '../../../theme';
import RadioButtonCmp from '../../components/RadioButtonCmp';
import { PlanRulesCmp, PrimaryButtonCmp } from '../../components';
import { useNavigation } from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import { setIsPlan, setIsQuestion, setIsWelcome } from '../../slice/WelcomeSlice';
import type {PlanStackParamList} from '../../navigation/PlanStack';

const PlanListView = () => {
  const dispatch = useAppDispatch();
  const plans = useSelector((state: RootState) => state.plan.plans);
  const section = useSelector((state: RootState) => state.plan.section);
  const selectedPlanId = useSelector(
    (state: RootState) => state.plan.selectedPlanId,
  );

  const navigation =
    useNavigation<NativeStackNavigationProp<PlanStackParamList>>();
  const hasSectionImage = Boolean(section?.image_url);

  useEffect(() => {
    if (!plans.length) {
      dispatch(getPlan());
    }
  }, [dispatch, plans.length]);

  const handlePlanSelection = (planId: number) => {
    dispatch(setSelectedPlan(planId));
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => {
                dispatch(setIsPlan(false));
                dispatch(setIsQuestion(false));
                dispatch(setIsWelcome(true));
            }}
          >
            <Close_Logo_SVG />
          </TouchableOpacity>
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.title}>{section?.title || 'Choose Your Plan'}</Text>
          <Text style={styles.description}>
            {section?.description || 'Enjoy a 7-day free trial. Cancel anytime.'}
          </Text>
        </View>

        <View style={styles.planContainer}>
          <FlatList
            data={plans}
            renderItem={({ item }) => (
              <RadioButtonCmp
                item={item}
                title={item.name}
                isFollowUp={true}
                onPress={() => handlePlanSelection(item.id)}
                isSelected={selectedPlanId === item.id}
              />
            )}
            keyExtractor={item => item.id.toString()}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>

        <View style={styles.rulesContainer}>
          <PlanRulesCmp rules={section?.content} />
        </View>
      </View>

      {hasSectionImage ? (
        <View style={styles.imageContainer}>
          <Image source={{ uri: section.image_url }} style={styles.image} />
        </View>
      ) : null}

      <View style={styles.imageContainer}>
        <Image
          source={require('../../../assets/images/planOverlay.png')}
          style={styles.image}
        />
      </View>

      <View style={styles.buttonPrimaryContainer}>
        <PrimaryButtonCmp
          text="Continue"
          onPress={() => {
            navigation.navigate('PlanView');
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#171717',
  },
  content: {
    flex: 1,
    paddingHorizontal: SCREEN_PADDING.left,
    position: 'relative',
    zIndex: 1,
  },
  closeButton: {},
  iconContainer: {
    marginTop: 86,
    marginBottom: 100,
  },
  imageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  image: {
    width: '100%',
    height: '50%',
  },
  titleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 29,
    fontFamily: 'Raleway-Black',
    color: '#68FE00',
    textAlign: 'center',
    includeFontPadding: false,
  },
  description: {
    fontSize: 12,
    color: '#C5C5C5',
    fontFamily: 'Raleway-Medium',
    textAlign: 'center',
    includeFontPadding: false,
  },
  planContainer: {},
  separator: {
    height: 15,
  },
  buttonPrimaryContainer: {
    position: 'absolute',
    bottom: 53,
    left: 0,
    right: 0,
    paddingHorizontal: SCREEN_PADDING.left,
    alignItems: 'center',
    zIndex: 1
  },
  rulesContainer: {
    marginTop: 30,
  },
});

export default PlanListView;
