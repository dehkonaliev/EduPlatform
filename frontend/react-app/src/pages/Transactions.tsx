import { useState } from "react";
import { Copy, CreditCard, ReceiptText, Wallet } from "lucide-react";
import { AppNavbar } from "../AppNavbar";
import { useToast } from "../providers/ToastProvider";
import { useWallet } from "../features/payments/hooks/useWallet";
import { TRANSACTION_TYPE_META, formatDateTime, formatMoney } from "../features/payments/constants";
import type { WalletTransaction } from "../features/payments/types";

export default function TransactionsPage() {
  const { wallet, isLoading, error } = useWallet();
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

  async function copyWalletId(walletId: string) {
    try {
      await navigator.clipboard.writeText(walletId);
      setCopied(true);
      showToast("Wallet ID copied");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      showToast("Couldn't copy wallet ID", "error");
    }
  }

  return (
    <>
      <AppNavbar />

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div>
          <h1 className="font-display text-3xl italic text-ink-950 dark:text-paper-50">
            Transactions
          </h1>
          <p className="mt-1 text-sm text-ink-600 dark:text-ink-300">
            Your wallet balance and payment history.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400"
          >
            {error}
          </div>
        )}

        <div className="mt-6">
          {isLoading ? (
            <div className="space-y-5">
              <div className="h-28 animate-pulse rounded-2xl border border-paper-200 bg-white dark:border-ink-800 dark:bg-ink-900" />
              <div className="h-64 animate-pulse rounded-2xl border border-paper-200 bg-white dark:border-ink-800 dark:bg-ink-900" />
            </div>
          ) : wallet ? (
            <>
              <WalletCard
                balance={wallet.balance}
                walletId={wallet.wallet_id}
                copied={copied}
                onCopy={() => copyWalletId(wallet.wallet_id)}
              />
              <TransactionList transactions={wallet.transactions} />
            </>
          ) : null}
        </div>
      </main>
    </>
  );
}

function WalletCard({
  balance,
  walletId,
  copied,
  onCopy,
}: {
  balance: string;
  walletId: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-6 rounded-2xl bg-ink-900 p-6 text-paper-50 dark:bg-ink-950 dark:ring-1 dark:ring-ink-800">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ember-400/15 text-ember-300">
        <Wallet size={24} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-[0.15em] text-ink-400">
          Available balance
        </p>
        <p className="mt-1 font-display text-3xl italic">{formatMoney(balance)}</p>
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-[0.15em] text-ink-400">
          Wallet ID
        </p>
        <button
          type="button"
          onClick={onCopy}
          className="mt-1 inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5 text-sm font-mono font-semibold tracking-wide transition-colors hover:bg-white/15"
          title="Copy wallet ID"
        >
          {walletId}
          <Copy size={14} className={copied ? "text-teal-400" : "text-ink-400"} />
        </button>
      </div>
    </div>
  );
}

function TransactionList({ transactions }: { transactions: WalletTransaction[] }) {
  if (transactions.length === 0) {
    return (
      <div className="mt-5 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-paper-300 bg-white/50 px-6 py-16 text-center dark:border-ink-800 dark:bg-ink-900/40">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-paper-200 text-ink-500 dark:bg-ink-800 dark:text-ink-300">
          <ReceiptText size={22} />
        </span>
        <p className="text-sm font-medium text-ink-800 dark:text-paper-100">
          No transactions yet
        </p>
        <p className="text-xs text-ink-500 dark:text-ink-400">
          Subscriptions and course purchases will show up here.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-5 overflow-hidden rounded-2xl border border-paper-200 bg-white dark:border-ink-800 dark:bg-ink-900">
      <div className="flex items-center gap-2 border-b border-paper-200 px-5 py-4 dark:border-ink-800">
        <CreditCard size={16} className="text-ink-400 dark:text-ink-500" />
        <h2 className="text-sm font-semibold text-ink-950 dark:text-paper-50">
          Transaction history
        </h2>
      </div>

      <ul className="divide-y divide-paper-200 dark:divide-ink-800">
        {transactions.map((transaction) => (
          <TransactionRow key={transaction.id} transaction={transaction} />
        ))}
      </ul>
    </div>
  );
}

function TransactionRow({ transaction }: { transaction: WalletTransaction }) {
  const meta = TRANSACTION_TYPE_META[transaction.transaction_type];
  const Icon = meta.icon;

  return (
    <li className="flex items-center gap-4 px-5 py-4">
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${meta.badgeClassName}`}>
        <Icon size={16} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-ink-900 dark:text-paper-50">
          {meta.label}
        </p>
        <p className="mt-0.5 text-xs text-ink-500 dark:text-ink-400">
          {formatDateTime(transaction.created_at)}
        </p>
      </div>
      <p className={`shrink-0 text-sm font-semibold ${meta.amountClassName}`}>
        {meta.sign}
        {formatMoney(transaction.amount)}
      </p>
    </li>
  );
}
