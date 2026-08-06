import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { authApi } from "../../api/authApi";
import { parseApiError } from "../../../../lib/api/parseApiError";
import { cn } from "../../../../lib/utils";

interface Props {
  onSuccess: (emailOrPhone: string) => void;
}

export function SignupEmailStep({ onSuccess }: Props) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!value.trim()) {
      setError("Enter your email or phone number.");
      return;
    }

    setIsSubmitting(true);
    try {
      await authApi.signup({ email_or_phone: value.trim() });
      onSuccess(value.trim());
    } catch (err) {
      setError(parseApiError(err).generalMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

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
        <label htmlFor="emailOrPhone" className="text-sm font-medium text-ink-800 dark:text-paper-100">
          Email or phone number
        </label>
        <input
          id="emailOrPhone"
          type="text"
          autoComplete="email"
          autoFocus
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="you@example.com or 930804303"
          className="rounded-lg border border-paper-200 bg-white px-3.5 py-2.5 text-sm text-ink-950 outline-none transition-colors placeholder:text-ink-500/60 focus:border-ember-400 dark:border-ink-800 dark:bg-ink-900 dark:text-paper-50"
        />
        <p className="text-xs text-ink-500 dark:text-ink-300">
          We'll send a 6-digit code to verify it's really you.
        </p>
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
        {isSubmitting ? "Sending code..." : "Send verification code"}
      </button>
    </form>
  );
}