import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Svg, {Path} from 'react-native-svg';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import type {ProfileStackParamList} from '../../navigation/MainStack';

const ACCENT = '#8FFF19';
const BACKGROUND = '#171717';
const SURFACE = '#222222';

type Props = NativeStackScreenProps<ProfileStackParamList, 'ContactUsView'>;

const openContactUrl = async (url: string) => {
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert('Unable to open contact option', 'Please try again later.');
  }
};

const ContactUsView = ({navigation}: Props) => {
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
            <Text style={styles.headerTitle}>Contact us</Text>
            <View style={{width: 24}} />
          </View>

          <Text style={styles.description}>
            Don't hesitate to contact us wether you have a suggestion on our improvement, a complain to discuss or an issue to solve.
          </Text>

          <ContactItem 
            icon={<CallIcon />} 
            label="Call us" 
            onPress={() => void openContactUrl('tel:+9619830316')}
          />
          <ContactItem 
            icon={<EmailIcon />} 
            label="E-mail us" 
            onPress={() =>
              void openContactUrl('mailto:support@cakfitness.com')
            }
          />
          <ContactItem 
            icon={<WhatsAppIcon />} 
            label="WhatsApp us" 
            onPress={() => void openContactUrl('https://wa.me/9619830316')}
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const ContactItem = ({
  icon,
  label,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}) => (
  <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={styles.itemCard}>
    <View style={styles.itemLeft}>
      {icon}
      <Text style={styles.itemLabel}>{label}</Text>
    </View>
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M9 18L15 12L9 6" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  </TouchableOpacity>
);

const CallIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M22 16.92V19.92C22 20.47 21.55 20.92 21 20.92C11.1 20.92 3.08 12.9 3.08 3C3.08 2.45 3.53 2 4.08 2H7.08C7.63 2 8.08 2.45 8.08 3C8.08 4.25 8.28 5.46 8.65 6.59C8.76 6.94 8.67 7.33 8.41 7.59L6.41 9.59C7.81 12.04 9.81 14.04 12.26 15.44L14.26 13.44C14.52 13.18 14.91 13.09 15.26 13.2C16.39 13.57 17.6 13.77 18.85 13.77C19.4 13.77 19.85 14.22 19.85 14.77V17.77C19.85 17.85 19.85 17.92 19.83 18C19.68 18.5 19.18 18.85 18.68 18.85H18.5" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const EmailIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M22 6L12 13L2 6" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const WhatsAppIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2C6.48 2 2 6.48 2 12C2 13.73 2.44 15.36 3.21 16.79L2.05 21L6.37 19.88C7.75 20.6 9.32 21 11 21H12C17.52 21 22 16.52 22 11C22 5.48 17.52 2 12 2Z" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: BACKGROUND},
  container: {flex: 1, backgroundColor: BACKGROUND},
  scrollContent: {paddingHorizontal: 24, paddingTop: 20, paddingBottom: 150},
  header: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 60},
  backButton: {width: 40, height: 40, alignItems: 'center', justifyContent: 'center'},
  headerTitle: {color: '#FFF', fontSize: 24, fontFamily: 'Raleway-Black'},
  description: {color: '#BBB', fontSize: 14, fontFamily: 'Raleway-Medium', textAlign: 'center', lineHeight: 20, marginBottom: 60, paddingHorizontal: 20},
  itemCard: {backgroundColor: SURFACE, borderRadius: 20, padding: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16},
  itemLeft: {flexDirection: 'row', alignItems: 'center', gap: 16},
  itemLabel: {color: ACCENT, fontSize: 18, fontFamily: 'Raleway-Bold'},
});

export default ContactUsView;
