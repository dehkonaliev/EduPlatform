/** A subscription plan offered to students (GET /api/payments/plans). */
export interface Plan {
  id: string;
  name: string;
  desc: string;
  period_days: number;
  /** Decimal serialized as a string by the backend. */
  price: string;
}

export type WalletTransactionType = "SUBSCRIPTION" | "PAID_COURSE" | "REPLENISH";

/** One wallet movement (GET /api/payments/my-wallet). Amounts are stored
 * positive; the sign is derived from the transaction type on the client. */
export interface WalletTransaction {
  id: string;
  transaction_type: WalletTransactionType;
  amount: string;
  created_at: string;
}

/** The student's wallet plus its full transaction history. */
export interface Wallet {
  id: string;
  wallet_id: string;
  balance: string;
  transactions: WalletTransaction[];
}

/** Plan info embedded in a Subscription. */
export interface SubscriptionPlanInfo {
  id: string;
  name: string;
  desc: string;
  price: string;
  period_days: number;
}

/** A subscription the student owns (GET /api/payments/my-subscriptions). */
export interface Subscription {
  id: string;
  plan: SubscriptionPlanInfo;
  created_at: string;
  expires_at: string;
  is_active: boolean;
}

/** Response of POST /api/payments/subscribe */
export interface NewSubscription {
  id: string;
  subscription_plan: string;
  created_at: string;
  expires_at: string;
}
