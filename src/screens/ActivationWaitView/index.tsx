import React, {useCallback, useEffect, useState} from 'react';
import {ActivityIndicator, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useAppDispatch} from '../../store';
import {refreshAuthenticatedSession} from '../../utils/completeAuthSession';

const ACCENT = '#68FE00';
const BACKGROUND = '#171717';

const ActivationWaitView = ({awaitingGymPayment = false}: {awaitingGymPayment?: boolean}) => {
  const dispatch = useAppDispatch();
  const [checking, setChecking] = useState(false);

  const checkStatus = useCallback(async () => {
    if (checking) return;
    setChecking(true);
    try {
      await refreshAuthenticatedSession(dispatch);
    } finally {
      setChecking(false);
    }
  }, [checking, dispatch]);

  useEffect(() => {
    const timer = setInterval(() => void checkStatus(), 15000);
    return () => clearInterval(timer);
  }, [checkStatus]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.card}>
        <View style={styles.spinnerCircle}>
          <ActivityIndicator color={ACCENT} size="large" />
        </View>
        <Text style={styles.title}>
          {awaitingGymPayment ? 'Your gym payment is awaiting confirmation' : 'Your 90-day plan is being prepared'}
        </Text>
        <Text style={styles.description}>
          {awaitingGymPayment
            ? 'Visit the gym to pay. A CAK administrator will confirm whether payment was received before preparing and activating your program.'
            : 'Payment is complete. A CAK administrator is reviewing your quiz, assigning your coach, and confirming your meal and workout plan before access is opened.'}
        </Text>
        <Text style={styles.hint}>
          This page checks automatically. You can safely close the app and return later.
        </Text>
        <TouchableOpacity
          activeOpacity={0.8}
          disabled={checking}
          onPress={() => void checkStatus()}
          style={[styles.button, checking && styles.buttonDisabled]}>
          <Text style={styles.buttonText}>{checking ? 'Checking…' : 'Check activation status'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BACKGROUND,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    borderRadius: 28,
    paddingHorizontal: 28,
    paddingVertical: 38,
    backgroundColor: '#292929',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
  },
  spinnerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(104,254,0,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: 28,
    color: '#FFF',
    fontSize: 28,
    lineHeight: 34,
    textAlign: 'center',
    fontFamily: 'Raleway-Black',
  },
  description: {
    marginTop: 16,
    color: '#C4C4C4',
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'center',
    fontFamily: 'Raleway-Medium',
  },
  hint: {
    marginTop: 14,
    color: '#969696',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    fontFamily: 'Raleway-Regular',
  },
  button: {
    marginTop: 30,
    width: '100%',
    height: 54,
    borderRadius: 27,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {opacity: 0.65},
  buttonText: {color: BACKGROUND, fontSize: 16, fontFamily: 'Raleway-Bold'},
});

export default ActivationWaitView;
