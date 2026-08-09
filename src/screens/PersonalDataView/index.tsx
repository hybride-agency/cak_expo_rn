import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

import { PrimaryButtonCmp } from "../../components";
import type { ProfileStackParamList } from "../../navigation/MainStack";
import { updateProfile } from "../../slice/HomeSlice";
import { useAppDispatch, useAppSelector } from "../../store";
import type { EditableField, ProfileUpdatePayload } from "../../types/home";
import ChangePasswordModal from "./ChangePasswordModal";
import StatPickerModal, { type PickerField } from "./StatPickerModal";

const ACCENT = "#68FE00";
const BACKGROUND = "#171717";
const SURFACE = "#222222";

const PICKER_FIELD_KEYS: Record<PickerField, EditableField> = {
  height: "height_cm",
  weight: "weight_kg",
  age: "age",
  gender: "gender",
};

type Props = NativeStackScreenProps<ProfileStackParamList, "PersonalDataView">;

const PersonalDataView = ({ navigation }: Props) => {
  const dispatch = useAppDispatch();
  const profile = useAppSelector((state) => state.home.profile);
  const loginUser = useAppSelector((state) => state.login.user);
  const saving = useAppSelector((state) => state.home.savingProfile);

  const [edits, setEdits] = useState<ProfileUpdatePayload>({});
  const [errors, setErrors] = useState<Partial<Record<EditableField, string>>>(
    {},
  );
  const [editingField, setEditingField] = useState<PickerField | null>(null);
  const [changingPassword, setChangingPassword] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Values as they come back from GET /auth/profile, before any local edit.
  const serverValues = useMemo(() => {
    const user = profile?.user || loginUser?.data?.user || {};
    const personalData =
      profile?.personal_data || profile?.fitness_profile || {};

    return {
      name: user?.name,
      email: user?.email,
      phone_number: user?.phone_number ?? user?.phone,
      height_cm:
        user?.height_cm ??
        personalData?.height_cm ??
        personalData?.height ??
        profile?.height ??
        user?.height,
      weight_kg:
        user?.weight_kg ??
        personalData?.weight_kg ??
        personalData?.weight ??
        profile?.weight ??
        user?.weight,
      age: user?.age ?? personalData?.age ?? profile?.age,
      gender: user?.gender ?? personalData?.gender ?? profile?.gender,
    };
  }, [profile, loginUser]);

  // A local edit shadows the server value until the save succeeds.
  const valueOf = (field: EditableField) =>
    edits[field] !== undefined ? edits[field] : serverValues[field];

  const isDirty = Object.keys(edits).length > 0;

  const setField = (field: EditableField, value: string | number | null) => {
    setEdits((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setSaveError(null);
  };

  const openPicker = (field: PickerField) => setEditingField(field);

  const handlePickerSave = (value: number | string) => {
    if (editingField) {
      setField(PICKER_FIELD_KEYS[editingField], value);
    }
    setEditingField(null);
  };

  const handleSave = async () => {
    const validationErrors = validate(edits);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const payload: ProfileUpdatePayload = { ...edits };

    // The API accepts a null phone number; an empty string is not valid.
    if (payload.phone_number !== undefined && !payload.phone_number) {
      payload.phone_number = null;
    }

    const result = await dispatch(updateProfile(payload));

    if (updateProfile.fulfilled.match(result)) {
      setEdits({});
      setErrors({});
      setSaveError(null);
    } else {
      // Keep the edits so the user can correct them instead of retyping.
      setSaveError((result.payload as string) ?? "Failed to update profile");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        style={styles.flexOne}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.container}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backButton}
              >
                <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M15 18L9 12L15 6"
                    stroke="#FFF"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Personnal data</Text>
              <View style={styles.headerSpacer} />
            </View>

            <View style={styles.statsRow}>
              <StatCard
                value={displayValue(valueOf("height_cm"))}
                unit="cm"
                label="Height"
                onPress={() => openPicker("height")}
              />
              <StatCard
                value={displayValue(valueOf("weight_kg"))}
                unit="kg"
                label="Weight"
                onPress={() => openPicker("weight")}
              />
              <StatCard
                value={displayValue(valueOf("age"))}
                unit="yrs"
                label="Age"
                onPress={() => openPicker("age")}
              />
            </View>

            <View style={styles.formContainer}>
              <FormInput
                label="Full Name"
                value={displayValue(valueOf("name"), "")}
                icon="edit"
                error={errors.name}
                onChangeText={(text) => setField("name", text)}
              />
              <FormInput
                label="Gender"
                value={capitalize(displayValue(valueOf("gender")))}
                icon="chevron"
                onPress={() => openPicker("gender")}
              />
              <FormInput
                label="Email"
                value={displayValue(valueOf("email"), "")}
                icon="edit"
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email}
                onChangeText={(text) => setField("email", text)}
              />
              <FormInput
                label="Phone number"
                value={displayValue(valueOf("phone_number"), "")}
                placeholder="Add phone number"
                icon="edit"
                keyboardType="phone-pad"
                error={errors.phone_number}
                onChangeText={(text) => setField("phone_number", text)}
              />
              <FormInput
                label="Password"
                value="**********"
                icon="edit"
                onPress={() => setChangingPassword(true)}
              />
            </View>

            {saveError ? (
              <Text style={styles.saveError}>{saveError}</Text>
            ) : null}

            {isDirty ? (
              <View style={styles.saveContainer}>
                <PrimaryButtonCmp
                  text="Save changes"
                  onPress={handleSave}
                  loading={saving}
                  disabled={saving}
                />
              </View>
            ) : null}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      <StatPickerModal
        field={editingField}
        initialValue={pickerInitialValue(editingField, valueOf)}
        onCancel={() => setEditingField(null)}
        onSave={handlePickerSave}
      />

      <ChangePasswordModal
        visible={changingPassword}
        onClose={() => setChangingPassword(false)}
      />
    </SafeAreaView>
  );
};

