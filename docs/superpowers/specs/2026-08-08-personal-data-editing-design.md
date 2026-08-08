# Editable Personal Data — Design

**Date:** 2026-08-08
**Scope:** `src/screens/PersonalDataView` — make the seven profile fields editable and persist them via `PUT /auth/profile`.

## Problem

`PersonalDataView` is read-only. Every field renders from Redux (`state.home.profile`, populated by `GET /auth/profile`) into a disabled `TextInput`. The stat cards and form rows already draw edit affordances — a pencil badge on each stat card, a pencil on name/email/phone, a chevron on gender — but none of them do anything.

The quiz already owns polished pickers for four of these values. They should be reused rather than rebuilt.

## Goals

- Height, weight, age, and gender are editable through the existing quiz picker components.
- Name, email, and phone are editable as inline text.
- Changes persist through `PUT /auth/profile`.
- Client-side validation mirrors the server contract so obvious errors never reach the network.

## Non-goals

- Password change. It needs its own flow (current-password confirmation, etc.).
- Profile image upload.
- Any change to the quiz screens themselves. The picker components are consumed as-is, configured only through their existing props.

## API contract

`PUT /auth/profile`, partial payload — only dirty fields are sent.

| Field | Type | Rule |
|---|---|---|
| `name` | string | max 255 |
| `email` | string | email format, max 255, unique |
| `phone_number` | string \| null | max 30, nullable |
| `height_cm` | integer | min 50 |
| `weight_kg` | integer | min 30 |
| `age` | integer | 10–120 |
| `gender` | string | `male` \| `female` |

Response is assumed to follow the same envelope as `GET /auth/profile` (`{success, message, data: {user, active_plan, homepage_access}}`).

## Architecture

### 1. `updateProfile` thunk — `src/slice/HomeSlice.tsx`

```ts
export const updateProfile = createAsyncThunk(
  'home/updateProfile',
  async (changes: ProfileUpdatePayload, {rejectWithValue}) => {
    try {
      const response = await axiosInstance.put('/auth/profile', changes);
      return response.data;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to update profile'));
    }
  },
);
```

`fulfilled` writes `action.payload?.data ?? action.payload` into `state.profile` — the same unwrap `getProfile` uses. If the response echoes the updated profile, the screen refreshes with no second round trip.

`HomeState` gains `savingProfile: boolean`, set by this thunk's pending/fulfilled/rejected cases. It is deliberately separate from the shared `loading` flag so the Save button can show progress without other `state.home` consumers reacting.

`ProfileUpdatePayload` is a new type in `src/types/home.ts` with every key optional, matching the table above. `EditableField` is exported alongside it as the union of those keys.

### 2. `StatPickerModal` — `src/screens/PersonalDataView/StatPickerModal.tsx`

One wrapper for all four picker-driven fields, so the screen does not grow four near-identical blocks.

```ts
type PickerField = 'height' | 'weight' | 'age' | 'gender';

interface StatPickerModalProps {
  field: PickerField | null;      // null = closed
  initialValue: number | string;
  onCancel: () => void;
  onSave: (value: number | string) => void;
}
```

Renders React Native's built-in `Modal` (`transparent`, `animationType="slide"`) as a dark bottom sheet: title, close ✕, the matching picker, and `PrimaryButtonCmp` labelled Save. No new dependency.

The in-flight value lives in the modal's own state and is lifted only on Save, so Cancel discards cleanly.

Picker configuration, clamped to the API contract:

| `field` | Component | Props |
|---|---|---|
| `height` | `HeightPickerCmp` | `minHeight={50} maxHeight={250}` |
| `weight` | `WeightPickerCmp` | `minWeight={30} maxWeight={300}` |
| `age` | `AgePickerCmp` | `minAge={10} maxAge={120}` |
| `gender` | `GenderPickerCmp` | controlled: `selectedGender` + `onChangeGender` |

`height_cm` has no stated server maximum; 250 keeps the wheel usable.

