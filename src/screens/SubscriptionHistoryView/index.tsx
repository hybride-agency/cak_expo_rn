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
import {
  getSubscriptionHistory,
  SubscriptionHistoryItem,
} from '../../slice/SubscriptionHistorySlice';
import {useAppDispatch, useAppSelector} from '../../store';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {ProfileStackParamList} from '../../navigation/MainStack';

const ACCENT = '#68FE00';
const BACKGROUND = '#171717';
const SURFACE = '#222222';

const SubscriptionHistoryView = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const dispatch = useAppDispatch();
  const {history, loading, refreshing, error} = useAppSelector(
    state => state.subscriptionHistory,
  );

  const fetchHistory = useCallback(() => {
    dispatch(getSubscriptionHistory());
  }, [dispatch]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={fetchHistory}
              tintColor={ACCENT}
            />
          }>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                <Path d="M15 18L9 12L15 6" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Subscription history</Text>
            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.listContainer}>
            {loading ? (
              <ActivityIndicator color={ACCENT} style={styles.loader} />
            ) : error ? (
              <Text style={styles.emptyText}>{error}</Text>
            ) : history.length > 0 ? (
              history.map(item => <HistoryCard key={item.id} item={item} />)
            ) : (
              <Text style={styles.emptyText}>No subscription history yet.</Text>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const HistoryCard = ({item}: {item: SubscriptionHistoryItem}) => (
  <View style={styles.historyCard}>
    <View style={styles.cardLeft}>
      <Text style={styles.dateText}>
        {formatDateRange(item.start_date, item.end_date)}
      </Text>
      <Text style={styles.planText}>{formatPlanName(item.plan_name)}</Text>
    </View>
    <View style={styles.cardRight}>
      <Text style={styles.priceText}>{formatAmount(item)}</Text>
      <View style={[styles.statusBadge, item.is_active && styles.activeBadge]}>
        <Text style={[styles.statusText, item.is_active && styles.activeStatusText]}>
          {formatStatus(item.status)}
        </Text>
      </View>
    </View>
  </View>
);

const formatDateRange = (startDate?: string, endDate?: string) => {
  const start = formatDate(startDate);
  const end = formatDate(endDate);

  if (start && end) {
    return `${start} - ${end}`;
  }

  return start || end || '-';
};

const formatDate = (value?: string) => {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatPlanName = (value?: string) => {
  if (!value) {
    return 'Subscription plan';
  }

  return value
    .replace(/\+/g, ' + ')
    .replace(/[_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map(word => {
      if (word === '+') {
        return word;
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
};

const formatAmount = (item: SubscriptionHistoryItem) => {
  const amount = Number(item.amount_paid);
  const formattedAmount = Number.isNaN(amount)
    ? item.amount_paid
    : amount.toFixed(2);

  if (item.currency === 'USD') {
    return `-${formattedAmount}$`;
  }

  return `-${formattedAmount} ${item.currency}`;
};

const formatStatus = (status?: string) => {
  if (!status) {
    return 'Unknown';
  }

  return status.charAt(0).toUpperCase() + status.slice(1);
};

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: BACKGROUND},
  container: {flex: 1, backgroundColor: BACKGROUND},
  scrollContent: {paddingHorizontal: 20, paddingBottom: 150},
  header: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 20, marginBottom: 20},
  backButton: {width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-start'},
  headerTitle: {color: '#FFF', fontSize: 20, fontFamily: 'Raleway-Bold'},
  headerSpacer: {width: 24},
  
  listContainer: {gap: 16},
  historyCard: {backgroundColor: SURFACE, borderRadius: 16, paddingHorizontal: 20, paddingVertical: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  cardLeft: {flex: 1},
  dateText: {color: ACCENT, fontSize: 16, fontFamily: 'Raleway-Bold', marginBottom: 4},
  planText: {color: '#FFF', fontSize: 13, fontFamily: 'Raleway-Medium'},
  priceText: {color: ACCENT, fontSize: 18, fontFamily: 'Raleway-Bold'},
  cardRight: {alignItems: 'flex-end', marginLeft: 12},
  statusBadge: {marginTop: 8, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: '#343434'},
  activeBadge: {backgroundColor: ACCENT},
  statusText: {color: '#A7A7A7', fontSize: 11, fontFamily: 'Raleway-Bold'},
  activeStatusText: {color: BACKGROUND},
  loader: {marginTop: 40},
  emptyText: {color: '#A7A7A7', fontSize: 14, fontFamily: 'Raleway-Medium', textAlign: 'center', marginTop: 40},
});

export default SubscriptionHistoryView;
