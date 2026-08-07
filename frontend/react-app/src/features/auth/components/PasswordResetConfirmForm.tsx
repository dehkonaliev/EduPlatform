import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { authApi } from "../api/authApi";
import { parseApiError } from "../../../lib/api/parseApiError";
import { cn } from "../../../lib/utils";

export function PasswordResetConfirmForm({ token }: { token: string }) {
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confPassword, setConfPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!newPassword || !confPassword) {
      setError("Please fill in both fields.");
      return;
    }
    if (newPassword !== confPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      await authApi.confirmPasswordReset({ token, new_password: newPassword, conf_password: confPassword });
      navigate("/login", { state: { passwordReset: true }, replace: true });
    } catch (err) {
      setError(parseApiError(err).generalMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputClass = cn(
    "w-full rounded-lg border bg-white px-3.5 py-2.5 pr-10 text-sm text-ink-950 outline-none transition-colors",
    "placeholder:text-ink-500/60 focus:border-ember-400 dark:bg-ink-900 dark:text-paper-50",
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400"
        >
          {error}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="new-password" className="text-sm font-medium text-ink-800 dark:text-paper-100">
          New password
        </label>
        <div className="relative">
          <input
            id="new-password"
            type={showNew ? "text" : "password"}
            autoComplete="new-password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            placeholder="At least 8 characters"
            className={cn(inputClass, "border-paper-200 dark:border-ink-800")}
          />
          <button
            type="button"
            onClick={() => setShowNew((prev) => !prev)}
            aria-label={showNew ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-800 dark:text-ink-300 dark:hover:text-paper-50"
          >
            {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="conf-password" className="text-sm font-medium text-ink-800 dark:text-paper-100">
          Confirm new password
        </label>
        <div className="relative">
          <input
            id="conf-password"
            type={showConf ? "text" : "password"}
            autoComplete="new-password"
            value={confPassword}
            onChange={(event) => setConfPassword(event.target.value)}
            placeholder="Re-enter your new password"
            className={cn(inputClass, "border-paper-200 dark:border-ink-800")}
          />
          <button
            type="button"
            onClick={() => setShowConf((prev) => !prev)}
            aria-label={showConf ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-800 dark:text-ink-300 dark:hover:text-paper-50"
          >
            {showConf ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={cn(
          "mt-1 flex items-center justify-center gap-2 rounded-full bg-ink-900 py-2.5 text-sm font-semibold text-paper-50 transition-colors hover:bg-ink-800 disabled:cursor-not-allowed disabled:opacity-70",
          "dark:bg-ember-400 dark:text-ink-950 dark:hover:bg-ember-300",
        )}
      >
        {isSubmitting && <Loader2 size={16} className="animate-spin" />}
        {isSubmitting ? "Resetting..." : "Reset password"}
      </button>
    </form>
  );
}
