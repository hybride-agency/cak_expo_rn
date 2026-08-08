import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { PlanRulesCmp, PrimaryButtonCmp } from '../../components';
import { useNavigation } from '@react-navigation/native';
import {RootState, useAppDispatch} from '../../store';
import {useSelector} from 'react-redux';
import { SCREEN_PADDING } from '../../../theme';
import { buyPlan, getPlanPrice } from '../../slice/PlanSlice';
import { setIsPlan, setIsQuestion, setIsWelcome } from '../../slice/WelcomeSlice';
import { PlanPrice } from '../../../global';
import Small_Check_Logo_SVG from '../../../assets/SVG/Small_Check_Logo_SVG';
import Arrow_Back_Logo_SVG from '../../../assets/SVG/Arrow_Back_Logo_SVG';
import { getProfile } from '../../slice/HomeSlice';
import { hydrateLoginSession } from '../../slice/LoginSlice';
import { setUser } from '../../slice/SignUpSlice';
import { saveAuthSession } from '../../utils/authSession';

const PlanView = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  const section = useSelector((state: RootState) => state.plan.section);
  const loading = useSelector((state: RootState) => state.plan.loading);
  const purchaseLoading = useSelector(
    (state: RootState) => state.plan.purchaseLoading,
  );
  const loginUser = useSelector((state: RootState) => state.login.user);
  const token = useSelector((state: RootState) => state.signUp.token);
  const selectedPlanId = useSelector(
    (state: RootState) => state.plan.selectedPlanId,
  );
  const [planPrice, setPlanPrice] = useState<PlanPrice | null>(null);
  const [arrayFeatures, setArrayFeatures] = useState<string[]>([]);
  const [selectedPricingId, setSelectedPricingId] = useState<number | null>(null);

  const fetchPlanPrice = useCallback(async () => {
    const response = await dispatch(
      getPlanPrice({ id: selectedPlanId as number }),
    );
    if (getPlanPrice.fulfilled.match(response)) {
      setPlanPrice(response.payload.data);
      setSelectedPricingId(response.payload.data.pricings?.[0]?.id ?? null);
      const array = response.payload.data.features.split('\r\n');
      setArrayFeatures(array);
      console.log('Dispatched all three actions', response.payload.data);
    }
  }, [dispatch, selectedPlanId]);

  useEffect(() => {
    fetchPlanPrice();
  }, [fetchPlanPrice]);

  const handleStartTrial = async () => {
    const pricing = planPrice?.pricings.find(
      item => item.id === selectedPricingId,
    );

    if (!planPrice || !pricing || purchaseLoading) {
      return;
    }

    const purchaseResponse = await dispatch(
      buyPlan({
        plan_id: planPrice.id,
        plan_pricing_id: pricing.id,
        amount_paid: pricing.price,
        currency: pricing.currency || 'USD',
      }),
    );

    if (buyPlan.fulfilled.match(purchaseResponse)) {
      const profileResponse = await dispatch(
        getProfile(),
      );
      const profileData =
        getProfile.fulfilled.match(profileResponse)
          ? profileResponse.payload?.data ?? profileResponse.payload
          : null;
      const nextLoginUser = {
        ...(loginUser || {}),
        data: {
          ...(loginUser?.data || {}),
          user: profileData?.user ?? loginUser?.data?.user,
          active_plan:
            profileData?.active_plan ??
            purchaseResponse.payload?.data?.active_plan ??
            purchaseResponse.payload?.data ??
            loginUser?.data?.active_plan,
        },
      };

      dispatch(
        hydrateLoginSession({
          isLoggedIn: true,
          user: nextLoginUser,
        }),
      );
      dispatch(
        setUser({
          token,
          action_plan: profileData?.active_plan?.alias ?? planPrice.alias,
        }),
      );
      await saveAuthSession({
        token,
        action_plan: profileData?.active_plan?.alias ?? planPrice.alias,
        loginUser: nextLoginUser,
        isLoggedIn: true,
        isWelcome: false,
        isQuestion: false,
        isPlan: false,
      });
      dispatch(setIsPlan(false));
      dispatch(setIsQuestion(false));
      dispatch(setIsWelcome(false));
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#68FE00" />
        </View>
      ) : (
        <>
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => navigation.goBack()}
              >
                <Arrow_Back_Logo_SVG />
              </TouchableOpacity>
            </View>

            <View style={styles.titleContainer}>
              <Text style={styles.title}>{planPrice?.name}</Text>
              <Text style={styles.description}>{planPrice?.description}</Text>
            </View>

            <View style={{ paddingHorizontal: SCREEN_PADDING.left }}>
              <View style={styles.featuresContainer}>
                {arrayFeatures.map((feature, index) => (
                  <View
                    key={feature + index}
                    style={styles.featureContainerItem}
                  >
                    <Small_Check_Logo_SVG />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.priceContainer}>
              <FlatList
                data={planPrice?.pricings}
                horizontal
                ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
                showsHorizontalScrollIndicator={false}
                ListHeaderComponent={() => (
                  <View
                    style={{
                      width: SCREEN_PADDING.left,
                    }}
                  />
                )}
                ListFooterComponent={() => (
                  <View
                    style={{
                      width: SCREEN_PADDING.left,
                    }}
                  />
                )}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => setSelectedPricingId(item.id)}
                    style={[
                      styles.priceItem,
                      selectedPricingId === item.id &&
                        styles.priceItemSelected,
                    ]}>
                    {item.type === 'monthly' ? (
                      <Text
                        style={[
                          styles.priceType,
                          {
                            paddingHorizontal: 17,
                            paddingTop: 17,
                            paddingBottom: 10
                          },
                        ]}
                      >
                        {item.title}
                      </Text>
                    ) : (
                      <View
                        style={[
                          styles.priceTypeContainer,
                          {
                            marginBottom: 10,
                            paddingVertical: 5,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.priceType,
                            {
                              color: '#171717',
                              fontSize: 19,
                            },
                          ]}
                        >
                          {item.title}
                        </Text>
                      </View>
                    )}
                    <Text style={styles.priceValue}>
                      {item.price}$
                      <Text style={styles.priceCurrency}>/{item.interval}</Text>
                    </Text>
                    <Text style={styles.priceDescription}>{item.description}</Text>
                  </TouchableOpacity>
                )}
                contentContainerStyle={{
                  width: '100%',
                  justifyContent: planPrice?.pricings?.length === 1 ? 'center' : 'flex-start',
                }}
              />
            </View>

            <View style={styles.rulesContainer}>
              <PlanRulesCmp rules={planPrice?.features || ''} />
            </View>
          </View>

          <View style={styles.imageContainer}>
            <Image source={{ uri: section.image_url }} style={styles.image} />
          </View>

          <View style={styles.imageContainer}>
            <Image
              source={require('../../../assets/images/planOverlay.png')}
              style={styles.image}
            />
          </View>

          <View style={styles.buttonPrimaryContainer}>
            <PrimaryButtonCmp
              text="Start 7-Day Free Trial"
              loading={purchaseLoading}
              disabled={purchaseLoading || !selectedPricingId}
              onPress={handleStartTrial}
            />
          </View>
        </>
      )}
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
    // paddingHorizontal: SCREEN_PADDING.left,
    position: 'relative',
    zIndex: 1,
  },
  closeButton: {},
  iconContainer: {
    marginTop: 86,
    marginBottom: 100,
    paddingHorizontal: SCREEN_PADDING.left,
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
    height: '42.5%',
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
  buttonPrimaryContainer: {
    position: 'absolute',
    bottom: 53,
    left: 0,
    right: 0,
    paddingHorizontal: SCREEN_PADDING.left,
    alignItems: 'center',
    zIndex: 1,
  },
  loadingContainer: {
    paddingTop: 67,
  },
  featuresContainer: {
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: 'rgba(0,0,0,0.51)',
    borderRadius: 15,
    paddingVertical: 11,
    paddingHorizontal: 50,
    width: '100%',
    marginBottom: 59,
  },
  featureContainerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: '100%',
  },
  featureText: {
    fontSize: 12,
    fontFamily: 'Raleway-Medium',
    includeFontPadding: false,
    color: '#FFFFFF',
  },
  priceContainer: {
    marginBottom: 25,
  },
  priceItem: {
    // paddingVertical: 17,
    // paddingHorizontal: 17,
    width: 150,
    borderWidth: 3,
    borderColor: '#68FE00',
    borderRadius: 15,
    zIndex: 1,
    overflow: 'hidden',
    minHeight: 141,
  },
  priceItemSelected: {
    backgroundColor: 'rgba(104,254,0,0.16)',
  },
  priceType: {
    fontSize: 23,
    fontFamily: 'Raleway-Black',
    color: '#FFFFFF',
    includeFontPadding: false,
  },
  priceValue: {
    fontSize: 25,
    fontFamily: 'Raleway-Black',
    color: '#FFFFFF',
    includeFontPadding: false,
    paddingHorizontal: 17,
  },
  priceCurrency: {
    fontSize: 13,
    fontFamily: 'Raleway-SemiBold',
    color: '#FFFFFF',
    includeFontPadding: false,
  },
  rulesContainer: {
    paddingHorizontal: SCREEN_PADDING.left,
  },
  priceTypeContainer: {
    backgroundColor: '#68FE00',
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceDescription: {
    paddingHorizontal: 17,
    fontSize: 12,
    fontFamily: 'Raleway-Light',
    color: '#FFF',
    includeFontPadding: false,
    marginTop: 8
  }
});

export default PlanView;
