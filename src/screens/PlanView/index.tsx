import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  FlatList,
  ScrollView,
} from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { PlanRulesCmp, PrimaryButtonCmp, WhishPaymentOverlay } from '../../components';
import { useNavigation, useRoute } from '@react-navigation/native';
import {RootState, useAppDispatch} from '../../store';
import {useSelector} from 'react-redux';
import { SCREEN_PADDING } from '../../../theme';
import { getPlanPrice } from '../../slice/PlanSlice';
import { PlanPrice } from '../../../global';
import Small_Check_Logo_SVG from '../../../assets/SVG/Small_Check_Logo_SVG';
import Arrow_Back_Logo_SVG from '../../../assets/SVG/Arrow_Back_Logo_SVG';
import { useWhishCheckout } from '../../hooks/useWhishCheckout';

const PlanView = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useAppDispatch();
  const routeParams = route.params as
    | {planId?: number; mode?: 'purchase' | 'upgrade'}
    | undefined;
  const isUpgrade = routeParams?.mode === 'upgrade';

  const section = useSelector((state: RootState) => state.plan.section);
  const loading = useSelector((state: RootState) => state.plan.loading);
  const selectedPlanId = useSelector(
    (state: RootState) => state.plan.selectedPlanId,
  );
  const requestedPlanId = routeParams?.planId ?? selectedPlanId;
  const [planPrice, setPlanPrice] = useState<PlanPrice | null>(null);
  const [arrayFeatures, setArrayFeatures] = useState<string[]>([]);
  const [selectedPricingId, setSelectedPricingId] = useState<number | null>(null);

  const {
    status: checkoutStatus,
    error: checkoutError,
    startPurchase,
    reset: resetCheckout,
  } = useWhishCheckout();
  const purchaseLoading = checkoutStatus === 'opening' || checkoutStatus === 'polling';

  const fetchPlanPrice = useCallback(async () => {
    if (!requestedPlanId) {
      return;
    }

    const response = await dispatch(
      getPlanPrice({ id: requestedPlanId }),
    );
    if (getPlanPrice.fulfilled.match(response)) {
      setPlanPrice(response.payload.data);
      setSelectedPricingId(response.payload.data.pricings?.[0]?.id ?? null);
      const array = String(response.payload.data.features ?? '')
        .split(/\r?\n/)
        .map((feature: string) => feature.trim())
        .filter(Boolean);
      setArrayFeatures(array);
    }
  }, [dispatch, requestedPlanId]);

  useEffect(() => {
    fetchPlanPrice();
  }, [fetchPlanPrice]);

  const handlePurchase = async () => {
    const pricing = planPrice?.pricings.find(
      item => item.id === selectedPricingId,
    );

    if (!planPrice || !pricing || purchaseLoading) {
      return;
    }

    await startPurchase(planPrice.id, pricing.id);
  };

  const handleCheckoutDismiss = () => {
    const shouldReturnHome = isUpgrade && checkoutStatus === 'succeeded';
    resetCheckout();

    if (shouldReturnHome) {
      navigation.goBack();
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
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: planPrice?.image_url || section.image_url }}
              style={styles.image}
            />
          </View>

          <View style={styles.imageContainer}>
            <Image
              source={require('../../../assets/images/planOverlay.png')}
              style={styles.image}
            />
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
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

              <View style={styles.horizontalPadding}>
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

              <View style={styles.buttonPrimaryContainer}>
                <PrimaryButtonCmp
                  text={isUpgrade ? 'Upgrade Plan' : 'Buy Plan'}
                  loading={purchaseLoading}
                  disabled={purchaseLoading || !selectedPricingId}
                  onPress={handlePurchase}
                />
                <Text style={styles.paymentProviderText}>
                  Secure membership payment via Whish Money
                </Text>
              </View>
            </View>
          </ScrollView>
        </>
      )}

      <WhishPaymentOverlay
        status={checkoutStatus}
        errorMessage={checkoutError}
        onRetry={handlePurchase}
        onDismiss={handleCheckoutDismiss}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#171717',
  },
  scrollView: {
    flex: 1,
    zIndex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  content: {
    position: 'relative',
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
    paddingHorizontal: SCREEN_PADDING.left,
    alignItems: 'center',
    marginTop: 32,
  },
  paymentProviderText: {
    color: '#888',
    fontSize: 12,
    fontFamily: 'Raleway-Medium',
    marginTop: 10,
    textAlign: 'center',
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
  horizontalPadding: {
    paddingHorizontal: SCREEN_PADDING.left,
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
