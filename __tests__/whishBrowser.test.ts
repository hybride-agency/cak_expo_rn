import {AppState, Platform} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import {openWhishBrowserAsync} from '../src/utils/whishBrowser';

const mockRemove = jest.fn();
let mockAppStateListener:
  | ((state: 'active' | 'background' | 'inactive' | 'unknown' | 'extension') => void)
  | undefined;

jest.mock('expo-web-browser', () => ({
  openAuthSessionAsync: jest.fn(),
  openBrowserAsync: jest.fn(),
  WebBrowserResultType: {CANCEL: 'cancel', OPENED: 'opened'},
}));

const mockOpenAuthSessionAsync = jest.mocked(WebBrowser.openAuthSessionAsync);
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

  it('uses an iOS auth session registered for the CAK payment return URL', async () => {
    Object.defineProperty(Platform, 'OS', {value: 'ios', configurable: true});
    mockOpenAuthSessionAsync.mockResolvedValue({
      type: 'success',
      url: 'cak://payment/success?payment_id=42',
    });

    await expect(
      openWhishBrowserAsync('https://whish.test/checkout'),
    ).resolves.toEqual({
      type: 'success',
      url: 'cak://payment/success?payment_id=42',
    });
    expect(mockOpenAuthSessionAsync).toHaveBeenCalledWith(
      'https://whish.test/checkout',
      'cak://payment',
    );
    expect(mockOpenBrowserAsync).not.toHaveBeenCalled();
    expect(mockAppStateListener).toBeUndefined();
  });
});
