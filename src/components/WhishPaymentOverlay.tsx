import React from 'react';
import {ActivityIndicator, Modal, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import type {WhishFlowStatus} from '../hooks/useWhishCheckout';

const ACCENT = '#68FE00';
const BACKGROUND = '#171717';

interface Props {
  status: WhishFlowStatus;
  errorMessage?: string | null;
  onRetry?: () => void;
  onDismiss: () => void;
}

const COPY: Partial<Record<WhishFlowStatus, {title: string; subtitle: string}>> = {
  opening: {
    title: 'Opening secure checkout',
    subtitle: 'Complete your payment in the browser that just opened.',
  },
  polling: {
    title: 'Confirming your payment',
    subtitle: 'This can take a few seconds. Please stay on this screen.',
  },
  succeeded: {
    title: 'Payment successful',
    subtitle: 'Your plan is now active.',
  },
  failed: {
    title: 'Payment failed',
    subtitle: 'Your card or wallet was not charged. You can try again.',
  },
  abandoned: {
    title: 'Checkout closed',
    subtitle:
      'You closed the payment page before it finished. You can try again — if it did go through, it will apply automatically.',
  },
  timeout: {
    title: 'Still processing',
    subtitle: "We'll keep checking in the background. Reopen this screen to see the result.",
  },
  error: {
    title: 'Something went wrong',
    subtitle: 'We could not start the checkout. Please try again.',
  },
};

const WhishPaymentOverlay = ({status, errorMessage, onRetry, onDismiss}: Props) => {
  if (status === 'idle') {
    return null;
  }

  const copy = COPY[status];
  const isBusy = status === 'opening' || status === 'polling';
  const canRetry =
    (status === 'failed' || status === 'error' || status === 'abandoned') && !!onRetry;

  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {isBusy ? <ActivityIndicator size="large" color={ACCENT} style={styles.spinner} /> : null}
          <Text style={styles.title}>{copy?.title}</Text>
          <Text style={styles.subtitle}>{errorMessage || copy?.subtitle}</Text>

          {canRetry ? (
            <TouchableOpacity style={styles.primaryButton} onPress={onRetry}>
              <Text style={styles.primaryButtonText}>Try again</Text>
            </TouchableOpacity>
          ) : null}

          {!isBusy ? (
            <TouchableOpacity style={styles.secondaryButton} onPress={onDismiss}>
              <Text style={styles.secondaryButtonText}>
                {status === 'succeeded' ? 'Continue' : 'Close'}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  card: {
    width: '100%',
    backgroundColor: BACKGROUND,
    borderRadius: 20,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  spinner: {marginBottom: 20},
  title: {
    color: '#FFF',
    fontSize: 18,
    fontFamily: 'Raleway-Bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: '#BBB',
    fontSize: 13,
    fontFamily: 'Raleway-Medium',
    textAlign: 'center',
    marginBottom: 24,
  },
  primaryButton: {
    width: '100%',
    paddingVertical: 16,
    backgroundColor: ACCENT,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: BACKGROUND,
    fontSize: 15,
    fontFamily: 'Raleway-Bold',
  },
  secondaryButton: {
    width: '100%',
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#BBB',
    fontSize: 14,
    fontFamily: 'Raleway-Medium',
  },
});

export default WhishPaymentOverlay;
