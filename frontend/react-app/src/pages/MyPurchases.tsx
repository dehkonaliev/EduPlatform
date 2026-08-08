import { Link } from "react-router-dom";
import {
  BadgeCheck,
  Clock,
  Crown,
  PackageSearch,
  ShoppingBag,
  type LucideIcon,
} from "lucide-react";
import { AppNavbar } from "../AppNavbar";
import { EnrollmentCard } from "../features/enrollments/components/EnrollmentCard";
import { EnrollmentCardSkeleton } from "../features/enrollments/components/EnrollmentCardSkeleton";
import { useBoughtCourses } from "../features/enrollments/hooks/useBoughtCourses";
import { useMySubscriptions } from "../features/payments/hooks/useMySubscriptions";
import { formatDate, formatMoney } from "../features/payments/constants";
import type { Subscription } from "../features/payments/types";
import { cn } from "../lib/utils";

const SKELETON_COUNT = 2;

export default function MyPurchasesPage() {
  const { subscriptions, isLoading: isLoadingSubscriptions, error: subscriptionsError } =
    useMySubscriptions();
  const { courses, isLoading: isLoadingCourses, error: coursesError, refetch: refetchCourses } =
    useBoughtCourses();

  const availableSubscriptions = subscriptions.filter((subscription) => subscription.is_active);
  const outdatedSubscriptions = subscriptions.filter((subscription) => !subscription.is_active);
  const isLoading = isLoadingSubscriptions || isLoadingCourses;
  const error = subscriptionsError ?? coursesError;

  return (
    <>
      <AppNavbar />

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl italic text-ink-950 dark:text-paper-50">
              My Purchases
            </h1>
            <p className="mt-1 text-sm text-ink-600 dark:text-ink-300">
              Subscriptions and courses you've paid for — current and expired.
            </p>
          </div>
          <Link
            to="/subscriptions"
            className="inline-flex items-center gap-1.5 rounded-full border border-paper-200 px-3.5 py-1.5 text-sm font-medium text-ink-700 transition-colors hover:bg-paper-100 dark:border-ink-800 dark:text-ink-200 dark:hover:bg-ink-800"
          >
            <Crown size={14} />
            Browse plans
          </Link>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400"
          >
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="mt-8 space-y-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
                <div
                  key={index}
                  className="h-44 animate-pulse rounded-2xl border border-paper-200 bg-white dark:border-ink-800 dark:bg-ink-900"
                />
              ))}
            </div>
            {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
              <EnrollmentCardSkeleton key={index} />
            ))}
          </div>
        ) : (
          <>
            <section className="mt-8">
              <SectionHeading
                icon={BadgeCheck}
                title="Available subscriptions"
                count={availableSubscriptions.length}
              />
              {availableSubscriptions.length > 0 ? (
                <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {availableSubscriptions.map((subscription) => (
                    <SubscriptionCard key={subscription.id} subscription={subscription} />
                  ))}
                </div>
              ) : (
                <SectionEmpty
                  icon={Crown}
                  title="No active subscription"
                  hint="Subscribe to a plan to unlock monthly courses."
                />
              )}
            </section>

            <section className="mt-10">
              <SectionHeading
                icon={Clock}
                title="Outdated subscriptions"
                count={outdatedSubscriptions.length}
              />
              {outdatedSubscriptions.length > 0 ? (
                <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {outdatedSubscriptions.map((subscription) => (
                    <SubscriptionCard key={subscription.id} subscription={subscription} />
                  ))}
                </div>
              ) : (
                <SectionEmpty
                  icon={Clock}
                  title="No outdated subscriptions"
                  hint="Expired plans will show up here when their time is up."
                />
              )}
            </section>

            <section className="mt-10">
              <SectionHeading icon={ShoppingBag} title="Bought courses" count={courses.length} />
              {courses.length > 0 ? (
                <div className="mt-3 flex flex-col gap-5">
                  {courses.map((enrollment) => (
                    <EnrollmentCard
                      key={enrollment.id}
                      enrollment={enrollment}
                      onDropped={refetchCourses}
                    />
                  ))}
                </div>
              ) : (
                <SectionEmpty
                  icon={PackageSearch}
                  title="No bought courses yet"
                  hint="Courses you pay for with your wallet balance will appear here."
                />
              )}
            </section>
          </>
        )}
      </main>
    </>
  );
}

function SectionHeading({
  icon: Icon,
  title,
  count,
}: {
  icon: LucideIcon;
  title: string;
  count?: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon size={17} className="text-ember-500 dark:text-ember-400" />
      <h2 className="text-base font-semibold text-ink-950 dark:text-paper-50">{title}</h2>
      {typeof count === "number" && count > 0 && (
        <span className="rounded-full bg-paper-200 px-2 py-0.5 text-xs font-semibold text-ink-600 dark:bg-ink-800 dark:text-ink-300">
          {count}
        </span>
      )}
    </div>
  );
}

function SubscriptionCard({ subscription }: { subscription: Subscription }) {
  const active = subscription.is_active;

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl border p-5",
        active
          ? "border-teal-500/30 bg-teal-500/5 dark:border-teal-500/20"
          : "border-paper-200 bg-white dark:border-ink-800 dark:bg-ink-900",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
            active
              ? "bg-teal-500/15 text-teal-700 dark:text-teal-400"
              : "bg-paper-200 text-ink-500 dark:bg-ink-800 dark:text-ink-300",
          )}
        >
          <Crown size={18} />
        </span>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold",
            active
              ? "bg-teal-600/10 text-teal-700 dark:text-teal-400"
              : "bg-paper-200 text-ink-500 dark:bg-ink-800 dark:text-ink-300",
          )}
        >
          {active ? <BadgeCheck size={11} /> : <Clock size={11} />}
          {active ? "Available" : "Outdated"}
        </span>
      </div>

      <div>
        <h3 className="font-display text-lg italic text-ink-950 dark:text-paper-50">
          {subscription.plan.name} plan
        </h3>
        <p className="text-xs text-ink-500 dark:text-ink-300">
          {formatMoney(subscription.plan.price)} per {subscription.plan.period_days} days
        </p>
      </div>

      <div className="mt-auto flex flex-col gap-1 text-xs text-ink-600 dark:text-ink-300">
        <p>Purchased {formatDate(subscription.created_at)}</p>
        <p>Expires {formatDate(subscription.expires_at)}</p>
      </div>
    </div>
  );
}

function SectionEmpty({
  icon: Icon,
  title,
  hint,
}: {
  icon: LucideIcon;
  title: string;
  hint: string;
}) {
  return (
    <div className="mt-3 flex flex-col items-center gap-3 rounded-xl border border-dashed border-paper-300 bg-white/50 px-6 py-10 text-center dark:border-ink-800 dark:bg-ink-900/40">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-paper-200 text-ink-500 dark:bg-ink-800 dark:text-ink-300">
        <Icon size={20} />
      </span>
      <p className="text-sm font-medium text-ink-800 dark:text-paper-100">{title}</p>
      <p className="text-xs text-ink-500 dark:text-ink-400">{hint}</p>
    </div>
  );
}
