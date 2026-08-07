import { BadgeCheck, CalendarClock, Crown, Loader2, Wallet } from "lucide-react";
import { cn } from "../lib/utils";
import { AppNavbar } from "../AppNavbar";
import { useToast } from "../providers/ToastProvider";
import { usePlans } from "../features/payments/hooks/usePlans";
import { useMySubscriptions } from "../features/payments/hooks/useMySubscriptions";
import { useWallet } from "../features/payments/hooks/useWallet";
import { useSubscribe } from "../features/payments/hooks/useSubscribe";
import { formatDate, formatMoney } from "../features/payments/constants";
import type { Plan, Subscription } from "../features/payments/types";

export default function SubscriptionsPage() {
  const { plans, isLoading, error } = usePlans();
  const { subscriptions, refetch: refetchSubscriptions } = useMySubscriptions();
  const { wallet, refetch: refetchWallet } = useWallet();
  const { subscribe, isSubscribing, error: subscribeError } = useSubscribe();
  const { showToast } = useToast();

  const activeSubscription = subscriptions.find((sub) => sub.is_active) ?? null;
  const balance = Number.parseFloat(wallet?.balance ?? "0");

  async function handleSubscribe(plan: Plan) {
    const result = await subscribe(plan.id);
    if (!result) return;
    showToast(`Subscribed to the ${plan.name} plan!`);
    await Promise.all([refetchSubscriptions(), refetchWallet()]);
  }

  return (
    <>
      <AppNavbar />

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl italic text-ink-950 dark:text-paper-50">
              Subscriptions
            </h1>
            <p className="mt-1 text-sm text-ink-600 dark:text-ink-300">
              Pick a plan to keep learning across all your courses.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-paper-200 bg-white px-3.5 py-1.5 text-sm font-medium text-ink-700 dark:border-ink-800 dark:bg-ink-900 dark:text-ink-200">
            <Wallet size={15} className="text-ink-400 dark:text-ink-500" />
            Balance: <span className="font-semibold text-ink-950 dark:text-paper-50">{formatMoney(balance)}</span>
          </div>
        </div>

        {activeSubscription && (
          <ActiveSubscriptionCard subscription={activeSubscription} />
        )}

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400"
          >
            {error}
          </div>
        )}

        {subscribeError && (
          <div
            role="alert"
            className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400"
          >
            {subscribeError}
          </div>
        )}

        <div className="mt-8">
          {isLoading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="h-56 animate-pulse rounded-2xl border border-paper-200 bg-white dark:border-ink-800 dark:bg-ink-900"
                />
              ))}
            </div>
          ) : plans.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {plans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  isCurrent={activeSubscription?.plan.id === plan.id}
                  canAfford={Number.parseFloat(plan.price) <= balance}
                  isSubscribing={isSubscribing}
                  onSubscribe={() => handleSubscribe(plan)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-paper-300 bg-white/50 px-6 py-16 text-center dark:border-ink-800 dark:bg-ink-900/40">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-paper-200 text-ink-500 dark:bg-ink-800 dark:text-ink-300">
                <Crown size={22} />
              </span>
              <p className="text-sm font-medium text-ink-800 dark:text-paper-100">
                No plans available right now
              </p>
              <p className="text-xs text-ink-500 dark:text-ink-400">
                Check back soon for new subscription plans.
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

function ActiveSubscriptionCard({ subscription }: { subscription: Subscription }) {
  return (
    <div className="mt-8 flex flex-wrap items-center gap-4 rounded-2xl border border-teal-500/30 bg-teal-500/5 p-5 dark:border-teal-500/20">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal-500/15 text-teal-700 dark:text-teal-400">
        <BadgeCheck size={22} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink-950 dark:text-paper-50">
          {subscription.plan.name} plan
        </p>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-600 dark:text-ink-300">
          <CalendarClock size={12} />
          Active until {formatDate(subscription.expires_at)}
        </p>
      </div>
      <span className="inline-flex items-center gap-1 rounded-full bg-teal-600/10 px-3 py-1 text-xs font-semibold text-teal-700 dark:text-teal-400">
        <Crown size={12} /> Active
      </span>
    </div>
  );
}

function PlanCard({
  plan,
  isCurrent,
  canAfford,
  isSubscribing,
  onSubscribe,
}: {
  plan: Plan;
  isCurrent: boolean;
  canAfford: boolean;
  isSubscribing: boolean;
  onSubscribe: () => void;
}) {
  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl border bg-white transition-shadow hover:shadow-lg hover:shadow-ink-950/5 dark:bg-ink-900",
        isCurrent
          ? "border-teal-500/50 ring-1 ring-teal-500/30"
          : "border-paper-200 dark:border-ink-800",
      )}
    >
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-display text-lg italic text-ink-950 dark:text-paper-50">
            {plan.name}
          </h3>
          {isCurrent && (
            <span className="inline-flex items-center gap-1 rounded-full bg-teal-600/10 px-2.5 py-1 text-[11px] font-semibold text-teal-700 dark:text-teal-400">
              <Crown size={11} /> Current
            </span>
          )}
        </div>
        <div>
          <p className="text-2xl font-semibold text-ink-950 dark:text-paper-50">
            {formatMoney(plan.price)}
          </p>
          <p className="mt-0.5 text-xs text-ink-500 dark:text-ink-400">
            per {plan.period_days} days
          </p>
        </div>
        {plan.desc && (
          <p className="text-sm leading-relaxed text-ink-600 dark:text-ink-300">
            {plan.desc}
          </p>
        )}
      </div>

      <div className="border-t border-paper-200 p-4 dark:border-ink-800">
        <button
          type="button"
          onClick={onSubscribe}
          disabled={isCurrent || isSubscribing || !canAfford}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-ink-900 px-4 py-2.5 text-sm font-semibold text-paper-50 transition-colors hover:bg-ink-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-ember-400 dark:text-ink-950 dark:hover:bg-ember-300"
        >
          {isSubscribing ? (
            <>
              <Loader2 size={15} className="animate-spin" /> Subscribing…
            </>
          ) : isCurrent ? (
            "Current plan"
          ) : (
            "Subscribe"
          )}
        </button>
        {!canAfford && !isCurrent && (
          <p className="mt-2 text-center text-xs text-ember-600 dark:text-ember-400">
            Insufficient balance to subscribe
          </p>
        )}
      </div>
    </div>
  );
}
