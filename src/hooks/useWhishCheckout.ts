import {useCallback, useState} from 'react';
import {reloadAppAsync} from 'expo';
import {useAppDispatch} from '../store';
import {
  createWhishCheckout,
  createWhishRenewal,
  fetchWhishPayment,
  setCurrentPayment,
} from '../slice/PaymentSlice';
import {getCurrentPlan, getHomepage} from '../slice/HomeSlice';
import {getSubscriptionHistory} from '../slice/SubscriptionHistorySlice';
import {refreshAuthenticatedSession} from '../utils/completeAuthSession';
import {generateUuid} from '../utils/uuid';
import {clearPendingPayment, savePendingPayment} from '../utils/pendingPayment';
import {WHISH_TERMINAL_STATUSES, WhishPayment} from '../types/payments';
import {openWhishBrowserAsync} from '../utils/whishBrowser';

export type WhishFlowStatus =
  | 'idle'
  | 'opening'
  | 'polling'
  | 'succeeded'
  | 'failed'
  | 'abandoned'
  | 'timeout'
  | 'error';

const POLL_ATTEMPTS = 20;
const POLL_INTERVAL_MS = 2500;

// Once the browser is gone, make one authoritative check with Laravel. A
// terminal result is shown normally; a still-pending checkout is treated as
// closed so the user is never left staring at a confirmation loader.
const QUICK_POLL_ATTEMPTS = 1;
type CheckoutPurpose = 'purchase' | 'renewal' | 'upgrade';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const useWhishCheckout = () => {
  const dispatch = useAppDispatch();
  const [status, setStatus] = useState<WhishFlowStatus>('idle');
  const [payment, setPayment] = useState<WhishPayment | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refreshEntitlements = useCallback(async () => {
    await Promise.all([
      dispatch(getCurrentPlan()),
      dispatch(getHomepage()),
      dispatch(getSubscriptionHistory()),
      refreshAuthenticatedSession(dispatch),
    ]);
  }, [dispatch]);

  const pollUntilTerminal = useCallback(
    async (paymentId: number, options?: {quick?: boolean}) => {
      setStatus('polling');

      const attempts = options?.quick ? QUICK_POLL_ATTEMPTS : POLL_ATTEMPTS;

      for (let attempt = 0; attempt < attempts; attempt += 1) {
        const result = await dispatch(fetchWhishPayment({paymentId}));

        if (fetchWhishPayment.fulfilled.match(result)) {
          const latest = result.payload;
          setPayment(latest);

          if (WHISH_TERMINAL_STATUSES.includes(latest.status)) {
            await clearPendingPayment();

            if (latest.status === 'succeeded' || latest.status === 'refunded') {
              await refreshEntitlements();
            }

            const succeeded = latest.status === 'succeeded';
            setStatus(succeeded ? 'succeeded' : 'failed');

            if (succeeded) {
              // The refreshed session is already in SecureStore. Rebuilding
              // the JS app makes the normal bootstrap restore it and remounts
              // the tab navigator/home screen from the new plan entitlement.
              await reloadAppAsync('plan-entitlement-updated').catch(
                () => undefined,
              );
            }
            return;
          }
        } else if (result.payload?.status === 404) {
          // The payment id no longer exists server-side — stop polling
          // instead of burning the full attempt budget against a dead
          // reference.
          await clearPendingPayment();
          setStatus('error');
          setError('This checkout could not be found. Please try again.');
          return;
        }

        if (attempt < attempts - 1) {
          await sleep(POLL_INTERVAL_MS);
        }
      }

      // The payment record stays pending in storage either way, so a real
      // late success/failure still gets picked up and reconciled by
      // resumePendingWhishPayment on the next foreground or app launch.
      setStatus(options?.quick ? 'abandoned' : 'timeout');
    },
    [dispatch, refreshEntitlements],
  );

  const afterCheckoutCreated = useCallback(
    async (purpose: CheckoutPurpose, idempotencyKey: string, createdPayment: WhishPayment) => {
      setPayment(createdPayment);

      if (!createdPayment.collect_url) {
        setStatus('error');
        setError('Whish did not return a checkout link.');
        return;
      }

      await savePendingPayment({
        payment_id: createdPayment.id,
        purpose,
        idempotency_key: idempotencyKey,
        started_at: new Date().toISOString(),
      });

      const browserResult = await openWhishBrowserAsync(createdPayment.collect_url);

      if (browserResult.type === 'locked') {
        setStatus('error');
        setError('Another browser window is already open. Close it and try again.');
        return;
      }

      await pollUntilTerminal(createdPayment.id, {quick: true});
    },
    [pollUntilTerminal],
  );

  // Whish's own ambiguous error_code "500" means the create call itself
  // failed to confirm, but Laravel had already created the payment row
  // before calling out. Reopening a new checkout would risk a duplicate,
  // so poll the existing payment id for its real status instead.
  const recoverAmbiguousFailure = useCallback(
    async (
      purpose: CheckoutPurpose,
      idempotencyKey: string,
      paymentId: number,
      fallbackMessage: string,
    ) => {
      await savePendingPayment({
        payment_id: paymentId,
        purpose,
        idempotency_key: idempotencyKey,
        started_at: new Date().toISOString(),
      });

      const result = await dispatch(fetchWhishPayment({paymentId}));

      if (!fetchWhishPayment.fulfilled.match(result)) {
        setStatus('error');
        setError(fallbackMessage);
        return;
      }

      setPayment(result.payload);
      await pollUntilTerminal(paymentId);
    },
    [dispatch, pollUntilTerminal],
  );

  const startPurchase = useCallback(
    async (planId: number, planPricingId: number) => {
      setError(null);
      setStatus('opening');

      const idempotencyKey = generateUuid();
      const action = await dispatch(
        createWhishCheckout({
          plan_id: planId,
          plan_pricing_id: planPricingId,
          idempotencyKey,
        }),
      );

      if (!createWhishCheckout.fulfilled.match(action)) {
        const rejection = action.payload;

        if (rejection?.paymentId) {
          await recoverAmbiguousFailure('purchase', idempotencyKey, rejection.paymentId, rejection.message);
          return;
        }

        setStatus('error');
        setError(rejection?.message ?? 'Failed to start checkout');
        return;
      }

      await afterCheckoutCreated(
        action.payload.purpose === 'upgrade' ? 'upgrade' : 'purchase',
        idempotencyKey,
        action.payload,
      );
    },
    [afterCheckoutCreated, dispatch, recoverAmbiguousFailure],
  );

  const startRenewal = useCallback(
    async (userPlanId: number, planPricingId?: number) => {
      setError(null);
      setStatus('opening');

      const idempotencyKey = generateUuid();
      const action = await dispatch(
        createWhishRenewal({
          userPlanId,
          plan_pricing_id: planPricingId,
          idempotencyKey,
        }),
      );

      if (!createWhishRenewal.fulfilled.match(action)) {
        const rejection = action.payload;

        if (rejection?.paymentId) {
          await recoverAmbiguousFailure('renewal', idempotencyKey, rejection.paymentId, rejection.message);
          return;
        }

        setStatus('error');
        setError(rejection?.message ?? 'Failed to start renewal');
        return;
      }

      await afterCheckoutCreated('renewal', idempotencyKey, action.payload);
    },
    [afterCheckoutCreated, dispatch, recoverAmbiguousFailure],
  );

  const reset = useCallback(() => {
    setStatus('idle');
    setPayment(null);
    setError(null);
    dispatch(setCurrentPayment(null));
  }, [dispatch]);

  return {status, payment, error, startPurchase, startRenewal, reset};
};
