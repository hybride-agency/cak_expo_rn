# CAK React Native CLI to Expo SDK 57 Migration Audit

Audit date: 2026-08-02

Source project (read-only): `/Users/rogerselwan/Desktop/cak_rn`

Target project: `/Users/rogerselwan/Desktop/cak`

## Baseline

- Source: React Native 0.80.1, React 19.1, TypeScript 5.0.4, new architecture and Hermes enabled.
- Target: Expo SDK 57.0.9, React Native 0.86.2, React 19.2.3, TypeScript 6.0.3.
- Expo SDK 57 requires React Native 0.86, React 19.2.3, Node 22.13 or newer, Android compile/target SDK 36, and iOS 16.4 or newer.
- The target currently uses Expo Router, but the source has conditional root navigators plus nested React Navigation stacks/tabs. Retaining React Navigation is safer and preserves route names, parameters, back behavior, and tab visibility rules.
- A development build is required because native Google Sign-In is actively called by the login and sign-up screens. Its official Expo config plugin is supported, but the native module is unavailable in Expo Go.
- No Firebase SDK/configuration, push notification integration, deep-link handler, background task, camera, location API, analytics, crash reporting, or payment SDK was found in active source code.

## Dependency and native-feature matrix

| Old dependency or feature | Current usage | Expo-compatible replacement | Installation command | Configuration required | Migration risk | Classification |
| --- | --- | --- | --- | --- | --- | --- |
| React Native 0.80.1 / React 19.1 | Application runtime | Expo SDK 57 managed versions: RN 0.86.2 / React 19.2.3 | Already installed; `npx expo install --fix` | Keep Expo-managed versions | Medium: RN and TS behavior changes | Replace with Expo-managed version |
| `@react-navigation/native` | Root container and 18 screen/navigation imports | Same package | `npm install @react-navigation/native` | Standard container; no Router conversion | Low | Directly compatible |
| `@react-navigation/native-stack` | Five native stack navigators | Same package | `npm install @react-navigation/native-stack` | Uses Expo-managed screens/safe-area packages | Low | Directly compatible |
| `@react-navigation/bottom-tabs` | Four conditional main tabs | Same package | `npm install @react-navigation/bottom-tabs` | Preserve nested route/tab-bar hiding logic | Low | Directly compatible |
| `@react-navigation/elements` | No source imports | Remove | None | None | None | Unused and removable |
| `@reduxjs/toolkit` | Seven slices and store | Same package | `npm install @reduxjs/toolkit` | None | Low | Directly compatible |
| `react-redux` | Provider and typed hooks | Same package | `npm install react-redux` | None | Low | Directly compatible |
| `axios` | API client, interceptors, 22 active endpoint calls | Same package | `npm install axios` | Move base URL to `EXPO_PUBLIC_API_BASE_URL` | Medium: backend/credentials needed | Directly compatible |
| `realm` | One key/value Realm used only for persisted auth session | `expo-secure-store` | `npx expo install expo-secure-store` | Add built-in config plugin; no biometric prompt required | Medium: storage engine changes; existing Realm data is not imported | Replace with Expo package |
| `@react-native-google-signin/google-signin` | Native Google login/sign-up and ID-token exchange | Same package with official Expo plugin | `npm install @react-native-google-signin/google-signin` | `iosUrlScheme`, web/iOS client IDs, platform OAuth setup; rebuild native client | High: external OAuth credentials; physical device recommended | Requires an Expo config plugin and development build |
| `react-native-device-info` | Only obtains a device model/name for Google auth payload | `expo-device` | Already installed | Use `Device.modelName` fallback | Low | Replace with Expo package |
| `react-native-gesture-handler` | Root wrapper and startup side effect | Expo-managed same package | Already installed at `~2.32.0` | Import before app code | Low | Directly compatible |
| `react-native-safe-area-context` | Provider and 23 screens | Expo-managed same package | Already installed at `~5.7.0` | Root provider retained | Low | Directly compatible |
| `react-native-screens` | React Navigation peer dependency; no direct imports | Expo-managed same package | Already installed at `~4.26.0` | None | Low | Directly compatible |
| `react-native-svg` | 16 SVG components and 16 screen/icon usages | Expo-managed same package | `npx expo install react-native-svg` | None | Low | Directly compatible |
| `react-native-svg-uri` | One remote SVG logo in tutorial | `SvgUri` exported by `react-native-svg` | No additional install | Update import/props from `source` to `uri` | Low | Replace with another compatible package |
| `react-native-swiper-flatlist` | Tutorial horizontal paging and pagination | Same JS package | `npm install react-native-swiper-flatlist` | Verify against RN 0.86 | Medium | Directly compatible |
| `react-native-render-html` | Tutorial rich-text title rendering | Same package | `npm install react-native-render-html` | Keep custom-font registration | Low | Directly compatible |
| `react-native-otp-entry` | Four-digit password-reset OTP input | Same package | `npm install react-native-otp-entry` | Verify peer support and remove obsolete ignored prop typing | Medium | Directly compatible |
| `@react-native-community/netinfo` | No source imports | Remove | None | Android network-state permission is not needed for active JS behavior | None | Unused and removable |
| `@react-native/new-app-screen` | No source imports | Remove | None | None | None | Unused and removable |
| `react-native-fast-image` | No source imports | Remove; retain React Native `Image` | None | None | None | Unused and removable |
| `react-native-responsive-fontsize` | No source imports | Remove; retain existing local `normalizeFont` utility | None | None | None | Unused and removable |
| `react-native-ssl-pinning` | No source imports; Podfile contains only compatibility patches | Remove | None | No pin set/certificate exists to preserve | None | Unused and removable |
| `add` | No package import (`add` matches are ordinary words such as `padding`) | Remove | None | None | None | Unused and removable |
| `yarn` | No runtime import | Remove from dependencies | None | npm remains target package manager | None | Unused and removable |
| Expo Router and template UI packages | Only used by the empty target template | Remove Router entry and template-only UI packages/code | `npm uninstall expo-router @expo/ui expo-glass-effect expo-symbols` (plus other unused template modules after verification) | Register `App.tsx` with Expo entry point | Low | Unused and removable |
| Raleway font family (18 files) | Font family names used throughout UI | `expo-font` config plugin plus runtime loading guard | Already installed | Embed all source font files and hold splash until ready | Low | Replace native manual linking with Expo config plugin |
| Native splash screen | Android Core SplashScreen and iOS storyboard | `expo-splash-screen` | Already installed | Dark `#171717` background, source logo, contain sizing | Medium: final appearance needs release-build validation | Replace with Expo package/config plugin |
| App icons | Android mipmaps and iOS app icon set | Expo app config assets | No install | Use source 1024×1024 icon; generate/choose adaptive icon treatment | Medium: adaptive Android crop needs device check | Replace native files with Expo app config |
| Android application ID | `com.cak_rn` | Preserve `com.cak_rn` | None | Already set in target config | Low | Directly compatible configuration |
| iOS bundle ID | `com.cakfit` | Preserve `com.cakfit` | None | Target currently says `com.cak`; update only target and report change | Medium: signing/OAuth association | Directly compatible configuration |
| Version metadata | Android 1.0 (code 1); iOS 0.1 (build 1) | Expo app config | None | Use a single reported app version; preserve build numbers | Low | Directly compatible configuration |
| Android cleartext traffic | Enabled globally in source | Do not enable unless a real HTTP endpoint requires it | None | API and assets are HTTPS; local Expo development is handled by tooling | Low | Unused and removable native exception |
| iOS location permission text | Present in Info.plist, but no location calls/imports | Remove permission | None | None | None | Unused and removable |
| Google URL callback in AppDelegate | Handles native Google Sign-In callback | Google Sign-In config plugin | Included with Google package | Configure reversed iOS client scheme | High | Requires an Expo config plugin and development build |
| Native splash call in MainActivity | Calls Android splash API | `expo-splash-screen` config/runtime API | Already installed | No manual native edits | Low | Replace with Expo package |
| Podfile custom AFNetworking/fmt/codegen patches | Supports old dependency/build combination | Do not migrate generated native patches | None | Validate clean Expo prebuild via plugin-generated native projects | Medium | Unused in Expo CNG unless a build proves otherwise |
| Remote tutorial/background assets | HTTPS CloudFront URLs in source | React Native Image/ImageBackground and `react-native-svg` `SvgUri` | None | Network connection required; provide existing loading/error behavior | Medium | Directly compatible |
| Notifications UI | Profile toggle and static notifications screen only | Preserve as UI/local component state | None | No OS permission or push service exists in source | Low | Directly compatible (UI only) |
| Deep linking | No source linking configuration or handlers; only Google callback | Preserve app scheme and Google callback only | None | `scheme: "cak"`; React Navigation can add linking later if product URLs exist | Low | No app deep-link feature found |
| Apple Sign-In buttons | iOS-only buttons have empty callbacks and no backend endpoint/package | Preserve visual affordance only until product credentials/backend contract exist; explicitly report source limitation | None during parity migration | Cannot implement without Apple capability and server endpoint | High | Source feature is non-functional; external product decision required |
| Contact and membership links | Three contact rows and membership link have empty callbacks in source | Preserve UI; external addresses/URLs were not present | None | Requires product-provided destinations | Medium | Source feature is non-functional; external data required |

