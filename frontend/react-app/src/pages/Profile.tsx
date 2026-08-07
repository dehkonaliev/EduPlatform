import { Link } from "react-router-dom";
import {
  Award,
  BookOpen,
  CheckCircle2,
  Flame,
  Globe,
  GraduationCap,
  Lightbulb,
  Link2,
  Mail,
  PenTool,
  Pencil,
  Phone,
  Settings as SettingsIcon,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import { AppNavbar } from "../AppNavbar";
import { useAuth } from "../providers/AuthProvider";
import { useRoleProfile } from "../features/profile/hooks/userRoleProfile";
import { resolveMediaUrl } from "../lib/media";
import { cn } from "../lib/utils";

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Zap;
  label: string;
  value: number;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-paper-200 bg-white p-4 dark:border-ink-800 dark:bg-ink-900">
      <Icon size={16} className="text-ember-500 dark:text-ember-400" />
      <span className="text-xl font-semibold text-ink-950 dark:text-paper-50">{value}</span>
      <span className="text-xs text-ink-500 dark:text-ink-300">{label}</span>
    </div>
  );
}

function VerifiedBadge({ label, verified }: { label: string; verified: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
        verified
          ? "bg-teal-500/10 text-teal-700 dark:text-teal-400"
          : "bg-paper-200 text-ink-500 dark:bg-ink-800 dark:text-ink-300",
      )}
    >
      {label} {verified ? "verified" : "unverified"}
    </span>
  );
}

