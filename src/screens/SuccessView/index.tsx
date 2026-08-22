import { View, Text, StyleSheet, ImageBackground } from 'react-native';
import Success_Logo_SVG from '../../../assets/SVG/Success_Logo_SVG';
import ThirdButtonCmp from '../../components/ThirdButtonCmp';
import { SCREEN_PADDING } from '../../../theme';
import { useDispatch } from 'react-redux';
import { setIsPlan, setIsQuestion, setIsWelcome } from '../../slice/WelcomeSlice';

const SuccessView = () => {
    const dispatch = useDispatch();
  return (
    <ImageBackground
      source={require('../../../assets/images/generate.png')}
      style={styles.imageBackground}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.successLogoContainer}>
            <Success_Logo_SVG />
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Congratulations!</Text>
            <Text style={styles.description}>
              Your payment is confirmed. A CAK administrator is now reviewing
              and preparing your personalized 90-day plan.
            </Text>
            <View style={styles.buttonContainer}>
          <ThirdButtonCmp text="Close" onPress={() => {
            dispatch(setIsPlan(false));
            dispatch(setIsQuestion(false));
            dispatch(setIsWelcome(true));
          }} />
        </View>
          </View>

         
        </View>
      </View>
   
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#171717',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 30,
    fontFamily: 'Raleway-Black',
    color: '#fff',
    includeFontPadding: false,
    textAlign: 'center',
  },
  titleContainer: {
    marginTop: 31,
    position: 'relative'
  },
  imageBackground: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#171717',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(23,23,23,0.2)', // Semi-transparent #171717 overlay
    justifyContent: 'center',
    alignItems: 'center',
  },
  successLogoContainer: {
    backgroundColor: '#000000',
    padding: 20,
    borderRadius: 100,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Raleway-Regular',
    color: '#fff',
    includeFontPadding: false,
    textAlign: 'center',
    marginTop: 22,
    marginBottom: 101,
  },
  buttonContainer: {
    width: '100%',
    position: 'absolute',
    bottom: -56,
    paddingHorizontal: SCREEN_PADDING.left
  },
});

export default SuccessView;
