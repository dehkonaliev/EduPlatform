import { PlusCircle, Repeat, ShoppingBag, type LucideIcon } from "lucide-react";
import type { WalletTransactionType } from "./types";

export interface TransactionTypeMeta {
  label: string;
  icon: LucideIcon;
  /** Amounts are stored positive; the sign tells the student if money came in
   * or went out. */
  sign: "+" | "-";
  badgeClassName: string;
  amountClassName: string;
}

export const TRANSACTION_TYPE_META: Record<WalletTransactionType, TransactionTypeMeta> = {
  REPLENISH: {
    label: "Replenish",
    icon: PlusCircle,
    sign: "+",
    badgeClassName: "bg-teal-500/10 text-teal-700 dark:text-teal-400",
    amountClassName: "text-teal-700 dark:text-teal-400",
  },
  SUBSCRIPTION: {
    label: "Subscription",
    icon: Repeat,
    sign: "-",
    badgeClassName: "bg-ember-500/10 text-ember-700 dark:text-ember-400",
    amountClassName: "text-ember-700 dark:text-ember-400",
  },
  PAID_COURSE: {
    label: "Course purchase",
    icon: ShoppingBag,
    sign: "-",
    badgeClassName: "bg-ink-500/10 text-ink-700 dark:text-ink-300",
    amountClassName: "text-ink-800 dark:text-ink-200",
  },
};

export function formatMoney(value: string | number): string {
  const num = typeof value === "string" ? Number.parseFloat(value) : value;
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  }).format(Number.isFinite(num) ? num : 0);
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(iso));
}

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}
