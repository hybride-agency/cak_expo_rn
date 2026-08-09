import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Svg, {Path} from 'react-native-svg';

import axiosInstance from '../../axiosConfig';
import {getApiErrorMessage} from '../../utils/apiError';
import {PrimaryButtonCmp} from '../../components';
import {
  EMPTY_PASSWORD_FORM,
  validatePasswordForm,
  type PasswordErrors,
  type PasswordForm,
} from './validation';

const ACCENT = '#68FE00';
const SURFACE = '#222222';

interface ChangePasswordModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const ChangePasswordModal = ({
  visible,
  onClose,
  onSuccess,
}: ChangePasswordModalProps) => {
  const [form, setForm] = useState<PasswordForm>(EMPTY_PASSWORD_FORM);
  const [errors, setErrors] = useState<PasswordErrors>({});
  const [requestError, setRequestError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Never leave typed passwords sitting in state after the sheet closes.
  useEffect(() => {
    if (!visible) {
      setForm(EMPTY_PASSWORD_FORM);
      setErrors({});
      setRequestError(null);
      setLoading(false);
    }
  }, [visible]);

  const setField = (field: keyof PasswordForm, value: string) => {
    setForm(current => ({...current, [field]: value}));
    setErrors(current => ({...current, [field]: undefined}));
    setRequestError(null);
  };

  const handleSave = async () => {
    const validationErrors = validatePasswordForm(form);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      await axiosInstance.post('/auth/change-password', {
        current_password: form.current_password,
        password: form.password,
        password_confirmation: form.password_confirmation,
      });

      setLoading(false);
      onSuccess?.();
      onClose();
    } catch (error: unknown) {
      setLoading(false);
      setRequestError(getApiErrorMessage(error, 'Failed to change password'));
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.flexOne}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M18 6L6 18M6 6l12 12"
                    stroke="#FFF"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </Svg>
              </TouchableOpacity>
              <Text style={styles.title}>Change password</Text>
              <View style={styles.headerSpacer} />
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <PasswordField
                label="Current password"
                placeholder="Enter your current password"
                value={form.current_password}
                error={errors.current_password}
                onChangeText={text => setField('current_password', text)}
              />
              <PasswordField
                label="New password"
                placeholder="Enter your new password"
                value={form.password}
                error={errors.password}
                onChangeText={text => setField('password', text)}
              />
              <PasswordField
                label="Confirm password"
                placeholder="Re-enter your new password"
                value={form.password_confirmation}
                error={errors.password_confirmation}
                onChangeText={text => setField('password_confirmation', text)}
              />
            </ScrollView>

            {requestError ? (
              <Text style={styles.requestError}>{requestError}</Text>
            ) : null}

            <View style={styles.saveContainer}>
              <PrimaryButtonCmp
                text="Save"
                onPress={handleSave}
                loading={loading}
                disabled={loading}
              />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const PasswordField = ({
  label,
  placeholder,
  value,
  error,
  onChangeText,
}: {
  label: string;
  placeholder: string;
  value: string;
  error?: string;
  onChangeText: (text: string) => void;
}) => (
  <View style={styles.fieldWrapper}>
    <Text style={styles.label}>{label}</Text>
    <View
      style={[styles.inputContainer, error ? styles.inputContainerError : null]}
    >
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#666"
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
      />
    </View>
    {error ? <Text style={styles.error}>{error}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  flexOne: {flex: 1},
  backdrop: {flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end'},
  sheet: {
    backgroundColor: SURFACE,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  closeButton: {width: 32, height: 32, justifyContent: 'center'},
  title: {color: ACCENT, fontSize: 18, fontFamily: 'Raleway-Bold'},
  headerSpacer: {width: 32},
  fieldWrapper: {marginBottom: 20},
  label: {color: ACCENT, fontSize: 14, fontFamily: 'Raleway-Bold', marginBottom: 8},
  inputContainer: {
    backgroundColor: '#171717',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 56,
  },
  inputContainerError: {borderWidth: 1, borderColor: '#FF4D4F'},
  input: {flex: 1, color: '#FFF', fontSize: 15, fontFamily: 'Raleway-Medium'},
  error: {color: '#FF4D4F', fontSize: 12, fontFamily: 'Raleway-Medium', marginTop: 8},
  requestError: {color: '#FF4D4F', fontSize: 13, fontFamily: 'Raleway-Medium', marginTop: 4},
  saveContainer: {marginTop: 12},
});

export default ChangePasswordModal;
