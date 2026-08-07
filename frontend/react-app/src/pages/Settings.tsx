import { AppNavbar } from "../AppNavbar";
import { useAuth } from "../providers/AuthProvider";
import { EditProfileForm } from "../features/auth/components/EditProfileForm";
import { EditStudentProfileForm } from "../features/profile/components/EditStudentProfileForm";
import { useRoleProfile } from "../features/profile/hooks/userRoleProfile";

export default function SettingsPage() {
  const { user } = useAuth();
  const { studentProfile, isLoading, refetch } = useRoleProfile();

  return (
    <>
      <AppNavbar />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="font-display text-2xl italic text-ink-950 dark:text-paper-50">Settings</h1>

        <section className="mt-8 max-w-xl">
          <h2 className="mb-1 text-sm font-semibold text-ink-950 dark:text-paper-50">
            Profile information
          </h2>
          <p className="mb-5 text-xs text-ink-500 dark:text-ink-400">
            This is what other people on Curiosite see.
          </p>
          <EditProfileForm />
        </section>

        {user?.user_role === "STUDENT" && (
          <section className="mt-10 max-w-xl border-t border-paper-200 pt-8 dark:border-ink-800">
            <h2 className="mb-1 text-sm font-semibold text-ink-950 dark:text-paper-50">
              Student details
            </h2>
            <p className="mb-5 text-xs text-ink-500 dark:text-ink-400">
              Optional details shown on your learning profile.
            </p>

            {isLoading && (
              <div className="h-48 animate-pulse rounded-lg bg-paper-100 dark:bg-ink-900" />
            )}

            {!isLoading && studentProfile && (
              <EditStudentProfileForm profile={studentProfile} onSaved={() => refetch()} />
            )}
          </section>
        )}

        {/* Password, notifications, etc. — ask for these whenever you're ready to build them */}
      </main>
    </>
  );
}