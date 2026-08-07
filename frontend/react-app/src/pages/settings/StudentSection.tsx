import { Navigate } from "react-router-dom";
import { useAuth } from "../../providers/AuthProvider";
import { useRoleProfile } from "../../features/profile/hooks/userRoleProfile";
import { EditStudentProfileForm } from "../../features/profile/components/EditStudentProfileForm";

export default function StudentSection() {
  const { user } = useAuth();
  const { studentProfile, isLoading, error, refetch } = useRoleProfile();

  if (user?.user_role !== "STUDENT") return <Navigate to="/settings/profile" replace />;

  return (
    <section className="max-w-xl">
      <h2 className="mb-1 text-sm font-semibold text-ink-950 dark:text-paper-50">
        Student details
      </h2>
      <p className="mb-5 text-xs text-ink-500 dark:text-ink-400">
        Optional details shown on your learning profile.
      </p>

      {isLoading && <div className="h-48 animate-pulse rounded-lg bg-paper-100 dark:bg-ink-900" />}

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400"
        >
          {error}
        </div>
      )}

      {!isLoading && studentProfile && (
        <EditStudentProfileForm profile={studentProfile} onSaved={() => refetch()} />
      )}
    </section>
  );
}