`GenderPickerCmp` is driven controlled through `onChangeGender` and confirmed with the sheet's Save button. Its required `onSelectGender` prop — which fires on a 500ms delay to auto-advance the quiz to the next question — is wired to the same local setter, so the delayed call is a harmless no-op instead of closing the sheet out from under the user.

### 3. `PersonalDataView` changes

**State**

`EditableField` is the union of the seven payload keys (`name | email | phone_number | height_cm | weight_kg | age | gender`), exported from `src/types/home.ts` alongside `ProfileUpdatePayload`.

- `editingField: PickerField | null` — which sheet is open.
- `edits: ProfileUpdatePayload` — dirty values only. A field absent from this object is not dirty and is not sent.
- `errors: Partial<Record<EditableField, string>>` — validation messages.

**Display resolution.** Each field renders `edits[field] ?? <API value>`. On a successful save, `edits` is cleared, so the screen falls back to the freshly-stored API values.

**Stat cards.** `StatCard` gains an `onPress` and becomes a `TouchableOpacity`. The pencil badge is already drawn, so the affordance needs no visual change.

**Initial picker value.** The current value is parsed to a number to feed `initialValue`, so the wheel opens centered on the user's real value (180 / 85 / 30) rather than the component defaults (172 / 65 / 25). A non-numeric or missing value falls back to the picker's own default.

**Text fields.** Name, email, and phone become `editable` and controlled. Tapping the pencil badge focuses the field.

- email: `keyboardType="email-address"`, `autoCapitalize="none"`
- phone: `keyboardType="phone-pad"`, placeholder `Add phone number` (the API returns `null` today, and a placeholder reads better than `—` in an editable field)

**Save.** Picker sheets commit into `edits` on their own Save. Text fields are free-typed. A single **Save changes** button appears at the bottom of the form only when `edits` is non-empty, and is the sole call site for `dispatch(updateProfile(...))`. It shows a spinner while `savingProfile` is true.

Empty phone is sent as `null`, not `""`.

### 4. Validation

Runs before the request fires:

| Field | Rule | Message |
|---|---|---|
| `name` | non-empty, ≤255 | "Name is required" / "Name is too long" |
| `email` | non-empty, email format, ≤255 | "Enter a valid email" / "Email is too long" |
| `phone_number` | ≤30 | "Phone number is too long" |

Picker-driven fields cannot produce invalid values, because the pickers are clamped to the contract ranges.

Failures render as inline red text under the offending field and block the request.

**Server errors** (e.g. 422 on a non-unique email) surface through the existing `getApiErrorMessage` helper and display under the offending field. `edits` is preserved on failure so the user can correct the value instead of losing what they typed.

## Data flow

```
GET /auth/profile ──> state.home.profile ──> PersonalDataView display
                                                    │
                                    user edits ─────┤
                                                    v
                                              edits (local)
                                                    │
                                          Save changes ──> validate
                                                    │
                                                    v
                              dispatch(updateProfile(dirtyFieldsOnly))
                                                    │
                                          PUT /auth/profile
                                                    │
                            fulfilled ──> state.home.profile = data
                                          edits = {}
```

## Testing

Jest with `@testing-library/react-native` is already configured (`jest-expo` preset, `__tests__/`).

- `updateProfile` thunk: sends only dirty fields; `fulfilled` unwraps `data`; `rejected` stores the error message; `savingProfile` transitions correctly.
- Display resolution: `edits` shadows the API value; a successful save clears `edits`.
- Validation: empty name, malformed email, and over-length phone each block dispatch and render a message.
- `StatPickerModal`: Cancel discards, Save lifts the value; gender's delayed `onSelectGender` does not close the sheet.
- Initial picker value parses from the API value and falls back to the component default when missing.

## Files touched

| File | Change |
|---|---|
| `src/slice/HomeSlice.tsx` | new `updateProfile` thunk, `savingProfile` state, reducer cases |
| `src/types/home.ts` | new `ProfileUpdatePayload` type |
| `src/screens/PersonalDataView/StatPickerModal.tsx` | new component |
| `src/screens/PersonalDataView/index.tsx` | editable fields, edit state, validation, Save |

No changes to the quiz screens or to the picker components themselves.
