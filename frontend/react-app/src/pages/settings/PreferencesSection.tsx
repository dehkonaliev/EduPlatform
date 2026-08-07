import { usePreference } from "../../features/auth/hooks/usePreference";
import { EditPreferencesForm } from "../../features/auth/components/EditPreferencesForm";

export default function PreferencesSection() {
  const { preference, isLoading, error, refetch } = usePreference();

  return (
    <section className="max-w-xl">
      <h2 className="mb-1 text-sm font-semibold text-ink-950 dark:text-paper-50">Preferences</h2>
      <p className="mb-5 text-xs text-ink-500 dark:text-ink-400">
        Appearance, language, and notification settings.
      </p>

      {isLoading && <div className="h-64 animate-pulse rounded-lg bg-paper-100 dark:bg-ink-900" />}

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400"
        >
          {error}
        </div>
      )}

      {!isLoading && preference && (
        <EditPreferencesForm preference={preference} onSaved={() => refetch()} />
      )}
    </section>
  );
}