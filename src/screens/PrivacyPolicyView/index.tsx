import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Svg, {Path} from 'react-native-svg';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {ProfileStackParamList} from '../../navigation/MainStack';

const BACKGROUND = '#171717';
const SURFACE = '#222222';

const PrivacyPolicyView = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                <Path d="M15 18L9 12L15 6" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Privacy Policy</Text>
            <View style={{width: 24}} />
          </View>

          <View style={styles.contentCard}>
            <Text style={styles.intro}>
              At CAK Fitness, your privacy matters to us. This Privacy Policy explains how we collect, use, and protect your information when you use our app.
            </Text>

            <SectionTitle>1. Information We Collect</SectionTitle>
            <BulletItem>Personal details you provide (such as name, email, and fitness goals).</BulletItem>
            <BulletItem>Activity and progress data (workouts, meals, water intake, etc.).</BulletItem>
            <BulletItem>Technical information (device type, app usage data, and performance logs).</BulletItem>

            <SectionTitle>2. How We Use Your Information</SectionTitle>
            <BulletItem>To personalize your fitness program and nutrition recommendations.</BulletItem>
            <BulletItem>To track progress and provide insights.</BulletItem>
            <BulletItem>To improve app performance and user experience.</BulletItem>
            <BulletItem>To send you updates, reminders, and motivational notifications (with your consent).</BulletItem>

            <SectionTitle>3. Sharing & Security</SectionTitle>
            <BulletItem>We do not sell your data to third parties.</BulletItem>
            <BulletItem>Data may be shared only with trusted service providers who help operate the app.</BulletItem>
            <BulletItem>We use encryption and secure storage to protect your information.</BulletItem>

            <SectionTitle>4. Your Choices</SectionTitle>
            <BulletItem>You can access, edit, or delete your personal information at any time.</BulletItem>
            <BulletItem>You may disable notifications or revoke data access in your device settings.</BulletItem>

            <SectionTitle>5. Contact Us</SectionTitle>
            <Text style={styles.bodyText}>
              For questions or concerns about your privacy, please contact us at: support@cakfitness.com
            </Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const SectionTitle = ({children}: {children: string}) => (
  <Text style={styles.sectionTitle}>{children}</Text>
);

const BulletItem = ({children}: {children: string}) => (
  <View style={styles.bulletRow}>
    <Text style={styles.bullet}>•</Text>
    <Text style={styles.bulletText}>{children}</Text>
  </View>
);

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: BACKGROUND},
  container: {flex: 1, backgroundColor: BACKGROUND},
  scrollContent: {paddingHorizontal: 24, paddingTop: 20, paddingBottom: 150},
  header: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 30},
  backButton: {width: 40, height: 40, alignItems: 'center', justifyContent: 'center'},
  headerTitle: {color: '#FFF', fontSize: 24, fontFamily: 'Raleway-Black'},
  contentCard: {backgroundColor: SURFACE, borderRadius: 24, padding: 24},
  intro: {color: '#FFF', fontSize: 16, fontFamily: 'Raleway-Bold', lineHeight: 22, marginBottom: 24},
  sectionTitle: {color: '#FFF', fontSize: 15, fontFamily: 'Raleway-Bold', marginTop: 20, marginBottom: 10},
  bulletRow: {flexDirection: 'row', marginBottom: 6},
  bullet: {color: '#888', fontSize: 14, marginRight: 8, marginTop: 2},
  bulletText: {flex: 1, color: '#AAA', fontSize: 13, fontFamily: 'Raleway-Medium', lineHeight: 18},
  bodyText: {color: '#AAA', fontSize: 13, fontFamily: 'Raleway-Medium', lineHeight: 18},
});

export default PrivacyPolicyView;
