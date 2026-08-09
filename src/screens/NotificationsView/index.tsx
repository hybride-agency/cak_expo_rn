import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Svg, {Path, Circle} from 'react-native-svg';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import axiosInstance from '../../axiosConfig';

import type {ProfileStackParamList} from '../../navigation/MainStack';

const BACKGROUND = '#171717';
const ACCENT = '#68FE00';

interface NotificationItem {
  id: string;
  data: {
    title?: string;
    message?: string;
    body?: string;
    type?: string;
  };
  created_at: string;
  read_at: string | null;
}

type Props = NativeStackScreenProps<ProfileStackParamList, 'NotificationsView'>;

const NotificationsView = ({navigation}: Props) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      const response = await axiosInstance.get('/auth/notifications');
      if (response.data?.success) {
        setNotifications(response.data.data.notifications || []);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void fetchNotifications();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    void fetchNotifications();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('en', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={ACCENT}
              colors={[ACCENT]}
            />
          }
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                <Path d="M15 18L9 12L15 6" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Notifications</Text>
            <View style={{width: 24}} />
          </View>

          {loading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator color={ACCENT} size="large" />
            </View>
          ) : notifications.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No notifications yet</Text>
              <Text style={styles.emptyDescription}>
                Your reminders and account updates will appear here.
              </Text>
            </View>
          ) : (
            <View style={styles.listContainer}>
              {notifications.map((item) => (
                <View key={item.id} style={[styles.notificationCard, !item.read_at && styles.unreadCard]}>
                  <View style={styles.notificationHeader}>
                    <Text style={styles.notificationTitle}>{item.data.title || 'Notification'}</Text>
                    {!item.read_at && <View style={styles.unreadDot} />}
                  </View>
                  <Text style={styles.notificationBody}>{item.data.message || item.data.body || ''}</Text>
                  <Text style={styles.notificationTime}>{formatDate(item.created_at)}</Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: BACKGROUND},
  container: {flex: 1, backgroundColor: BACKGROUND},
  scrollContent: {paddingHorizontal: 24, paddingTop: 20, paddingBottom: 150},
  header: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40},
  backButton: {width: 40, height: 40, alignItems: 'center', justifyContent: 'center'},
  headerTitle: {color: '#FFF', fontSize: 24, fontFamily: 'Raleway-Black'},
  centerContainer: {alignItems: 'center', justifyContent: 'center', paddingTop: 80},
  emptyState: {alignItems: 'center', paddingHorizontal: 24, paddingTop: 80},
  emptyTitle: {color: '#FFF', fontSize: 20, fontFamily: 'Raleway-Bold'},
  emptyDescription: {
    color: '#888',
    fontSize: 14,
    fontFamily: 'Raleway-Medium',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 20,
  },
  listContainer: {gap: 16},
  notificationCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  unreadCard: {
    borderLeftColor: ACCENT,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  notificationTitle: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Raleway-Bold',
    flex: 1,
    paddingRight: 10,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: ACCENT,
  },
  notificationBody: {
    color: '#CCC',
    fontSize: 14,
    fontFamily: 'Raleway-Medium',
    lineHeight: 20,
    marginBottom: 12,
  },
  notificationTime: {
    color: '#777',
    fontSize: 12,
    fontFamily: 'Raleway-Medium',
  },
});

export default NotificationsView;
