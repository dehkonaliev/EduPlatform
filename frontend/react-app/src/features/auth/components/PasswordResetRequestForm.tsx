import { useState, type FormEvent } from "react";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { authApi } from "../api/authApi";
import { parseApiError } from "../../../lib/api/parseApiError";
import { cn } from "../../../lib/utils";

type Stage = "form" | "sent";

export function PasswordResetRequestForm() {
  const [identifier, setIdentifier] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stage, setStage] = useState<Stage>("form");
  const [sentViaEmail, setSentViaEmail] = useState(true);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!identifier.trim()) {
      setError("Enter your email or verified phone number.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await authApi.requestPasswordReset({ email_or_phone: identifier.trim() });
      setSentViaEmail(Boolean(result.email));
      setStage("sent");
    } catch (err) {
      setError(parseApiError(err).generalMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (stage === "sent") {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-3 rounded-lg border border-teal-500/30 bg-teal-500/10 px-3.5 py-3 text-sm text-teal-700 dark:text-teal-400">
          <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
          <p>
            {sentViaEmail
              ? "If an account exists, we've emailed you a password reset link. Check your inbox (and spam folder)."
              : "If an account exists, you can get the reset link from our Telegram bot."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setStage("form")}
          className="inline-flex items-center gap-1 text-xs font-medium text-ember-600 transition-colors hover:text-ember-500 dark:text-ember-400"
        >
          <ArrowRight size={13} className="rotate-180" /> Try another address
        </button>
      </div>
    );
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
        <label htmlFor="email-or-phone" className="text-sm font-medium text-ink-800 dark:text-paper-100">
          Email or verified phone number
        </label>
        <input
          id="email-or-phone"
          type="text"
          autoComplete="email"
          inputMode="email"
          value={identifier}
          onChange={(event) => setIdentifier(event.target.value)}
          placeholder="you@example.com or 930804303"
          className="rounded-lg border border-paper-200 bg-white px-3.5 py-2.5 text-sm text-ink-950 outline-none transition-colors placeholder:text-ink-500/60 focus:border-ember-400 dark:border-ink-800 dark:bg-ink-900 dark:text-paper-50"
        />
        <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">
          We'll send a link to your email, or instructions via Telegram if you registered by phone.
        </p>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={cn(
          "flex items-center justify-center gap-2 rounded-full bg-ink-900 py-2.5 text-sm font-semibold text-paper-50 transition-colors hover:bg-ink-800 disabled:cursor-not-allowed disabled:opacity-70",
          "dark:bg-ember-400 dark:text-ink-950 dark:hover:bg-ember-300",
        )}
      >
        {isSubmitting && <Loader2 size={16} className="animate-spin" />}
        {isSubmitting ? "Sending link..." : "Send reset link"}
      </button>
    </form>
  );
}
