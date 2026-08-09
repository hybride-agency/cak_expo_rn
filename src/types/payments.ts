export type WhishPaymentStatus =
  | 'initiating'
  | 'pending'
  | 'succeeded'
  | 'failed'
  | 'refund_pending'
  | 'refunded';

export interface WhishPaymentSubscription {
  id: number;
  status: string;
  start_date: string | null;
  end_date: string | null;
}

export interface WhishPayment {
  id: number;
  external_id: string;
  provider: string;
  purpose: 'purchase' | 'renewal' | string;
  status: WhishPaymentStatus;
  plan_id: number | null;
  plan_name: string | null;
  plan_pricing_id: number | null;
  user_plan_id: number | null;
  source_user_plan_id?: number | null;
  amount: string | number;
  currency: string;
  collect_url: string | null;
  failure_code: string | null;
  failure_message: string | null;
  paid_at: string | null;
  refund_requested_at: string | null;
  refunded_at: string | null;
  refund_reason: string | null;
  created_at: string;
  subscription: WhishPaymentSubscription | null;
  can_retry: boolean;
}

export interface PendingWhishCheckout {
  payment_id: number;
  purpose: 'purchase' | 'renewal' | 'upgrade';
  idempotency_key: string;
  started_at: string;
}

export const WHISH_TERMINAL_STATUSES: readonly WhishPaymentStatus[] = [
  'succeeded',
  'failed',
  'refunded',
];
