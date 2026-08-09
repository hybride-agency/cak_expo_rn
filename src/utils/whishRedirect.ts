const APP_PAYMENT_REDIRECT = /^cak:\/\/payment\/(success|failure)(?:[?#]|$)/i;
const WEB_PAYMENT_REDIRECT =
  /^https:\/\/cak\.fit\/payment\/(success|failure)(?:[?#]|$)/i;

export const isWhishPaymentRedirect = (url: string): boolean =>
  APP_PAYMENT_REDIRECT.test(url) || WEB_PAYMENT_REDIRECT.test(url);
