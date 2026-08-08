import { useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Globe, Link2, Mail, Pencil, Phone, Users } from "lucide-react";
import { AppNavbar } from "../../AppNavbar";
import { useAuth } from "../../providers/AuthProvider";
import { useRoleProfile } from "../../features/profile/hooks/userRoleProfile";
import { APPROVAL_STATUS_META } from "../../features/profile/constants";
import { resolveMediaUrl } from "../../lib/media";
import { ImageLightbox } from "../../components/ui/ImageLightbox";

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: number;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-paper-200 bg-white p-4 dark:border-ink-800 dark:bg-ink-900">
      <Icon size={16} className="text-ember-500 dark:text-ember-400" />
      <span className="text-2xl font-semibold text-ink-950 dark:text-paper-50">{value}</span>
      <span className="text-xs text-ink-500 dark:text-ink-300">{label}</span>
    </div>
  );
}

export default function InstructorProfile() {
  const { user } = useAuth();
  const { instructorProfile, isLoading, error } = useRoleProfile();
  const [avatarOpen, setAvatarOpen] = useState(false);

  if (!user) return null;

  const photoUrl = resolveMediaUrl(user.photo);
  const fullName = `${user.first_name} ${user.last_name}`.trim() || "Your account";
  const initials =
    `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`.toUpperCase() || "?";
  const approvalMeta = instructorProfile
    ? APPROVAL_STATUS_META[instructorProfile.approval_status]
    : null;

  return (
    <>
      <AppNavbar />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-ink-950">
          <div
            className="absolute inset-0 opacity-[0.15]"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)",
              backgroundSize: "18px 18px",
            }}
          />
          <div
            className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full opacity-25 blur-3xl"
            style={{ background: "radial-gradient(circle, var(--color-ember-400), transparent 70%)" }}
          />

          <div className="relative flex flex-col items-start gap-6 px-6 py-10 sm:flex-row sm:items-center sm:px-10">
            <div className="relative shrink-0">
              {photoUrl ? (
                <button
                  type="button"
                  onClick={() => setAvatarOpen(true)}
                  aria-label={`View ${fullName}'s photo enlarged`}
                  title="View larger photo"
                  className="cursor-zoom-in"
                >
                  <img
                    src={photoUrl}
                    alt={fullName}
                    className="h-24 w-24 rounded-full object-cover ring-4 ring-white/20 sm:h-28 sm:w-28"
                  />
                </button>
              ) : (
                <span className="flex h-24 w-24 items-center justify-center rounded-full bg-ember-400 text-2xl font-semibold text-ink-950 ring-4 ring-white/20 sm:h-28 sm:w-28">
                  {initials}
                </span>
              )}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-3xl italic text-paper-50">{fullName}</h1>
                {approvalMeta && (
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${approvalMeta.badgeClassName}`}
                  >
                    {approvalMeta.label}
                  </span>
                )}
              </div>
              {instructorProfile?.headline ? (
                <p className="mt-1 text-sm text-ink-200">{instructorProfile.headline}</p>
              ) : (
                <p className="mt-1 text-sm capitalize text-ink-300">Instructor</p>
              )}
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
            </div>

            <Link
              to="/settings/instructor"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-ember-400 px-4 py-2 text-sm font-semibold text-ink-950 transition-colors hover:bg-ember-300"
            >
              <Pencil size={14} /> Edit profile
            </Link>
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
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 2 }).map((_, index) => (
              <div
                key={index}
                className="h-24 animate-pulse rounded-xl border border-paper-200 bg-paper-100 dark:border-ink-800 dark:bg-ink-800"
              />
            ))}
          </div>
        )}

        {photoUrl && (
          <ImageLightbox
            open={avatarOpen}
            src={photoUrl}
            alt={fullName}
            onClose={() => setAvatarOpen(false)}
          />
        )}

        {!isLoading && instructorProfile && (
          <>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard
                icon={BookOpen}
                label="Courses created"
                value={instructorProfile.total_courses_created}
              />
              <StatCard
                icon={Users}
                label="Students taught"
                value={instructorProfile.total_students_taught}
              />
            </div>

            <section className="mt-8">
              <h2 className="mb-2 text-sm font-semibold text-ink-950 dark:text-paper-50">About</h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-ink-600 dark:text-ink-300">
                {instructorProfile.bio || "No bio yet."}
              </p>
            </section>

            <div className="mt-6 flex gap-3">
              {instructorProfile.linkedin_url && (
                <a
                  href={instructorProfile.linkedin_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-full border border-paper-200 px-3.5 py-1.5 text-xs font-medium text-ink-700 transition-colors hover:border-ember-400/60 hover:text-ember-600 dark:border-ink-800 dark:text-ink-200 dark:hover:text-ember-400"
                >
                  <Link2 size={13} /> LinkedIn
                </a>
              )}
              {instructorProfile.website_url && (
                <a
                  href={instructorProfile.website_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-full border border-paper-200 px-3.5 py-1.5 text-xs font-medium text-ink-700 transition-colors hover:border-ember-400/60 hover:text-ember-600 dark:border-ink-800 dark:text-ink-200 dark:hover:text-ember-400"
                >
                  <Globe size={13} /> Website
                </a>
              )}
            </div>
          </>
        )}
      </main>
    </>
  );
}
