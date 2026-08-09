import type {AppDispatch} from '../store';
import {fetchWhishPayment} from '../slice/PaymentSlice';
import {getCurrentPlan, getHomepage, getProfile} from '../slice/HomeSlice';
import {getSubscriptionHistory} from '../slice/SubscriptionHistorySlice';
import {clearPendingPayment, loadPendingPayment} from './pendingPayment';
import {WHISH_TERMINAL_STATUSES} from '../types/payments';

/**
 * Reconciles a checkout that was left open when the app was killed or
 * backgrounded mid-payment. Call on cold start and whenever the app
 * returns to the foreground; it is a no-op if nothing is pending.
 */
export const resumePendingWhishPayment = async (dispatch: AppDispatch) => {
  const pending = await loadPendingPayment();

  if (!pending) {
    return;
  }

  const result = await dispatch(fetchWhishPayment({paymentId: pending.payment_id}));

  if (!fetchWhishPayment.fulfilled.match(result)) {
    // A 404 means this payment id no longer exists server-side (e.g. test
    // data reset) — retrying it forever would just keep popping the app's
    // global error modal on every launch/foreground. Any other failure
    // (network blip, 5xx) is left in place so the next check can retry.
    if (result.payload?.status === 404) {
      await clearPendingPayment();
    }
    return;
  }

  const payment = result.payload;

  if (!WHISH_TERMINAL_STATUSES.includes(payment.status)) {
    return;
  }

  await clearPendingPayment();

  if (payment.status === 'succeeded' || payment.status === 'refunded') {
    await Promise.all([
      dispatch(getProfile()),
      dispatch(getCurrentPlan()),
      dispatch(getHomepage()),
      dispatch(getSubscriptionHistory()),
    ]);
  }
};
