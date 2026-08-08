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
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {ProfileStackParamList} from '../../navigation/MainStack';

const BACKGROUND = '#171717';
const {width, height} = Dimensions.get('window');

const AboutUsView = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <Image 
          source={{uri: 'https://d1t9z5ilqoa9lf.cloudfront.net/pages/about-us.png'}} 
          style={styles.backgroundImage}
          resizeMode="cover"
        />
        
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                <Path d="M15 18L9 12L15 6" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>About Us</Text>
            <View style={{width: 24}} />
          </View>

          <View style={styles.textBody}>
            <Text style={styles.title}>About CAK</Text>
            <Text style={styles.description}>
              Natural Bodybuilding & Fitness Academy, founded by Charbel Abou Khattar, Lebanon's leading name in natural bodybuilding. Since entering the fitness space at a young age, Charbel has built CAK Gym on the values of discipline, integrity, and excellence.
            </Text>

            <Text style={styles.sectionTitle}>What We Stand For:</Text>
            <BulletItem>Natural Fitness: We stay drug-free. Every athlete at CAK commits to natural bodybuilding, no shortcuts.</BulletItem>
            <BulletItem>Science & Practice: Training + nutrition = results. We combine evidence-based programs with the space and coaching you need.</BulletItem>
            <BulletItem>Community & Growth: CAK isn't just a gym, it's a family. Whether you're stepping in for the first time or preparing for a competition, you'll be surrounded by support and motivation.</BulletItem>

            <Text style={styles.sectionTitle}>Our Promise</Text>
            <Text style={styles.description}>
              To equip every member with personalized training, nutrition guidance, and coaching safely, all delivered with authenticity and heart. Because at CAK, we believe real strength comes from staying true to yourself.
            </Text>

            <Text style={styles.sectionTitle}>CAK Gym Locations & Contact</Text>
            <Text style={styles.contactInfo}>Main branch: Jounieh{"\n"}Phone: +961 9 830316</Text>
            
            <Text style={styles.footerNote}>Hours, trainers, and membership info all available in app / at front desk.</Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const BulletItem = ({children}: {children: string}) => (
  <View style={styles.bulletRow}>
    <Text style={styles.bullet}>•</Text>
    <Text style={styles.bulletText}>{children}</Text>
  </View>
);

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: BACKGROUND},
  container: {flex: 1, backgroundColor: BACKGROUND},
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: height,
  },
  scrollContent: {paddingBottom: 150},
  header: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 20, marginBottom: 20, zIndex: 10},
  backButton: {width: 40, height: 40, alignItems: 'center', justifyContent: 'center'},
  headerTitle: {color: '#FFF', fontSize: 20, fontFamily: 'Raleway-Bold'},
  textBody: {paddingHorizontal: 24},
  title: {color: '#FFF', fontSize: 20, fontFamily: 'Raleway-Bold', marginBottom: 20},
  description: {color: '#FFF', fontSize: 13, fontFamily: 'Raleway-Medium', lineHeight: 22, marginBottom: 24},
  sectionTitle: {color: '#FFF', fontSize: 16, fontFamily: 'Raleway-Bold', marginTop: 10, marginBottom: 16},
  bulletRow: {flexDirection: 'row', marginBottom: 12, paddingRight: 10},
  bullet: {color: '#FFF', fontSize: 16, marginRight: 10},
  bulletText: {flex: 1, color: '#FFF', fontSize: 13, fontFamily: 'Raleway-Medium', lineHeight: 20},
  contactInfo: {color: '#FFF', fontSize: 14, fontFamily: 'Raleway-Bold', lineHeight: 24, marginBottom: 20},
  footerNote: {color: '#FFF', fontSize: 13, fontFamily: 'Raleway-Bold', lineHeight: 20, marginTop: 10},
});

export default AboutUsView;
