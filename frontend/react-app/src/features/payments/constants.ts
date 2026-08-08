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
    badgeClassName: "bg-green-500/10 text-green-700 dark:text-green-400",
    amountClassName: "text-green-700 dark:text-green-400",
  },
  SUBSCRIPTION: {
    label: "Subscription",
    icon: Repeat,
    sign: "-",
    badgeClassName: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
    amountClassName: "text-yellow-700 dark:text-yellow-400",
  },
  PAID_COURSE: {
    label: "Course purchase",
    icon: ShoppingBag,
    sign: "-",
    badgeClassName: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
    amountClassName: "text-yellow-700 dark:text-yellow-400",
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
