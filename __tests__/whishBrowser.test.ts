import {AppState, Platform} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import {openWhishBrowserAsync} from '../src/utils/whishBrowser';

const mockRemove = jest.fn();
let mockAppStateListener:
  | ((state: 'active' | 'background' | 'inactive' | 'unknown' | 'extension') => void)
  | undefined;

jest.mock('expo-web-browser', () => ({
  openBrowserAsync: jest.fn(),
  WebBrowserResultType: {CANCEL: 'cancel', OPENED: 'opened'},
}));

const mockOpenBrowserAsync = jest.mocked(WebBrowser.openBrowserAsync);

describe('openWhishBrowserAsync', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAppStateListener = undefined;
    Object.defineProperty(Platform, 'OS', {value: 'android', configurable: true});
    Object.defineProperty(AppState, 'currentState', {
      value: 'active',
      configurable: true,
    });
    jest.spyOn(AppState, 'addEventListener').mockImplementation(
      (_event, listener) => {
        mockAppStateListener = listener;
        return {remove: mockRemove};
      },
    );
  });

  it('waits for the Android app to return before resolving', async () => {
    mockOpenBrowserAsync.mockResolvedValue({
      type: WebBrowser.WebBrowserResultType.OPENED,
    });
    let settled = false;

    const resultPromise = openWhishBrowserAsync('https://whish.test/checkout');
    void resultPromise.then(() => {
      settled = true;
    });

    await Promise.resolve();
    expect(settled).toBe(false);

    mockAppStateListener?.('background');
    mockAppStateListener?.('active');

    await expect(resultPromise).resolves.toEqual({type: 'cancel'});
    expect(mockRemove).toHaveBeenCalledTimes(1);
  });

  it('ignores React Native reporting its initial active state', async () => {
    Object.defineProperty(AppState, 'currentState', {
      value: null,
      configurable: true,
    });
    mockOpenBrowserAsync.mockResolvedValue({
      type: WebBrowser.WebBrowserResultType.OPENED,
    });
    let settled = false;

    const resultPromise = openWhishBrowserAsync('https://whish.test/checkout');
    void resultPromise.then(() => {
      settled = true;
    });

    await Promise.resolve();
    mockAppStateListener?.('active');
    await Promise.resolve();
    expect(settled).toBe(false);

    mockAppStateListener?.('background');
    mockAppStateListener?.('active');

    await expect(resultPromise).resolves.toEqual({type: 'cancel'});
  });

  it('uses the native waiting behavior on iOS', async () => {
    Object.defineProperty(Platform, 'OS', {value: 'ios', configurable: true});
    mockOpenBrowserAsync.mockResolvedValue({
      type: WebBrowser.WebBrowserResultType.CANCEL,
    });

    await expect(
      openWhishBrowserAsync('https://whish.test/checkout'),
    ).resolves.toEqual({type: 'cancel'});
    expect(mockAppStateListener).toBeUndefined();
  });
});
