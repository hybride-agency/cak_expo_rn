import React, {useCallback, useEffect} from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Svg, {Path} from 'react-native-svg';
import {getPayments} from '../../slice/PaymentSlice';
import {useAppDispatch, useAppSelector} from '../../store';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {ProfileStackParamList} from '../../navigation/MainStack';
import type {WhishPayment, WhishPaymentStatus} from '../../types/payments';

const ACCENT = '#68FE00';
const DANGER = '#FF6B6B';
const BACKGROUND = '#171717';
const SURFACE = '#222222';

const STATUS_COLORS: Partial<Record<WhishPaymentStatus, string>> = {
  succeeded: ACCENT,
  failed: DANGER,
  refunded: DANGER,
};

const PaymentHistoryView = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const dispatch = useAppDispatch();
  const {payments, paymentsLoading, paymentsError} = useAppSelector(
    state => state.payment,
  );

  const fetchPayments = useCallback(() => {
    dispatch(getPayments({}));
  }, [dispatch]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={fetchPayments} tintColor={ACCENT} />
          }>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                <Path d="M15 18L9 12L15 6" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Payment history</Text>
            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.listContainer}>
            {paymentsLoading ? (
              <ActivityIndicator color={ACCENT} style={styles.loader} />
            ) : paymentsError ? (
              <Text style={styles.emptyText}>{paymentsError}</Text>
            ) : payments.length > 0 ? (
              payments.map(item => <PaymentCard key={item.id} item={item} />)
            ) : (
              <Text style={styles.emptyText}>No payment attempts yet.</Text>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const PaymentCard = ({item}: {item: WhishPayment}) => (
  <View style={styles.paymentCard}>
    <View style={styles.cardLeft}>
      <Text style={styles.dateText}>{formatDate(item.created_at)}</Text>
      <Text style={styles.planText}>
        {formatPlanName(item.plan_name)} · {formatPurpose(item.purpose)}
      </Text>
      {item.status === 'failed' && item.failure_message ? (
        <Text style={styles.failureText}>{item.failure_message}</Text>
      ) : null}
    </View>
    <View style={styles.cardRight}>
      <Text style={styles.priceText}>{formatAmount(item)}</Text>
      <View style={styles.statusBadge}>
        <Text
          style={[
            styles.statusText,
            STATUS_COLORS[item.status] ? {color: STATUS_COLORS[item.status]} : null,
          ]}>
          {formatStatus(item.status)}
        </Text>
      </View>
    </View>
  </View>
);

const formatDate = (value?: string | null) => {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatPlanName = (value?: string | null) => {
  if (!value) {
    return 'Subscription plan';
  }

  return value
    .replace(/\+/g, ' + ')
    .replace(/[_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map(word => (word === '+' ? word : word.charAt(0).toUpperCase() + word.slice(1)))
    .join(' ');
};

const formatPurpose = (purpose: string) =>
  purpose === 'renewal' ? 'Renewal' : purpose === 'purchase' ? 'Purchase' : purpose;

const formatAmount = (item: WhishPayment) => {
  const amount = Number(item.amount);
  const formattedAmount = Number.isNaN(amount) ? item.amount : amount.toFixed(2);

  if (item.currency === 'USD') {
    return `${formattedAmount}$`;
  }

  return `${formattedAmount} ${item.currency}`;
};

const formatStatus = (status: WhishPaymentStatus) =>
  status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: BACKGROUND},
  container: {flex: 1, backgroundColor: BACKGROUND},
  scrollContent: {paddingHorizontal: 20, paddingBottom: 150},
  header: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 20, marginBottom: 20},
  backButton: {width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-start'},
  headerTitle: {color: '#FFF', fontSize: 20, fontFamily: 'Raleway-Bold'},
  headerSpacer: {width: 24},
  listContainer: {gap: 16},
  paymentCard: {backgroundColor: SURFACE, borderRadius: 16, paddingHorizontal: 20, paddingVertical: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  cardLeft: {flex: 1, marginRight: 12},
  dateText: {color: ACCENT, fontSize: 16, fontFamily: 'Raleway-Bold', marginBottom: 4},
  planText: {color: '#FFF', fontSize: 13, fontFamily: 'Raleway-Medium'},
  failureText: {color: DANGER, fontSize: 12, fontFamily: 'Raleway-Medium', marginTop: 4},
  priceText: {color: ACCENT, fontSize: 18, fontFamily: 'Raleway-Bold'},
  cardRight: {alignItems: 'flex-end'},
  statusBadge: {marginTop: 8, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: '#343434'},
  statusText: {color: '#A7A7A7', fontSize: 11, fontFamily: 'Raleway-Bold'},
  loader: {marginTop: 40},
  emptyText: {color: '#A7A7A7', fontSize: 14, fontFamily: 'Raleway-Medium', textAlign: 'center', marginTop: 40},
});

export default PaymentHistoryView;
