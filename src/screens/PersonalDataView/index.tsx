import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import type { ProfileStackParamList } from '../../navigation/MainStack';
import { useAppSelector, useAppDispatch } from '../../store';
import { getProfile } from '../../slice/HomeSlice';
import axiosInstance from '../../axiosConfig';

const ACCENT = '#68FE00';
const BACKGROUND = '#171717';
const SURFACE = '#222222';

type Props = NativeStackScreenProps<ProfileStackParamList, 'PersonalDataView'>;

const PersonalDataView = ({navigation}: Props) => {
  const dispatch = useAppDispatch();
  const profile = useAppSelector(state => state.home.profile);
  const loginUser = useAppSelector(state => state.login.user);
  
  const user = profile?.user || loginUser?.data?.user || {};
  const personalData = profile?.personal_data || profile?.fitness_profile || {};

  const initialHeight = personalData?.height ?? profile?.height ?? user?.height ?? user?.height_cm;
  const initialWeight = personalData?.weight ?? profile?.weight ?? user?.weight ?? user?.weight_kg;
  const initialAge = personalData?.age ?? profile?.age ?? user?.age;
  const initialGender = personalData?.gender ?? profile?.gender ?? user?.gender;

  const [name, setName] = useState(displayValue(user?.name));
  const [email, setEmail] = useState(displayValue(user?.email));
  const [phone, setPhone] = useState(displayValue(user?.phone || user?.phone_number));
  
  const [height, setHeight] = useState(displayValue(initialHeight));
  const [weight, setWeight] = useState(displayValue(initialWeight));
  const [age, setAge] = useState(displayValue(initialAge));
  const [gender, setGender] = useState(displayValue(initialGender));

  const [saving, setSaving] = useState(false);
  const isSavingRef = React.useRef(false);

  // Password Modal State
  const [isPasswordModalVisible, setPasswordModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const isSavingPasswordRef = React.useRef(false);

  // Custom Alert State
  const [alertConfig, setAlertConfig] = useState<{visible: boolean, title: string, message: string, onConfirm?: () => void}>({visible: false, title: '', message: ''});

  const showAlert = (title: string, message: string, onConfirm?: () => void) => {
    setAlertConfig({ visible: true, title, message, onConfirm });
  };

  // Update state if profile data changes from Redux
  useEffect(() => {
    setName(displayValue(user?.name));
    setEmail(displayValue(user?.email));
    setPhone(displayValue(user?.phone || user?.phone_number));
    setHeight(displayValue(initialHeight));
    setWeight(displayValue(initialWeight));
    setAge(displayValue(initialAge));
    setGender(displayValue(initialGender));
  }, [profile]);

  const isAppleHiddenEmail = user?.apple_id && user?.email?.endsWith('@privaterelay.appleid.com');
  const shouldHideEmail = isAppleHiddenEmail;
  const shouldHidePassword = user?.has_password === false;

  const handleSave = async () => {
    if (isSavingRef.current) return;
    try {
      isSavingRef.current = true;
      setSaving(true);
      const payload: any = {
        name,
        height_cm: height === '—' ? null : Number(height),
        weight_kg: weight === '—' ? null : Number(weight),
        age: age === '—' ? null : Number(age),
      };

      if (gender === 'male' || gender === 'female') {
        payload.gender = gender;
      }
      if (!shouldHideEmail && email !== '—') {
        payload.email = email;
      }
      if (phone && phone !== '—') {
        payload.phone_number = phone;
      }

      await axiosInstance.put('/auth/profile', payload);
      await dispatch(getProfile());
      showAlert('Success', 'Profile updated successfully!', () => navigation.goBack());
    } catch (error: any) {
      console.error('Failed to update profile', error);
    } finally {
      setSaving(false);
      isSavingRef.current = false;
    }
  };

  const handleChangePassword = async () => {
    if (isSavingPasswordRef.current) return;
    if (!currentPassword || !newPassword || !confirmPassword) {
      showAlert('Error', 'Please fill in all password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showAlert('Error', 'New passwords do not match.');
      return;
    }

    try {
      isSavingPasswordRef.current = true;
      setSavingPassword(true);
      await axiosInstance.post('/auth/change-password', {
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword
      });
      
      showAlert('Success', 'Password updated successfully!');
      setPasswordModalVisible(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Failed to change password', error);
    } finally {
      setSavingPassword(false);
      isSavingPasswordRef.current = false;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <KeyboardAwareScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          enableOnAndroid={true}
          extraScrollHeight={Platform.OS === 'android' ? 120 : 40}
          extraHeight={Platform.OS === 'android' ? 120 : 40}
          keyboardOpeningTime={0}
        >
          
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                <Path d="M15 18L9 12L15 6" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Personal data</Text>
            <View style={{width: 24}} />
          </View>

          <View style={styles.statsRow}>
            <StatCard value={height} onChangeText={setHeight} unit="cm" label="Height" />
            <StatCard value={weight} onChangeText={setWeight} unit="kg" label="Weight" />
            <StatCard value={age} onChangeText={setAge} unit="yrs" label="Age" />
          </View>

          <View style={styles.formContainer}>
            <FormInput
              label="Full Name"
              value={name}
              onChangeText={setName}
              icon="edit"
            />
            <FormDropdown 
              label="Gender"
              value={gender}
              onSelect={setGender}
              options={[
                { label: 'Male', value: 'male' },
                { label: 'Female', value: 'female' }
              ]}
            />
            
            {!shouldHideEmail && (
              <FormInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                icon="edit"
              />
            )}
            
            <FormInput
              label="Phone number"
              value={phone}
              onChangeText={setPhone}
              icon="edit"
            />
            
            {!shouldHidePassword && (
              <TouchableOpacity activeOpacity={0.8} onPress={() => setPasswordModalVisible(true)}>
                <View pointerEvents="none">
                  <FormInput label="Password" value="**********" icon="password" editable={false} />
                </View>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity 
            style={styles.saveButton} 
            onPress={handleSave} 
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </KeyboardAwareScrollView>
      </View>

      {/* Custom Alert Modal */}
      <Modal
        visible={alertConfig.visible}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.alertOverlay}>
          <View style={styles.alertContent}>
            <Text style={styles.alertTitle}>{alertConfig.title}</Text>
            <Text style={styles.alertMessage}>{alertConfig.message}</Text>
            <TouchableOpacity 
              style={styles.alertButton}
              onPress={() => {
                const onConfirm = alertConfig.onConfirm;
                setAlertConfig({ ...alertConfig, visible: false });
                if (onConfirm) onConfirm();
              }}
            >
              <Text style={styles.alertButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        visible={isPasswordModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setPasswordModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Password</Text>
              <TouchableOpacity onPress={() => setPasswordModalVisible(false)} style={styles.closeButton}>
                <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                  <Path d="M18 6L6 18M6 6l12 12" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </TouchableOpacity>
            </View>

            <View style={styles.modalForm}>
              <Text style={styles.inputLabel}>Current Password</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.inputField}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry
                  placeholder="Enter current password"
                  placeholderTextColor="#888"
                />
              </View>

              <Text style={[styles.inputLabel, {marginTop: 16}]}>New Password</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.inputField}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                  placeholder="Enter new password"
                  placeholderTextColor="#888"
                />
              </View>

              <Text style={[styles.inputLabel, {marginTop: 16}]}>Confirm New Password</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.inputField}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  placeholder="Confirm new password"
                  placeholderTextColor="#888"
                />
              </View>

              <TouchableOpacity 
                style={styles.saveButton} 
                onPress={handleChangePassword} 
                disabled={savingPassword}
              >
                {savingPassword ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text style={styles.saveButtonText}>Update Password</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const StatCard = ({value, onChangeText, unit, label}: {value: string, onChangeText?: (t: string) => void, unit: string, label: string}) => {
  const inputRef = React.useRef<TextInput>(null);
  
  return (
    <View style={styles.statCard}>
      <View style={styles.statInputWrapper}>
        <TextInput
          ref={inputRef}
          style={styles.statValue}
          value={value}
          onChangeText={onChangeText}
          keyboardType="numeric"
        />
        <Text style={styles.statUnit}>{unit}</Text>
      </View>
      <Text style={styles.statLabel}>{label}</Text>
      <TouchableOpacity 
        style={styles.statEditBadge}
        activeOpacity={0.8}
        onPress={() => inputRef.current?.focus()}
      >
        <Svg width={10} height={10} viewBox="0 0 24 24" fill="none">
          <Path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </TouchableOpacity>
    </View>
  );
};

const FormInput = ({label, value, onChangeText, icon, editable = true}: {label: string, value: string, onChangeText?: (t: string) => void, icon: 'edit' | 'chevron' | 'password', editable?: boolean}) => {
  const inputRef = React.useRef<TextInput>(null);
  return (
    <View style={styles.inputWrapper}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputContainer}>
        <TextInput 
          ref={inputRef}
          style={[styles.inputField, !editable && {color: '#888'}]}
          value={value}
          onChangeText={onChangeText}
          editable={editable && icon !== 'password'}
          secureTextEntry={icon === 'password'}
        />
        {icon === 'edit' && (
          <TouchableOpacity onPress={() => inputRef.current?.focus()} style={styles.editIconBadge}>
            <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
              <Path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const FormDropdown = ({label, value, options, onSelect}: {label: string, value: string, options: {label: string, value: string}[], onSelect: (val: string) => void}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.inputWrapper}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TouchableOpacity 
        activeOpacity={0.8} 
        style={styles.inputContainer} 
        onPress={() => setExpanded(!expanded)}
      >
        <Text style={[styles.inputField, { color: value ? '#FFF' : '#888' }]}>
          {options.find(o => o.value.toLowerCase() === value.toLowerCase())?.label || 'Select...'}
        </Text>
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" style={{ transform: [{ rotate: expanded ? '180deg' : '0deg' }] }}>
          <Path d="M6 9l6 6 6-6" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </TouchableOpacity>
      
      {expanded && (
        <View style={styles.dropdownList}>
          {options.map((opt, i) => (
            <TouchableOpacity 
              key={opt.value}
              style={[styles.dropdownItem, i === options.length - 1 && { borderBottomWidth: 0 }]}
              onPress={() => { onSelect(opt.value); setExpanded(false); }}
            >
              <Text style={[styles.dropdownItemText, opt.value.toLowerCase() === value.toLowerCase() && { color: ACCENT, fontFamily: 'Raleway-Bold' }]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: BACKGROUND},
  container: {flex: 1, backgroundColor: BACKGROUND},
  scrollContent: {paddingHorizontal: 20, paddingBottom: 150},
  header: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 20, marginBottom: 20},
  backButton: {width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-start'},
  headerTitle: {color: '#FFF', fontSize: 20, fontFamily: 'Raleway-Bold'},
  
  statsRow: {flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginBottom: 32},
  statCard: {flex: 1, backgroundColor: SURFACE, borderRadius: 16, paddingVertical: 16, alignItems: 'center', position: 'relative'},
  statInputWrapper: {flexDirection: 'row', alignItems: 'flex-end', marginBottom: 4},
  statValue: {color: ACCENT, fontSize: 18, fontFamily: 'Raleway-Bold', minWidth: 20, textAlign: 'center'},
  statUnit: {fontSize: 12, color: ACCENT, marginLeft: 2, marginBottom: 2},
  statLabel: {color: '#888', fontSize: 13, fontFamily: 'Raleway-Medium'},
  statEditBadge: {position: 'absolute', right: -6, bottom: -6, width: 22, height: 22, borderRadius: 11, backgroundColor: '#555', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: BACKGROUND},

  formContainer: {gap: 20, marginBottom: 30},
  inputWrapper: {},
  inputLabel: {color: ACCENT, fontSize: 14, fontFamily: 'Raleway-Bold', marginBottom: 8},
  inputContainer: {backgroundColor: SURFACE, borderRadius: 16, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 56},
  inputField: {flex: 1, color: '#FFF', fontSize: 15, fontFamily: 'Raleway-Medium'},
  inputIconContainer: {marginLeft: 12},
  editIconBadge: {width: 24, height: 24, borderRadius: 12, backgroundColor: '#555', alignItems: 'center', justifyContent: 'center'},

  saveButton: {backgroundColor: ACCENT, borderRadius: 16, height: 56, justifyContent: 'center', alignItems: 'center', marginTop: 10},
  saveButtonText: {color: '#000', fontSize: 16, fontFamily: 'Raleway-Bold'},

  // Modal styles
  modalOverlay: {flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end'},
  modalContent: {backgroundColor: BACKGROUND, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40},
  modalHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24},
  modalTitle: {color: '#FFF', fontSize: 18, fontFamily: 'Raleway-Bold'},
  closeButton: {padding: 4},
  modalForm: {},
  
  alertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  alertContent: {
    backgroundColor: '#1E1E1E',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2C2C2C',
  },
  alertTitle: {
    color: '#FFF',
    fontSize: 20,
    fontFamily: 'Raleway-Bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  alertMessage: {
    color: '#CCC',
    fontSize: 16,
    fontFamily: 'Raleway-Medium',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  alertButton: {
    backgroundColor: ACCENT,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  alertButtonText: {
    color: '#000',
    fontSize: 16,
    fontFamily: 'Raleway-Bold',
  },
  
  dropdownList: {
    backgroundColor: '#2C2C2C',
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#3A3A3A',
    overflow: 'hidden'
  },
  dropdownItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#3A3A3A',
  },
  dropdownItemText: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: 'Raleway-Medium',
  },
});

const displayValue = (value: unknown) => {
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }

  return '—';
};

export default PersonalDataView;