const StatCard = ({
  value,
  unit,
  label,
  onPress,
}: {
  value: string;
  unit: string;
  label: string;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={styles.statCard}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <Text style={styles.statValue}>
      {value} <Text style={styles.statUnit}>{unit}</Text>
    </Text>
    <Text style={styles.statLabel}>{label}</Text>
    <View style={styles.statEditBadge}>
      <Svg width={10} height={10} viewBox="0 0 24 24" fill="none">
        <Path
          d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"
          stroke="#FFF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  </TouchableOpacity>
);

const FormInput = ({
  label,
  value,
  icon,
  placeholder,
  error,
  keyboardType,
  autoCapitalize,
  onChangeText,
  onPress,
}: {
  label: string;
  value: string;
  icon: "edit" | "chevron";
  placeholder?: string;
  error?: string;
  keyboardType?: "email-address" | "phone-pad";
  autoCapitalize?: "none" | "sentences";
  onChangeText?: (text: string) => void;
  onPress?: () => void;
}) => {
  const inputRef = React.useRef<TextInput>(null);
  const editable = Boolean(onChangeText);

  const field = (
    <View
      style={[styles.inputContainer, error ? styles.inputContainerError : null]}
    >
      <TextInput
        ref={inputRef}
        style={styles.inputField}
        value={value}
        placeholder={placeholder}
        placeholderTextColor="#666"
        editable={editable}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        onChangeText={onChangeText}
      />
      <View style={styles.inputIconContainer}>
        {icon === "edit" && (
          <TouchableOpacity
            style={styles.editIconBadge}
            onPress={() => inputRef.current?.focus()}
            disabled={!editable}
          >
            <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
              <Path
                d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"
                stroke="#FFF"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>
        )}
        {icon === "chevron" && (
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path
              d="M6 9l6 6 6-6"
              stroke="#888"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.inputWrapper}>
      <Text style={styles.inputLabel}>{label}</Text>
      {onPress ? (
        <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
          <View pointerEvents="none">{field}</View>
        </TouchableOpacity>
      ) : (
        field
      )}
      {error ? <Text style={styles.inputError}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BACKGROUND },
  flexOne: { flex: 1 },
  container: { flex: 1, backgroundColor: BACKGROUND },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 150 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 20,
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  headerTitle: { color: "#FFF", fontSize: 20, fontFamily: "Raleway-Bold" },
  headerSpacer: { width: 24 },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: SURFACE,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    position: "relative",
  },
  statInputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 4,
  },
  statValue: {
    color: ACCENT,
    fontSize: 18,
    fontFamily: "Raleway-Bold",
    minWidth: 20,
    textAlign: "center",
  },
  statUnit: { fontSize: 12, color: ACCENT, marginLeft: 2, marginBottom: 2 },
  statLabel: { color: "#888", fontSize: 13, fontFamily: "Raleway-Medium" },
  statEditBadge: {
    position: "absolute",
    right: -6,
    bottom: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#555",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: BACKGROUND,
  },

  formContainer: { gap: 20, marginBottom: 30 },
  inputWrapper: {},
  inputLabel: {
    color: ACCENT,
    fontSize: 14,
    fontFamily: "Raleway-Bold",
    marginBottom: 8,
  },
  inputContainer: {
    backgroundColor: SURFACE,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    height: 56,
  },
  inputContainerError: { borderWidth: 1, borderColor: "#FF4D4F" },
  inputField: {
    flex: 1,
    color: "#FFF",
    fontSize: 15,
    fontFamily: "Raleway-Medium",
  },
  inputIconContainer: { marginLeft: 12 },
  inputError: {
    color: "#FF4D4F",
    fontSize: 12,
    fontFamily: "Raleway-Medium",
    marginTop: 6,
  },
  editIconBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#555",
    alignItems: "center",
    justifyContent: "center",
  },

  saveError: {
    color: "#FF4D4F",
    fontSize: 13,
    fontFamily: "Raleway-Medium",
    marginTop: 20,
  },
  saveContainer: { marginTop: 28 },
});

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validate = (edits: ProfileUpdatePayload) => {
  const errors: Partial<Record<EditableField, string>> = {};

  if (edits.name !== undefined) {
    if (!edits.name.trim()) {
      errors.name = "Name is required";
    } else if (edits.name.length > 255) {
      errors.name = "Name is too long";
    }
  }

  if (edits.email !== undefined) {
    if (!edits.email.trim()) {
      errors.email = "Email is required";
    } else if (!EMAIL_PATTERN.test(edits.email.trim())) {
      errors.email = "Enter a valid email";
    } else if (edits.email.length > 255) {
      errors.email = "Email is too long";
    }
  }

  if (edits.phone_number && edits.phone_number.length > 30) {
    errors.phone_number = "Phone number is too long";
  }

  return errors;
};

const pickerInitialValue = (
  field: PickerField | null,
  valueOf: (key: EditableField) => unknown,
) => {
  if (!field) {
    return "";
  }

  const value = valueOf(PICKER_FIELD_KEYS[field]);

  return typeof value === "number" || typeof value === "string" ? value : "";
};

const capitalize = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

const displayValue = (value: unknown, fallback = "—") => {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  return fallback;
};

export default PersonalDataView;
