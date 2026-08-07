import { useState, type FormEvent } from "react";
import { Loader2, Monitor, Moon, Sun } from "lucide-react";
import { authApi } from "../api/authApi";
import { useToast } from "../../../providers/ToastProvider";
import { useTheme } from "../../../providers/ThemeProvider";
import { parseApiError } from "../../../lib/api/parseApiError";
import { cn } from "../../../lib/utils";
import { Switch } from "../../../components/ui/Switch";
import type { ThemeMode, UserPreference } from "../types";

// Guessed list — your model defaults to 'en' and TIME_ZONE is Asia/Tashkent,
// so uz/ru seemed likely for this audience. Confirm the real supported set.
const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "uz", label: "O'zbekcha" },
  { value: "ru", label: "Русский" },
];

const THEME_OPTIONS: Array<{ value: ThemeMode; label: string; icon: typeof Sun }> = [
  { value: "LIGHT", label: "Light", icon: Sun },
  { value: "DARK", label: "Dark", icon: Moon },
  { value: "SYSTEM", label: "System", icon: Monitor },
];

interface Props {
  preference: UserPreference;
  onSaved: (updated: UserPreference) => void;
}

export function EditPreferencesForm({ preference, onSaved }: Props) {
  const { setTheme } = useTheme();
  const { showToast } = useToast();

  const [theme, setThemeChoice] = useState<ThemeMode>(preference.theme);
  const [language, setLanguage] = useState(preference.language);
  const [timezone, setTimezone] = useState(preference.timezone);
  const [emailNotifications, setEmailNotifications] = useState(preference.email_notifications);
  const [pushNotifications, setPushNotifications] = useState(preference.push_notifications);

  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setGeneralError(null);

    // Only send fields that actually changed from what we loaded — partial
    // PATCH semantics, and avoids re-triggering validation (e.g. uniqueness
    // checks) on fields the user never touched.
    const diff: Partial<UserPreference> = {};
    if (theme !== preference.theme) diff.theme = theme;
    if (language !== preference.language) diff.language = language;
    if (timezone !== preference.timezone) diff.timezone = timezone;
    if (emailNotifications !== preference.email_notifications) diff.email_notifications = emailNotifications;
    if (pushNotifications !== preference.push_notifications) diff.push_notifications = pushNotifications;

    if (Object.keys(diff).length === 0) {
      showToast("Nothing to save — no changes made.");
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await authApi.updatePreference(diff);

      // Actually apply the theme choice, not just save it to the database
      if (theme === "SYSTEM") {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        setTheme(prefersDark ? "dark" : "light");
      } else {
        setTheme(theme === "DARK" ? "dark" : "light");
      }

      onSaved(updated);
      showToast("Preferences updated successfully.");
    } catch (err) {
      setGeneralError(parseApiError(err).generalMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
      {generalError && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400"
        >
          {generalError}
        </div>
      )}

      {/* Theme */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-ink-800 dark:text-paper-100">Appearance</span>
        <div className="flex gap-2">
          {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setThemeChoice(value)}
              className={cn(
                "flex flex-1 flex-col items-center gap-1.5 rounded-lg border px-3 py-3 text-xs font-medium transition-colors",
                theme === value
                  ? "border-ember-400 bg-ember-400/10 text-ember-600 dark:text-ember-400"
                  : "border-paper-200 text-ink-600 hover:border-ink-300 dark:border-ink-800 dark:text-ink-300 dark:hover:border-ink-600",
              )}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Language + timezone */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="language" className="text-sm font-medium text-ink-800 dark:text-paper-100">
            Language
          </label>
          <select
            id="language"
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
            className="rounded-lg border border-paper-200 bg-white px-3.5 py-2.5 text-sm text-ink-950 outline-none transition-colors focus:border-ember-400 dark:border-ink-800 dark:bg-ink-900 dark:text-paper-50"
          >
            {LANGUAGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="timezone" className="text-sm font-medium text-ink-800 dark:text-paper-100">
            Timezone
          </label>
          <input
            id="timezone"
            value={timezone}
            onChange={(event) => setTimezone(event.target.value)}
            placeholder="Asia/Tashkent"
            className="rounded-lg border border-paper-200 bg-white px-3.5 py-2.5 text-sm text-ink-950 outline-none transition-colors placeholder:text-ink-500/60 focus:border-ember-400 dark:border-ink-800 dark:bg-ink-900 dark:text-paper-50"
          />
          <p className="text-xs text-ink-500 dark:text-ink-400">IANA format, e.g. Asia/Tashkent.</p>
        </div>
      </div>

      {/* Notifications */}
      <div className="flex flex-col gap-4 rounded-lg border border-paper-200 p-4 dark:border-ink-800">
        <Switch
          checked={emailNotifications}
          onChange={setEmailNotifications}
          label="Email notifications"
          description="Course updates, achievements, and account activity."
        />
        <div className="border-t border-paper-200 dark:border-ink-800" />
        <Switch
          checked={pushNotifications}
          onChange={setPushNotifications}
          label="Push notifications"
          description="Real-time alerts on your device."
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "flex items-center justify-center gap-2 rounded-full bg-ink-900 px-5 py-2.5 text-sm font-semibold text-paper-50 transition-colors hover:bg-ink-800 disabled:cursor-not-allowed disabled:opacity-70",
            "dark:bg-ember-400 dark:text-ink-950 dark:hover:bg-ember-300",
          )}
        >
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          {isSubmitting ? "Saving..." : "Save changes"}
        </button>
      </div>
    </form>
  );
}