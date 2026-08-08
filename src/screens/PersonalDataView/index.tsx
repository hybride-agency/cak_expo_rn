import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Svg, {Path, Circle} from 'react-native-svg';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import type {ProfileStackParamList} from '../../navigation/MainStack';
import {useAppSelector} from '../../store';

const ACCENT = '#68FE00';
const BACKGROUND = '#171717';
const SURFACE = '#222222';

type Props = NativeStackScreenProps<ProfileStackParamList, 'PersonalDataView'>;

const PersonalDataView = ({navigation}: Props) => {
  const profile = useAppSelector(state => state.home.profile);
  const loginUser = useAppSelector(state => state.login.user);
  const user = profile?.user || loginUser?.data?.user || {};
  const personalData = profile?.personal_data || profile?.fitness_profile || {};
  const height = displayValue(
    personalData?.height ?? profile?.height ?? user?.height,
  );
  const weight = displayValue(
    personalData?.weight ?? profile?.weight ?? user?.weight,
  );
  const age = displayValue(personalData?.age ?? profile?.age ?? user?.age);
  const gender = displayValue(
    personalData?.gender ?? profile?.gender ?? user?.gender,
  );

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
            <Text style={styles.headerTitle}>Personnal data</Text>
            <View style={{width: 24}} />
          </View>

          <View style={styles.statsRow}>
            <StatCard value={height} unit="cm" label="Height" />
            <StatCard value={weight} unit="kg" label="Weight" />
            <StatCard value={age} unit="yrs" label="Age" />
          </View>

          <View style={styles.formContainer}>
            <FormInput
              label="Full Name"
              value={displayValue(user?.name)}
              icon="edit"
            />
            <FormInput label="Gender" value={gender} icon="chevron" />
            <FormInput
              label="Email"
              value={displayValue(user?.email)}
              icon="edit"
            />
            <FormInput
              label="Phone number"
              value={displayValue(user?.phone || user?.phone_number)}
              icon="edit"
            />
            <FormInput label="Password" value="**********" icon="password" />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const StatCard = ({value, unit, label}: {value: string, unit: string, label: string}) => (
  <View style={styles.statCard}>
    <Text style={styles.statValue}>{value} <Text style={styles.statUnit}>{unit}</Text></Text>
    <Text style={styles.statLabel}>{label}</Text>
    <View style={styles.statEditBadge}>
      <Svg width={10} height={10} viewBox="0 0 24 24" fill="none">
        <Path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    </View>
  </View>
);

const FormInput = ({label, value, icon}: {label: string, value: string, icon: 'edit' | 'chevron' | 'password'}) => (
  <View style={styles.inputWrapper}>
    <Text style={styles.inputLabel}>{label}</Text>
    <View style={styles.inputContainer}>
      <TextInput 
        style={styles.inputField}
        value={value}
        editable={false}
        secureTextEntry={icon === 'password'}
      />
      <View style={styles.inputIconContainer}>
        {icon === 'edit' && (
          <View style={styles.editIconBadge}>
            <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
              <Path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </View>
        )}
        {icon === 'chevron' && (
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path d="M6 9l6 6 6-6" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        )}
        {icon === 'password' && (
          <View style={{flexDirection: 'row', gap: 12}}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <Circle cx="12" cy="12" r="3" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <Path d="M1 1l22 22" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </View>
        )}
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: BACKGROUND},
  container: {flex: 1, backgroundColor: BACKGROUND},
  scrollContent: {paddingHorizontal: 20, paddingBottom: 150},
  header: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 20, marginBottom: 20},
  backButton: {width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-start'},
  headerTitle: {color: '#FFF', fontSize: 20, fontFamily: 'Raleway-Bold'},
  
  statsRow: {flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginBottom: 32},
  statCard: {flex: 1, backgroundColor: SURFACE, borderRadius: 16, paddingVertical: 16, alignItems: 'center', position: 'relative'},
  statValue: {color: ACCENT, fontSize: 18, fontFamily: 'Raleway-Bold', marginBottom: 4},
  statUnit: {fontSize: 12},
  statLabel: {color: '#888', fontSize: 13, fontFamily: 'Raleway-Medium'},
  statEditBadge: {position: 'absolute', right: -6, bottom: -6, width: 22, height: 22, borderRadius: 11, backgroundColor: '#555', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: BACKGROUND},

  formContainer: {gap: 20},
  inputWrapper: {},
  inputLabel: {color: ACCENT, fontSize: 14, fontFamily: 'Raleway-Bold', marginBottom: 8},
  inputContainer: {backgroundColor: SURFACE, borderRadius: 16, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 56},
  inputField: {flex: 1, color: '#FFF', fontSize: 15, fontFamily: 'Raleway-Medium'},
  inputIconContainer: {marginLeft: 12},
  editIconBadge: {width: 24, height: 24, borderRadius: 12, backgroundColor: '#555', alignItems: 'center', justifyContent: 'center'},
});

export default PersonalDataView;

const displayValue = (value: unknown) => {
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }

  return '—';
};