export default function ProfilePage() {
  const { user } = useAuth();
  const { studentProfile, instructorProfile, isLoading, error } = useRoleProfile();

  if (!user) return null; // RequireAuth guarantees this won't render for long

  const photoUrl = resolveMediaUrl(user.photo);
  const fullName = `${user.first_name} ${user.last_name}`.trim() || "Your account";
  const initials = `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`.toUpperCase() || "?";

  return (
    <>
      <AppNavbar />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        {user.account_status === "PENDING" && (
          <div className="mb-6 rounded-lg border border-ember-400/30 bg-ember-400/10 px-4 py-3 text-sm text-ember-700 dark:text-ember-400">
            Your account is pending verification. Please verify your{" "}
            {user.email_verified ? "phone number" : "email"} to unlock all features.
          </div>
        )}

        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl bg-ink-950">
          {/* Dot-grid texture */}
          <div
            className="absolute inset-0 opacity-[0.15]"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)",
              backgroundSize: "18px 18px",
            }}
          />
          {/* Ember glow blob */}
          <div
            className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full opacity-25 blur-3xl"
            style={{ background: "radial-gradient(circle, var(--color-ember-400), transparent 70%)" }}
          />

          {/* Drifting education-themed accents — decorative only */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
            <BookOpen
              size={26}
              className="absolute left-[8%] top-[18%] text-paper-50/10 animate-float-slow"
            />
            <GraduationCap
              size={34}
              className="absolute right-[14%] top-[12%] text-ember-300/15 animate-float"
              style={{ animationDelay: "0.6s" }}
            />
            <Lightbulb
              size={22}
              className="absolute left-[22%] bottom-[16%] text-paper-50/10 animate-float-slower"
              style={{ animationDelay: "1.4s" }}
            />
            <PenTool
              size={20}
              className="absolute right-[24%] bottom-[20%] text-paper-50/10 animate-float-slow hidden sm:block"
              style={{ animationDelay: "2s" }}
            />
            <Sparkles
              size={18}
              className="absolute right-[6%] bottom-[30%] text-ember-300/20 animate-float hidden sm:block"
              style={{ animationDelay: "0.3s" }}
            />
          </div>

          <div className="relative flex flex-col items-start gap-6 px-6 py-10 sm:flex-row sm:items-center sm:px-10">
            {/* Bigger avatar with a level badge overlapping the corner */}
            <div className="relative shrink-0">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={fullName}
                  className="h-28 w-28 rounded-full object-cover ring-4 ring-white/20 sm:h-32 sm:w-32"
                />
              ) : (
                <span className="flex h-28 w-28 items-center justify-center rounded-full bg-ember-400 text-3xl font-semibold text-ink-950 ring-4 ring-white/20 sm:h-32 sm:w-32">
                  {initials}
                </span>
              )}
              {studentProfile && (
                <span className="absolute -bottom-1 -right-1 flex items-center gap-1 rounded-full bg-paper-50 px-2.5 py-1 text-xs font-bold text-ink-950 shadow-md ring-2 ring-ink-950">
                  <Zap size={12} className="text-ember-500" />
                  Lv {studentProfile.level}
                </span>
              )}
            </div>

            <div className="flex-1">
              <h1 className="font-display text-3xl italic text-paper-50">{fullName}</h1>
              <p className="mt-0.5 text-sm capitalize text-ink-300">{user.user_role.toLowerCase()}</p>
              <div className="mt-2 flex flex-wrap gap-3">
                {user.email && (
                  <span className="inline-flex items-center gap-1 text-xs text-ink-300">
                    <Mail size={12} /> {user.email}
                  </span>
                )}
                {user.phone_number && (
                  <span className="inline-flex items-center gap-1 text-xs text-ink-300">
                    <Phone size={12} /> {user.phone_number}
                  </span>
                )}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {user.email && <VerifiedBadge label="Email" verified={user.email_verified} />}
                {user.phone_number && <VerifiedBadge label="Phone" verified={user.phone_verified} />}
              </div>
            </div>

            <div className="flex shrink-0 gap-2">
              <Link
                to="/settings"
                className="inline-flex items-center gap-1.5 rounded-full bg-ember-400 px-4 py-2 text-sm font-semibold text-ink-950 transition-colors hover:bg-ember-300"
              >
                <Pencil size={14} /> Edit profile
              </Link>
              <Link
                to="/settings"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-paper-50 transition-colors hover:bg-white/10"
              >
                <SettingsIcon size={14} /> Settings
              </Link>
            </div>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400"
          >
            {error}
          </div>
        )}

        {isLoading && (
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-24 animate-pulse rounded-xl border border-paper-200 bg-paper-100 dark:border-ink-800 dark:bg-ink-800"
              />
            ))}
          </div>
        )}

        {/* Student view */}
        {!isLoading && studentProfile && (
          <>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <StatCard icon={Zap} label="XP" value={studentProfile.xp} />
              <StatCard icon={Flame} label="Day streak" value={studentProfile.streak} />
              <StatCard icon={TrendingUp} label="Level" value={studentProfile.level} />
              <StatCard icon={BookOpen} label="Enrolled" value={studentProfile.total_courses_enrolled} />
              <StatCard
                icon={CheckCircle2}
                label="Completed"
                value={studentProfile.total_courses_completed}
              />
              <StatCard icon={Award} label="Certificates" value={studentProfile.total_certificates_earned} />
            </div>

            <section className="mt-8">
              <h2 className="mb-2 text-sm font-semibold text-ink-950 dark:text-paper-50">About</h2>
              <p className="text-sm text-ink-600 dark:text-ink-300">
                {studentProfile.bio || "No bio yet."}
              </p>
              {studentProfile.gender && (
                <p className="mt-1 text-xs capitalize text-ink-500 dark:text-ink-400">
                  {studentProfile.gender.toLowerCase()}
                </p>
              )}
            </section>

            {/* Real pages come later, per your note — but the copy is dynamic
                now, so it still feels encouraging rather than like a stub */}
            <section className="mt-8 grid gap-3 sm:grid-cols-2">
              <Link
                to="/my-learning"
                className="group flex items-start gap-3.5 rounded-xl border border-paper-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-teal-500/40 hover:shadow-md dark:border-ink-800 dark:bg-ink-900"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400">
                  <GraduationCap size={19} />
                </span>
                <span className="flex flex-col">
                  <span className="text-sm font-semibold text-ink-950 dark:text-paper-50">
                    Completed courses
                  </span>
                  <span className="mt-0.5 text-xs text-ink-500 dark:text-ink-300">
                    {studentProfile.total_courses_completed > 0
                      ? `${studentProfile.total_courses_completed} finished — keep the momentum going!`
                      : "Finish your first course to start your streak."}
                  </span>
                </span>
              </Link>

              <Link
                to="/certificates"
                className="group flex items-start gap-3.5 rounded-xl border border-paper-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-ember-400/50 hover:shadow-md dark:border-ink-800 dark:bg-ink-900"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ember-400/10 text-ember-500 dark:text-ember-400">
                  <Award size={19} />
                </span>
                <span className="flex flex-col">
                  <span className="text-sm font-semibold text-ink-950 dark:text-paper-50">
                    Certificates
                  </span>
                  <span className="mt-0.5 text-xs text-ink-500 dark:text-ink-300">
                    {studentProfile.total_certificates_earned > 0
                      ? `${studentProfile.total_certificates_earned} earned — one more course, one more win.`
                      : "Complete a course to earn your first certificate."}
                  </span>
                </span>
              </Link>
            </section>

            {studentProfile.total_courses_completed === 0 && (
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-paper-100 px-4 py-3 text-xs text-ink-600 dark:bg-ink-900 dark:text-ink-300">
                <Sparkles size={14} className="shrink-0 text-ember-500 dark:text-ember-400" />
                Every expert was once a beginner — your first completed lesson is closer than you
                think.
              </div>
            )}
          </>
        )}

        {/* Instructor view — field shapes unconfirmed, see features/profile/types */}
        {!isLoading && instructorProfile && (
          <section className="mt-8 flex flex-col gap-3">
            {instructorProfile.headline && (
              <p className="text-base font-medium text-ink-900 dark:text-paper-100">
                {instructorProfile.headline}
              </p>
            )}
            <p className="text-sm text-ink-600 dark:text-ink-300">
              {instructorProfile.bio || "No bio yet."}
            </p>
            <div className="flex gap-3">
              {instructorProfile.linkedin_url && (
                <a
                  href={instructorProfile.linkedin_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-ink-500 hover:text-ember-500 dark:text-ink-300"
                >
                  <Link2 size={13} /> LinkedIn
                </a>
              )}
              {instructorProfile.website_url && (
                <a
                  href={instructorProfile.website_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-ink-500 hover:text-ember-500 dark:text-ink-300"
                >
                  <Globe size={13} /> Website
                </a>
              )}
            </div>
          </section>
        )}
      </main>
    </>
  );
}