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
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import type {ProfileStackParamList} from '../../navigation/MainStack';

const BACKGROUND = '#171717';

type Props = NativeStackScreenProps<ProfileStackParamList, 'NotificationsView'>;

const NotificationsView = ({navigation}: Props) => {

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
            <Text style={styles.headerTitle}>Notifications</Text>
            <View style={{width: 24}} />
          </View>

          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No notifications yet</Text>
            <Text style={styles.emptyDescription}>
              Your reminders and account updates will appear here.
            </Text>
          </View>
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
});

export default NotificationsView;