## Application architecture found

- Conditional app entry flow: tutorial → welcome/authentication → quiz → plan selection/purchase → main application.
- Main application: nested bottom tabs (`Home`, conditional `Meal`, conditional `Workout`, `Profile`) with nested native stacks.
- Redux slices: login, welcome flow, quiz/questions, sign-up identity/token, plans/purchase, homepage/profile/meal/workout data, subscription history.
- API: Axios client with bearer token injection, multipart handling, one network retry, centralized HTTP errors, and 401/403 session reset.
- Persistence: a single serialized authentication/session object.
- Forms: email/password login, registration validation, forgot-password, OTP, reset-password, quiz controls, workout survey inputs.
- No build variants/flavors or environment library were found.

## Screen checklist (audit baseline)

| Screen | Source implementation found | Navigation flow | Native/external dependency | Migration status |
| --- | ---: | --- | --- | --- |
| TutorialView | Yes | Tutorial root | Remote images/SVG, swiper, HTML renderer | Pending |
| WelcomeView | Yes | Auth welcome | Image assets | Pending |
| LoginView | Yes | Auth stack | Google Sign-In | Pending |
| SignUpView | Yes | Auth stack | Google Sign-In | Pending |
| ForgotPasswordView | Yes | Auth stack | API | Pending |
| OtpView | Yes | Auth stack | OTP component, API | Pending |
| NewPasswordView | Yes | Auth stack | API | Pending |
| QuestionListView | Yes | Quiz stack | API, image prefetch | Pending |
| TdeeEstimationView | Yes | Quiz stack | None | Pending |
| GenerateView | Yes | Quiz stack | Animation, API | Pending |
| PlanListView | Yes | Plan stack | API | Pending |
| PlanView | Yes | Plan stack | API | Pending |
| SuccessView | Yes | Plan stack | None | Pending |
| HomepageListView | Yes | Home tab/root | API, remote images | Pending |
| MealPlannerView | Yes | Meal tab | API | Pending |
| FitnessPlanView | Yes | Workout tab | API | Pending |
| WorkoutSectionView | Yes | Home/workout flow | API | Pending |
| ExercisePlayerView | Yes | Home/workout flow | Remote image, API | Pending |
| WorkoutSuccessView | Yes | Home/workout flow | None | Pending |
| WorkoutSurveyView | Yes | Home/workout flow | API | Pending |
| ProfileView | Yes | Profile tab | Redux/session | Pending |
| ContactUsView | Yes | Profile stack | Missing source destinations | Pending |
| PrivacyPolicyView | Yes | Profile stack | None | Pending |
| NotificationsView | Yes | Profile stack | UI only | Pending |
| AboutUsView | Yes | Profile stack | None | Pending |
| MembershipView | Yes | Profile stack | Redux; missing source destination | Pending |
| PersonalDataView | Yes | Profile stack | Redux | Pending |
| SubscriptionHistoryView | Yes | Profile stack | API | Pending |

