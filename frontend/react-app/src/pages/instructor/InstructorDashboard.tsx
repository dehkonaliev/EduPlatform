import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  Layers,
  PencilLine,
  Plus,
  Settings2,
  Star,
  User,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { AppNavbar } from "../../AppNavbar";
import { useAuth } from "../../providers/AuthProvider";
import { useInstructorCourses } from "../../features/courses/hooks/useInstructorCourses";
import { COURSE_STATUS_META } from "../../features/courses/constants";
import { RatingStars } from "../../features/courses/components/RatingStars";
import { notificationsApi } from "../../features/notifications/api/notificationsApi";
import { NOTIFICATION_TYPE_META } from "../../features/notifications/constants";
import type { AppNotification } from "../../features/notifications/types";
import { resolveMediaUrl } from "../../lib/media";

const RECENT_COURSE_COUNT = 6;
const RECENT_NOTIFICATION_COUNT = 5;

export default function InstructorDashboard() {
  const { user } = useAuth();
  const { courses, isLoading, error } = useInstructorCourses();
  const { notifications, notifLoading, notifError } = useRecentNotifications();

  const stats = useMemo(() => {
    const published = courses.filter((course) => course.status === "PUBLISHED").length;
    const drafts = courses.filter((course) => course.status === "DRAFT").length;
    const rejected = courses.filter((course) => course.status === "REJECTED").length;
    const inReview = courses.filter((course) => course.status === "IN_REVIEW").length;
    const rated = courses.filter((course) => course.rating_count > 0);
    const totalReviews = rated.reduce((sum, course) => sum + course.rating_count, 0);
    const avgRating = rated.length
      ? rated.reduce((sum, course) => sum + Number.parseFloat(course.average_rating), 0) /
        rated.length
      : 0;
    return { published, drafts, rejected, inReview, ratedCount: rated.length, totalReviews, avgRating };
  }, [courses]);

  const attentionTotal = stats.drafts + stats.rejected + stats.inReview;
  const tasks = [
    {
      key: "drafts",
      to: "/instructor/courses/draft",
      icon: PencilLine,
      count: stats.drafts,
      text:
        stats.drafts > 0
          ? `Send ${stats.drafts} draft${stats.drafts === 1 ? "" : "s"} to review`
          : "No drafts waiting",
    },
    {
      key: "rejected",
      to: "/instructor/courses/rejected",
      icon: XCircle,
      count: stats.rejected,
      text:
        stats.rejected > 0
          ? `Fix ${stats.rejected} rejected course${stats.rejected === 1 ? "" : "s"}`
          : "No rejected courses",
    },
    {
      key: "review",
      to: "/instructor/courses/review",
      icon: Clock,
      count: stats.inReview,
      text:
        stats.inReview > 0
          ? `${stats.inReview} course${stats.inReview === 1 ? "" : "s"} awaiting admin review`
          : "Nothing in review",
    },
  ];

  const firstName = user?.first_name;
  const dateLine = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <AppNavbar />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl italic text-ink-950 dark:text-paper-50">
              Welcome back{firstName ? `, ${firstName}` : ""}
            </h1>
            <p className="mt-1 text-sm text-ink-500 dark:text-ink-300">{dateLine}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {courses.length > 0 && (
              <Link
                to={`/instructor/course/${courses[0].id}/manage`}
                className="inline-flex max-w-64 items-center gap-1.5 rounded-full border border-paper-200 px-4 py-2 text-sm font-semibold text-ink-800 transition-colors hover:bg-paper-100 dark:border-ink-800 dark:text-paper-100 dark:hover:bg-ink-800"
              >
                <span className="truncate">Continue editing — {courses[0].title}</span>
              </Link>
            )}
            <Link
              to="/instructor/course-create"
              className="inline-flex items-center gap-1.5 rounded-full bg-ink-900 px-4 py-2 text-sm font-semibold text-paper-50 transition-colors hover:bg-ink-800 dark:bg-ember-400 dark:text-ink-950 dark:hover:bg-ember-300"
            >
              <Plus size={15} />
              Create course
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={Layers}
            iconClassName="bg-ink-500/10 text-ink-600 dark:text-ink-300"
            label="Total courses"
            value={isLoading ? "—" : String(courses.length)}
            sub={
              isLoading ? "Loading…" : `${stats.published} published · ${stats.drafts} drafts`
            }
          />
          <StatCard
            icon={CheckCircle2}
            iconClassName="bg-teal-500/15 text-teal-600 dark:text-teal-400"
            label="Published"
            value={isLoading ? "—" : String(stats.published)}
            sub={isLoading ? "Loading…" : `of ${courses.length} total`}
          />
          <StatCard
            icon={Star}
            iconClassName="bg-amber-500/15 text-amber-600 dark:text-amber-400"
            label="Average rating"
            value={isLoading || stats.ratedCount === 0 ? "—" : stats.avgRating.toFixed(1)}
            sub={
              isLoading
                ? "Loading…"
                : `from ${stats.totalReviews} review${stats.totalReviews === 1 ? "" : "s"}`
            }
          />
          <StatCard
            icon={AlertTriangle}
            iconClassName="bg-red-500/15 text-red-600 dark:text-red-400"
            label="Needs attention"
            value={isLoading ? "—" : String(attentionTotal)}
            sub={
              isLoading
                ? "Loading…"
                : `${stats.drafts} drafts · ${stats.rejected} rejected`
            }
          />
        </div>

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400"
          >
            {error}
          </div>
        )}

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="min-w-0 space-y-8 lg:col-span-2">
            <section className="rounded-2xl border border-paper-200 bg-white p-5 dark:border-ink-800 dark:bg-ink-900">
              <SectionHeader title="Needs your attention" />
              {attentionTotal === 0 ? (
                <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-paper-300 px-6 py-10 text-center dark:border-ink-800">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400">
                    <CheckCircle2 size={18} />
                  </span>
                  <p className="text-sm font-medium text-ink-800 dark:text-paper-100">
                    All caught up
                  </p>
                  <p className="text-xs text-ink-500 dark:text-ink-400">
                    No courses need your attention right now.
                  </p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {tasks.map((task) => (
                    <li key={task.key}>
                      <Link
                        to={task.to}
                        className="flex items-center gap-3 rounded-xl border border-paper-200 px-3.5 py-3 transition-colors hover:border-ember-400/60 hover:bg-paper-50 dark:border-ink-800 dark:hover:bg-ink-800"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink-500/10 text-ink-600 dark:text-ink-300">
                          <task.icon size={16} />
                        </span>
                        <span className="min-w-0 flex-1 text-sm font-medium text-ink-800 dark:text-paper-100">
                          {task.text}
                        </span>
                        {task.count > 0 && (
                          <span className="shrink-0 rounded-full bg-ember-400/15 px-2 py-0.5 text-xs font-bold text-ember-600 dark:text-ember-400">
                            {task.count}
                          </span>
                        )}
                        <ChevronRight size={16} className="shrink-0 text-ink-400 dark:text-ink-300" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="rounded-2xl border border-paper-200 bg-white p-5 dark:border-ink-800 dark:bg-ink-900">
              <SectionHeader title="Your courses" to="/instructor/courses" linkLabel="View all courses" />
              {isLoading ? (
                <p className="py-8 text-center text-sm text-ink-500 dark:text-ink-400">Loading…</p>
              ) : courses.length === 0 ? (
                <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-paper-300 px-6 py-10 text-center dark:border-ink-800">
                  <p className="text-sm font-medium text-ink-800 dark:text-paper-100">
                    No courses yet
                  </p>
                  <p className="text-xs text-ink-500 dark:text-ink-400">
                    Create your first course to get started.
                  </p>
                  <Link
                    to="/instructor/course-create"
                    className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-ink-900 px-4 py-2 text-sm font-semibold text-paper-50 transition-colors hover:bg-ink-800 dark:bg-ember-400 dark:text-ink-950 dark:hover:bg-ember-300"
                  >
                    <Plus size={15} />
                    Create course
                  </Link>
                </div>
              ) : (
                <ul className="divide-y divide-paper-100 dark:divide-ink-800">
                  {courses.slice(0, RECENT_COURSE_COUNT).map((course) => {
                    const statusMeta = COURSE_STATUS_META[course.status];
                    const thumbnailUrl = resolveMediaUrl(course.thumbnail);
                    return (
                      <li key={course.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                        <Link
                          to={`/instructor/course/${course.id}/manage`}
                          className="block h-12 w-20 shrink-0 overflow-hidden rounded-lg bg-ink-100 dark:bg-ink-800"
                        >
                          {thumbnailUrl ? (
                            <img
                              src={thumbnailUrl}
                              alt=""
                              loading="lazy"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center font-display text-lg italic text-ember-300">
                              {course.title.charAt(0)}
                            </span>
                          )}
                        </Link>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="truncate text-sm font-semibold text-ink-950 dark:text-paper-50">
                              {course.title}
                            </h3>
                            <span
                              className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusMeta.badgeClassName}`}
                            >
                              {statusMeta.label}
                            </span>
                          </div>
                          <p className="truncate text-xs text-ink-500 dark:text-ink-300">
                            {course.subtitle}
                          </p>
                          <RatingStars
                            rating={Number.parseFloat(course.average_rating)}
                            count={course.rating_count}
                          />
                        </div>
                        <Link
                          to={`/instructor/course/${course.id}/manage`}
                          aria-label={`Manage ${course.title}`}
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-paper-200 text-ink-600 transition-colors hover:border-ember-400/60 hover:text-ember-600 dark:border-ink-800 dark:text-ink-300 dark:hover:text-ember-400"
                        >
                          <Settings2 size={15} />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </div>

          <div className="min-w-0 space-y-8">
            <section className="rounded-2xl border border-paper-200 bg-white p-5 dark:border-ink-800 dark:bg-ink-900">
              <h2 className="mb-4 font-display text-xl italic text-ink-950 dark:text-paper-50">
                Recent notifications
              </h2>
              {notifLoading ? (
                <p className="py-8 text-center text-sm text-ink-500 dark:text-ink-400">Loading…</p>
              ) : notifError ? (
                <p className="py-8 text-center text-sm text-ink-500 dark:text-ink-400">
                  Couldn't load notifications.
                </p>
              ) : notifications.length === 0 ? (
                <p className="py-8 text-center text-sm text-ink-500 dark:text-ink-400">
                  You're all caught up.
                </p>
              ) : (
                <ul className="space-y-3">
                  {notifications.slice(0, RECENT_NOTIFICATION_COUNT).map((notification) => {
                    const meta = NOTIFICATION_TYPE_META[notification.notif_type];
                    const Icon = meta.icon;
                    return (
                      <li key={notification.id} className="flex items-start gap-3">
                        <span
                          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${meta.iconClassName}`}
                        >
                          <Icon size={15} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 text-sm text-ink-800 dark:text-paper-100">
                            {notification.message}
                          </p>
                          <p className="mt-0.5 text-xs text-ink-500 dark:text-ink-400">
                            {meta.label}
                          </p>
                        </div>
                        {!notification.is_read && (
                          <span
                            className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-ember-500"
                            aria-label="Unread"
                          />
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            <section className="rounded-2xl border border-paper-200 bg-white p-5 dark:border-ink-800 dark:bg-ink-900">
              <h2 className="mb-4 font-display text-xl italic text-ink-950 dark:text-paper-50">
                Quick links
              </h2>
              <ul className="space-y-2">
                {QUICK_LINKS.map(({ to, label, icon: Icon }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:bg-paper-50 dark:text-ink-200 dark:hover:bg-ink-800"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ember-400/10 text-ember-600 dark:text-ember-400">
                        <Icon size={15} />
                      </span>
                      <span className="flex-1">{label}</span>
                      <ArrowUpRight size={14} className="text-ink-400 dark:text-ink-300" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}

const QUICK_LINKS = [
  { to: "/instructor/courses", label: "My Courses", icon: BookOpen },
  { to: "/instructor/course-create", label: "Create Course", icon: Plus },
  { to: "/instructor/profile", label: "Instructor Profile", icon: User },
  { to: "/transactions", label: "Transactions", icon: CreditCard },
];

function StatCard({
  icon: Icon,
  iconClassName,
  label,
  value,
  sub,
}: {
  icon: LucideIcon;
  iconClassName: string;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-2xl border border-paper-200 bg-white p-5 dark:border-ink-800 dark:bg-ink-900">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-[0.15em] text-ink-500 dark:text-ink-300">
          {label}
        </p>
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconClassName}`}
        >
          <Icon size={18} />
        </span>
      </div>
      <p className="mt-3 font-display text-3xl italic text-ink-950 dark:text-paper-50">{value}</p>
      <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">{sub}</p>
    </div>
  );
}

function SectionHeader({ title, to, linkLabel }: { title: string; to?: string; linkLabel?: string }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="font-display text-xl italic text-ink-950 dark:text-paper-50">{title}</h2>
      {to && (
        <Link
          to={to}
          className="inline-flex items-center gap-1 text-sm font-semibold text-ember-600 transition-colors hover:text-ember-500 dark:text-ember-400"
        >
          {linkLabel ?? "View all"}
          <ArrowUpRight size={14} />
        </Link>
      )}
    </div>
  );
}

function useRecentNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [notifLoading, setNotifLoading] = useState(true);
  const [notifError, setNotifError] = useState(false);

  useEffect(() => {
    let active = true;
    notificationsApi
      .fetchNotifications()
      .then((data) => {
        if (active) setNotifications(data);
      })
      .catch(() => {
        if (active) setNotifError(true);
      })
      .finally(() => {
        if (active) setNotifLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return { notifications, notifLoading, notifError };
}
