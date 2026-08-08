import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButtonCmp, SocialMediaButtonCmp } from '../../components';
import { SCREEN_PADDING } from '../../../theme';
import { useNavigation } from '@react-navigation/native';
import {useAppDispatch, useAppSelector} from '../../store';
import {googleAuthUser} from '../../slice/LoginSlice';
import {getGoogleAuthPayload} from '../../utils/googleSignIn';
import {completeAuthSession} from '../../utils/completeAuthSession';

const WelcomeView = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const loading = useAppSelector(state => state.login.loading);

  const handleGoogleSignUp = async () => {
    if (loading) {
      return;
    }

    try {
      const googlePayload = await getGoogleAuthPayload();

      if (!googlePayload) {
        return;
      }

      const result = await dispatch(googleAuthUser(googlePayload));

      if (googleAuthUser.fulfilled.match(result)) {
        await completeAuthSession(dispatch, result.payload);
      }
    } catch (error) {
      Alert.alert(
        'Google sign-up failed',
        error instanceof Error ? error.message : 'Please try again.',
      );
    }
  };
  return (
    <ImageBackground
      source={require('../../../assets/images/welcomeBackground.png')}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.content}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Welcome to</Text>
            <Text style={styles.title}>CAK GYM</Text>
          </View>
          <View style={styles.descriptionContainer}>
            <Text style={styles.description}>
              Your fitness app to all things fitness
            </Text>
          </View>
          <View style={styles.buttonContainer}>
            <PrimaryButtonCmp
              text={'Sign up with your email'}
              onPress={function (): void {
                navigation.navigate('SignUpView' as never);
              }}
            />
            <SocialMediaButtonCmp
              icon={'apple'}
              text={'Sign up with Apple'}
              disabled
            />
            <SocialMediaButtonCmp
              icon={'google'}
              text={loading ? 'Signing up with Google...' : 'Sign up with Google'}
              onPress={handleGoogleSignUp}
              disabled={loading}
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.bottomContainer}
          onPress={() => {
            navigation.navigate('Login' as never);
          }}
        >
          <Text style={styles.bottomText}>
            Already have an account?{' '}
            <Text style={styles.bottomTextLink}>Sign in</Text>
          </Text>
        </TouchableOpacity>
      </SafeAreaView>

      {/* Bg-opacity */}
      <Image
        source={require('../../../assets/images/bg-opacity.png')}
        style={styles.bgOpacity}
      />
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  safeArea: {
    flex: 1,
    position: 'relative',
    zIndex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 30,
    color: '#fff',
    fontFamily: 'Raleway-ExtraBold',
  },
  bgOpacity: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: 0,
  },
  description: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Raleway-Medium',
  },
  descriptionContainer: {
    marginTop: 6,
    alignItems: 'center',
    marginBottom: 17,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: SCREEN_PADDING.left,
    gap: 15,
  },
  bottomContainer: {
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 53,
    left: 0,
    right: 0,
  },
  bottomText: {
    fontSize: 15,
    color: '#fff',
    fontFamily: 'Raleway-Medium',
  },
  bottomTextLink: {
    color: '#68FE00',
  },
});

export default WelcomeView;
