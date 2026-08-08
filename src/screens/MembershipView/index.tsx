import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Svg, {Path} from 'react-native-svg';
import {useAppSelector} from '../../store';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import type {ProfileStackParamList} from '../../navigation/MainStack';

const ACCENT = '#8FFF19';
const BACKGROUND = '#171717';
const {width} = Dimensions.get('window');

type Props = NativeStackScreenProps<ProfileStackParamList, 'MembershipView'>;

const MembershipView = ({navigation}: Props) => {
  const {homepage, profile} = useAppSelector(state => state.home);
  const subscription =
    profile?.current_subscription ||
    profile?.subscription ||
    homepage?.subscription ||
    {};
  const planInfo =
    homepage?.plan_info ||
    profile?.active_plan?.plan ||
    profile?.active_plan ||
    subscription?.plan ||
    {};
  const pricing =
    subscription?.pricing ||
    subscription?.plan_pricing ||
    planInfo?.pricing ||
    planInfo?.pricings?.[0] ||
    {};
  const planName = planInfo.display_name || planInfo.name || 'No active plan';
  const price = formatPrice(pricing?.price ?? subscription?.amount_paid);
  const priceInterval = pricing?.interval ? `/${pricing.interval}` : '';
  const expiryDate = formatDate(
    subscription?.end_date ||
      subscription?.expires_at ||
      profile?.active_plan?.end_date ||
      planInfo?.end_date,
  );
  const features = parseFeatures(planInfo?.features);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                <Path d="M15 18L9 12L15 6" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Membership information</Text>
            <View style={{width: 24}} />
          </View>

          <View style={styles.heroWrapper}>
            <Image 
              source={{uri: 'https://d1t9z5ilqoa9lf.cloudfront.net/pages/membership-info.png'}}
              style={styles.heroImage}
              resizeMode="contain"
            />
            <View style={styles.heroOverlay} />

            <View style={styles.heroContent}>
              <View style={styles.priceBadge}>
                <Text style={styles.priceText}>
                  {price}
                  <Text style={styles.pricePeriod}>{priceInterval}</Text>
                </Text>
              </View>

              <Text style={styles.planName}>{planName}</Text>

              {features.length > 0 ? (
                <View style={styles.featuresList}>
                  {features.map(feature => (
                    <FeatureItem key={feature}>{feature}</FeatureItem>
                  ))}
                </View>
              ) : null}
            </View>
          </View>

          <View style={styles.footerInfo}>
            <Text style={styles.footerTitle}>Your current plan</Text>
            {expiryDate ? (
              <Text style={styles.expiryNote}>
                Your subscription will expire on{' '}
                <Text style={styles.boldText}>{expiryDate}</Text>
              </Text>
            ) : null}
            <Text style={styles.renewNote}>
              View your subscription history{' '}
              <Text
                style={styles.linkText}
                onPress={() => navigation.navigate('SubscriptionHistoryView')}>
                here
              </Text>
            </Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const FeatureItem = ({children}: {children: string}) => (
  <View style={styles.featureRow}>
    <View style={styles.checkIcon}>
      <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
        <Path d="M20 6L9 17L4 12" stroke={ACCENT} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    </View>
    <Text style={styles.featureText}>{children}</Text>
  </View>
);

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: BACKGROUND},
  container: {flex: 1, backgroundColor: BACKGROUND},
  heroWrapper: {position: 'relative'},
  heroImage: {
    position: 'absolute',
    top: -20,
    left: 0,
    width: width,
    height: 500,
  },
  heroOverlay: {
    position: 'absolute',
    top: -20,
    left: 0,
    width: width,
    height: 500,
    backgroundColor: 'rgba(23,23,23,0.3)',
  },
  scrollContent: {paddingBottom: 150},
  header: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 20, marginBottom: 20, zIndex: 10},
  backButton: {width: 40, height: 40, alignItems: 'center', justifyContent: 'center'},
  headerTitle: {color: '#FFF', fontSize: 20, fontFamily: 'Raleway-Black'},
  heroContent: {alignItems: 'center', paddingTop: 60, paddingBottom: 40},
  priceBadge: {
    borderWidth: 2,
    borderColor: ACCENT,
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 14,
    marginBottom: 40,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  priceText: {color: ACCENT, fontSize: 36, fontFamily: 'Raleway-Black'},
  pricePeriod: {color: '#FFF', fontSize: 16, fontFamily: 'Raleway-Medium'},
  planName: {color: ACCENT, fontSize: 28, fontFamily: 'Raleway-Black', textAlign: 'center', marginBottom: 40, paddingHorizontal: 20},
  featuresList: {width: '100%', paddingHorizontal: 40},
  featureRow: {flexDirection: 'row', alignItems: 'center', marginBottom: 16},
  checkIcon: {marginRight: 12},
  featureText: {color: '#FFF', fontSize: 14, fontFamily: 'Raleway-Medium', flex: 1},
  footerInfo: {alignItems: 'center', marginTop: 60, paddingHorizontal: 40},
  footerTitle: {color: '#FFF', fontSize: 18, fontFamily: 'Raleway-Black', marginBottom: 20},
  expiryNote: {color: '#BBB', fontSize: 14, fontFamily: 'Raleway-Medium', textAlign: 'center', marginBottom: 8},
  boldText: {color: '#FFF', fontFamily: 'Raleway-Bold'},
  renewNote: {color: '#BBB', fontSize: 14, fontFamily: 'Raleway-Medium', textAlign: 'center'},
  linkText: {color: '#FFF', textDecorationLine: 'underline', fontFamily: 'Raleway-Bold'},
});

export default MembershipView;

const parseFeatures = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string');
  }

  return typeof value === 'string'
    ? value
        .split(/\r?\n/)
        .map(item => item.trim())
        .filter(Boolean)
    : [];
};

const formatPrice = (value: unknown) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? `$${amount}` : '—';
};

const formatDate = (value: unknown) => {
  if (typeof value !== 'string' || !value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('en', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(date);
};
