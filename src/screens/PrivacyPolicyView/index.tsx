import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
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
              CAK Fitness respects your privacy. This policy explains what information we collect, why we use it, who processes it, and the choices available to you.
            </Text>
            <Text style={styles.effectiveDate}>Effective: August 11, 2026</Text>

            <SectionTitle>1. Information We Collect</SectionTitle>
            <BulletItem>Account and contact information, including your name, email address, phone number, profile photo, and sign-in provider identifiers.</BulletItem>
            <BulletItem>Fitness and nutrition information you provide, including goals, body profile answers, health concerns, workouts, meals, water intake, progress, and reviews.</BulletItem>
            <BulletItem>Membership and transaction records, such as the plan selected, amount, currency, payment status, and Whish transaction reference. CAK Fitness does not receive your Whish Wallet credentials.</BulletItem>
            <BulletItem>Device and service information needed for security and operation, such as device name, IP address, authentication sessions, push notification token, and diagnostic logs.</BulletItem>

            <SectionTitle>2. How We Use Your Information</SectionTitle>
            <BulletItem>To create and manage your account, gym membership, payments, and support requests.</BulletItem>
            <BulletItem>To personalize fitness and nutrition plans, track progress, and provide the features you request.</BulletItem>
            <BulletItem>To secure, troubleshoot, and improve the app and prevent fraud or misuse.</BulletItem>
            <BulletItem>To send service messages and optional notifications. You can disable push notifications in the app or device settings.</BulletItem>

            <SectionTitle>3. Service Providers and Sharing</SectionTitle>
            <BulletItem>We do not sell your personal information.</BulletItem>
            <BulletItem>We share only the information needed with providers that operate the service, including hosting, email, push notifications, Google or Apple sign-in, and Whish Money for payment processing.</BulletItem>
            <BulletItem>We may disclose information when required by law, to protect users, or as part of a business transfer subject to appropriate safeguards.</BulletItem>

            <SectionTitle>4. Storage, Security, and Retention</SectionTitle>
            <BulletItem>We use HTTPS in transit, access controls, and protected credential storage. No system can guarantee absolute security.</BulletItem>
            <BulletItem>We keep information while your account is active and as needed to provide the service. After deletion, limited records may be retained only when required for fraud prevention, disputes, accounting, or applicable law.</BulletItem>

            <SectionTitle>5. Your Choices and Account Deletion</SectionTitle>
            <BulletItem>You can review or update profile information in the app and manage notification permissions in the app or device settings.</BulletItem>
            <BulletItem>You can permanently delete your account from Profile → Delete Account. This removes associated personal, fitness, nutrition, progress, and membership data, subject to limited legally required retention.</BulletItem>
            <TouchableOpacity onPress={() => void Linking.openURL('https://cak.fit/delete-account')}>
              <Text style={styles.linkText}>Account deletion help: https://cak.fit/delete-account</Text>
            </TouchableOpacity>

            <SectionTitle>6. Children</SectionTitle>
            <Text style={styles.bodyText}>CAK Fitness is not directed to children under 13. If you believe a child provided personal information without appropriate consent, contact us so we can remove it.</Text>

            <SectionTitle>7. Changes and Contact</SectionTitle>
            <Text style={styles.bodyText}>
              We may update this policy and will post the revised effective date. For privacy questions or requests, contact CAK Fitness at support@cakfitness.com.
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
  effectiveDate: {color: '#888', fontSize: 12, fontFamily: 'Raleway-Medium', marginBottom: 8},
  sectionTitle: {color: '#FFF', fontSize: 15, fontFamily: 'Raleway-Bold', marginTop: 20, marginBottom: 10},
  bulletRow: {flexDirection: 'row', marginBottom: 6},
  bullet: {color: '#888', fontSize: 14, marginRight: 8, marginTop: 2},
  bulletText: {flex: 1, color: '#AAA', fontSize: 13, fontFamily: 'Raleway-Medium', lineHeight: 18},
  bodyText: {color: '#AAA', fontSize: 13, fontFamily: 'Raleway-Medium', lineHeight: 18},
  linkText: {color: '#68FE00', fontSize: 13, fontFamily: 'Raleway-Bold', lineHeight: 19, marginTop: 5, textDecorationLine: 'underline'},
});

export default PrivacyPolicyView;
