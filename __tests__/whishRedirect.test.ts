import {isWhishPaymentRedirect} from '../src/utils/whishRedirect';

describe('isWhishPaymentRedirect', () => {
  it.each([
    'cak://payment/success?payment_id=42',
    'cak://payment/failure?payment_id=42',
    'https://cak.fit/payment/success?payment_id=42',
    'https://cak.fit/payment/failure?payment_id=42',
  ])('accepts a CAK payment return URL: %s', url => {
    expect(isWhishPaymentRedirect(url)).toBe(true);
  });

  it.each([
    'cak://profile/success',
    'cak://payment/pending',
    'https://example.com/payment/success',
    'not-a-url',
  ])('rejects an unrelated URL: %s', url => {
    expect(isWhishPaymentRedirect(url)).toBe(false);
  });
});
