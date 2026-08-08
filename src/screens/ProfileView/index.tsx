import React, {useEffect, useState} from 'react';
import {Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, Switch} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {logout} from '../../slice/LoginSlice';
import {clearUser} from '../../slice/SignUpSlice';
import {getProfile} from '../../slice/HomeSlice';
import {setIsPlan, setIsQuestion, setIsWelcome} from '../../slice/WelcomeSlice';
import {useAppDispatch, useAppSelector} from '../../store';
import {clearAuthSession} from '../../utils/authSession';
import {useNavigation} from '@react-navigation/native';
import Svg, {Path, Circle, Rect} from 'react-native-svg';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import * as SecureStore from 'expo-secure-store';

import type {ProfileStackParamList} from '../../navigation/MainStack';

const FALLBACK_AVATAR = require('../../../assets/images/male.png');
const ACCENT = '#68FE00';
const NOTIFICATION_PREFERENCE_KEY = 'popup_notifications_enabled';

const ProfileView = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const dispatch = useAppDispatch();
  const {profile, homepage} = useAppSelector(state => state.home);
  const loginUser = useAppSelector(state => state.login.user);
  const user = profile?.user || loginUser?.data?.user || {};
  const subscription =
    profile?.current_subscription ||
    profile?.subscription ||
    homepage?.subscription ||
    {};
  const planName =
    homepage?.plan_info?.display_name ||
    homepage?.plan_info?.name ||
    profile?.active_plan?.display_name ||
    profile?.active_plan?.name ||
    subscription?.plan?.display_name ||
    subscription?.plan?.name ||
    'No active plan';
  const expiryDate = formatDate(
    subscription?.end_date ||
      subscription?.expires_at ||
      profile?.active_plan?.end_date ||
      homepage?.plan_info?.end_date,
  );
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    dispatch(getProfile());
  }, [dispatch]);

  useEffect(() => {
    void SecureStore.getItemAsync(NOTIFICATION_PREFERENCE_KEY).then(value => {
      if (value !== null) {
        setNotificationsEnabled(value === 'true');
      }
    });
  }, []);

  const handleNotificationsChange = (enabled: boolean) => {
    setNotificationsEnabled(enabled);
    void SecureStore.setItemAsync(
      NOTIFICATION_PREFERENCE_KEY,
      String(enabled),
    );
  };

  const handleLogout = async () => {
    await clearAuthSession();
    dispatch(logout());
    dispatch(clearUser());
    dispatch(setIsQuestion(false));
    dispatch(setIsPlan(false));
    dispatch(setIsWelcome(true));
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
              <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                <Path d="M15 18L9 12L15 6" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('NotificationsView')} style={styles.iconButton}>
              <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                <Path d="M18 8A6 6 0 0 0 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <Path d="M13.73 21A2 2 0 0 1 10.27 21" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </TouchableOpacity>
          </View>

          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <Image source={user?.image_url ? {uri: user.image_url} : FALLBACK_AVATAR} style={styles.avatar} />
              <View style={styles.editBadge}>
                <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                  <Path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </View>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.name}>
                {user?.name || user?.email || 'CAK member'}
              </Text>
              <Text style={styles.planNameText}>{planName}</Text>
              {expiryDate ? (
                <Text style={styles.expiryText}>Until {expiryDate}</Text>
              ) : null}
            </View>
          </View>

          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.cardSection}>
            <MenuItem label="Personal Data" icon={<PersonalDataIcon />} onPress={() => navigation.navigate('PersonalDataView')} />
            <MenuItem label="Membership information" icon={<MembershipIcon />} onPress={() => navigation.navigate('MembershipView')} />
            <MenuItem label="Subscription history" icon={<HistoryIcon />} onPress={() => navigation.navigate('SubscriptionHistoryView')} noBorder />
          </View>

          <Text style={styles.sectionTitle}>Notification</Text>
          <View style={styles.cardSection}>
            <View style={styles.menuItemNoBorder}>
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIconWrap}><BellIcon /></View>
                <Text style={styles.menuLabel}>Pop-up Notification</Text>
              </View>
              <Switch 
                value={notificationsEnabled} 
                onValueChange={handleNotificationsChange}
                trackColor={{ false: '#333', true: ACCENT }}
                thumbColor={'#FFF'}
              />
            </View>
          </View>

          <Text style={styles.sectionTitle}>Other</Text>
          <View style={styles.cardSection}>
            <MenuItem label="Contact Us" icon={<ContactIcon />} onPress={() => navigation.navigate('ContactUsView')} />
            <MenuItem label="Privacy Policy" icon={<PrivacyIcon />} onPress={() => navigation.navigate('PrivacyPolicyView')} />
            <MenuItem label="About Us" icon={<AboutIcon />} onPress={() => navigation.navigate('AboutUsView')} noBorder />
          </View>

          <TouchableOpacity activeOpacity={0.9} style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const MenuItem = ({
  label,
  icon,
  onPress,
  noBorder,
}: {
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
  noBorder?: boolean;
}) => (
  <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={[styles.menuItem, noBorder && styles.menuItemNoBorder]}>
    <View style={styles.menuItemLeft}>
      <View style={styles.menuIconWrap}>{icon}</View>
      <Text style={styles.menuLabel}>{label}</Text>
    </View>
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M9 18L15 12L9 6" stroke="#555" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  </TouchableOpacity>
);

const PersonalDataIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="7" r="4" stroke={ACCENT} strokeWidth="1.5" />
    <Path d="M4 21v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round" />
  </Svg>
);
const MembershipIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="6" width="18" height="12" rx="2" stroke={ACCENT} strokeWidth="1.5" />
    <Circle cx="8.5" cy="12" r="1.5" stroke={ACCENT} strokeWidth="1.5" />
    <Path d="M13 11h4M13 14h2" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round" />
  </Svg>
);
const HistoryIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Rect x="4" y="4" width="16" height="16" rx="2" stroke={ACCENT} strokeWidth="1.5" />
    <Path d="M8 10h8M8 14h8M8 18h4" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round" />
  </Svg>
);
const BellIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M18 8A6 6 0 0 0 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M13.73 21A2 2 0 0 1 10.27 21" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const ContactIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M22 6L12 13L2 6" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const PrivacyIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M9 12l2 2 4-4" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const AboutIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round" />
    <Circle cx="9" cy="7" r="4" stroke={ACCENT} strokeWidth="1.5" />
    <Path d="M22 21v-2a4 4 0 0 0-3-3.87" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round" />
    <Path d="M16 3.13a4 4 0 0 1 0 7.75" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round" />
  </Svg>
);

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#171717'},
  container: {flex: 1, backgroundColor: '#171717'},
  content: {paddingHorizontal: 24, paddingBottom: 150},
  header: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 20},
  iconButton: {width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-start'},
  
  profileCard: {backgroundColor: '#1E1E1E', borderRadius: 24, padding: 20, flexDirection: 'row', alignItems: 'center', marginBottom: 24},
  avatarContainer: {position: 'relative', marginRight: 20},
  avatar: {width: 80, height: 80, borderRadius: 40, backgroundColor: '#3A3A3A'},
  editBadge: {position: 'absolute', right: 0, bottom: 0, width: 24, height: 24, borderRadius: 12, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#1E1E1E'},
  profileInfo: {flex: 1},
  name: {color: '#FFF', fontSize: 24, fontFamily: 'Raleway-Black', marginBottom: 4},
  planNameText: {color: '#888', fontSize: 13, fontFamily: 'Raleway-Medium', marginBottom: 4},
  expiryText: {color: ACCENT, fontSize: 13, fontFamily: 'Raleway-Bold'},

  sectionTitle: {color: '#FFF', fontSize: 18, fontFamily: 'Raleway-Bold', marginBottom: 12, marginTop: 8},
  cardSection: {backgroundColor: '#1E1E1E', borderRadius: 20, paddingHorizontal: 20, marginBottom: 24},
  menuItem: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#2C2C2C'},
  menuItemNoBorder: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 18},
  menuItemLeft: {flexDirection: 'row', alignItems: 'center'},
  menuIconWrap: {width: 24, alignItems: 'center', justifyContent: 'center', marginRight: 16},
  menuLabel: {color: '#FFF', fontSize: 13, fontFamily: 'Raleway-Medium'},

  logoutButton: {backgroundColor: '#1E1E1E', borderRadius: 20, paddingVertical: 18, alignItems: 'center', marginTop: 10},
  logoutText: {color: '#FF4444', fontSize: 16, fontFamily: 'Raleway-Bold'},
});

export default ProfileView;

const formatDate = (value: unknown) => {
  if (typeof value !== 'string' || !value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('en', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(date);
};
