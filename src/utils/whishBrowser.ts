import {AppState, Platform} from 'react-native';
import * as WebBrowser from 'expo-web-browser';

const IOS_PAYMENT_RETURN_URL = 'cak://payment';

/**
 * Opens the Whish checkout and resolves only after the checkout browser is no
 * longer in front of the app.
 *
 * iOS uses an authentication session so the OS can recognize the `cak` return
 * scheme, close the Safari sheet, and hand control back to the app. Android's
 * browser resolves with `opened` as soon as the Custom Tab launches, so wait
 * for the app to leave and become active again before continuing.
 */
export const openWhishBrowserAsync = async (url: string) => {
  if (Platform.OS === 'ios') {
    return WebBrowser.openAuthSessionAsync(url, IOS_PAYMENT_RETURN_URL);
  }

  if (Platform.OS !== 'android') {
    return WebBrowser.openBrowserAsync(url);
  }

  let hasInitialAppState = AppState.currentState !== null;
  let didLeaveApp = hasInitialAppState && AppState.currentState !== 'active';
  let resolveReturnedToApp: (() => void) | undefined;
  const returnedToApp = new Promise<void>(resolve => {
    resolveReturnedToApp = resolve;
  });

  const subscription = AppState.addEventListener('change', nextState => {
    if (!hasInitialAppState) {
      hasInitialAppState = true;

      // React Native may emit the initial state as the first event. It is not
      // evidence that the checkout browser has closed.
      if (nextState === 'active') {
        return;
      }
    }

    if (nextState !== 'active') {
      didLeaveApp = true;
      return;
    }

    if (didLeaveApp) {
      resolveReturnedToApp?.();
    }
  });

  try {
    const result = await WebBrowser.openBrowserAsync(url);

    if (result.type !== 'opened') {
      return result;
    }

    await returnedToApp;
    return {type: WebBrowser.WebBrowserResultType.CANCEL} as const;
  } finally {
    subscription.remove();
  }
};