## Workflow decision

Use Expo Continuous Native Generation with an Expo development build. Do not commit or manually edit generated `ios/` and `android/` directories. The development build is required solely by the active native Google Sign-In integration. The remainder of the migrated app is compatible with Expo Go, but Google authentication is not.

## Planned public environment variables

- `EXPO_PUBLIC_API_BASE_URL` — client-visible HTTPS API origin (not a secret).
- `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` — OAuth client identifier (not a secret).
- `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` — OAuth client identifier (not a secret).
- `EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME` — reversed iOS OAuth client identifier used at native build time (not a secret).

No server-side secrets were found in the source. OAuth client IDs are identifiers rather than secrets, but their platform restrictions still need to be configured in Google Cloud.

## Documentation basis

- Expo SDK 57 reference: <https://docs.expo.dev/versions/v57.0.0/>
- Expo app configuration: <https://docs.expo.dev/versions/v57.0.0/config/app/>
- Expo Font: <https://docs.expo.dev/versions/v57.0.0/sdk/font/>
- Expo Splash Screen: <https://docs.expo.dev/versions/v57.0.0/sdk/splash-screen/>
- Expo SecureStore: <https://docs.expo.dev/versions/v57.0.0/sdk/securestore/>
- Google Sign-In Expo setup: <https://react-native-google-signin.github.io/docs/setting-up/expo>
