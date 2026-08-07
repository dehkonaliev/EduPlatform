import { useState } from "react";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import { authApi } from "../api/authApi";
import { useAuth } from "../../../providers/AuthProvider";
import { useToast } from "../../../providers/ToastProvider";
import { parseApiError } from "../../../lib/api/parseApiError";
import { cn } from "../../../lib/utils";
import { VerifiedBadge } from "./VerifiedBadge";

// Same rule as the backend (authentication/serializers.py VerifyEmailSerializer).
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const inputClass =
  "rounded-lg border bg-white px-3.5 py-2.5 text-sm text-ink-950 outline-none transition-colors placeholder:text-ink-500/60 focus:border-ember-400 dark:bg-ink-900 dark:text-paper-50";

export function VerifyEmailCard() {
  const { user, refetchUser } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState(user?.email ?? "");
  const [step, setStep] = useState<"idle" | "code">("idle");
  const [code, setCode] = useState("");
  const [sentTo, setSentTo] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  if (!user) return null;

  async function handleSend() {
    const trimmed = email.trim();
    if (!EMAIL_REGEX.test(trimmed)) {
      setFieldError("Please enter a valid email address.");
      return;
    }

    setFieldError(null);
    setGeneralError(null);
    setIsSending(true);
    try {
      const result = await authApi.requestEmailVerification(trimmed);
      setSentTo(result.email);
      setStep("code");
      showToast("Verification code sent to your email.");
    } catch (err) {
      setGeneralError(parseApiError(err).generalMessage);
    } finally {
      setIsSending(false);
    }
  }

  async function handleVerify() {
    if (code.length !== 6) {
      setFieldError("Enter the 6-digit code.");
      return;
    }

    setFieldError(null);
    setGeneralError(null);
    setIsVerifying(true);
    try {
      const result = await authApi.verifyEmailCode(code);
      await refetchUser(); // picks up the new email + email_verified flag
      setEmail(result.email);
      setCode("");
      setStep("idle");
      showToast("Email verified successfully!");
    } catch (err) {
      setGeneralError(parseApiError(err).generalMessage);
    } finally {
      setIsVerifying(false);
    }
  }

  return (
    <div className="rounded-2xl border border-paper-200 bg-white p-5 dark:border-ink-800 dark:bg-ink-900">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-paper-100 text-ink-600 dark:bg-ink-800 dark:text-ink-200">
            <Mail size={16} />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-ink-950 dark:text-paper-50">
              Email address
            </h3>
            <p className="mt-0.5 text-xs text-ink-500 dark:text-ink-400">
              Used for login, receipts, and notifications.
            </p>
          </div>
        </div>
        <VerifiedBadge verified={user.email_verified} />
      </div>

      <div className="mt-5">
        {generalError && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400"
          >
            {generalError}
          </div>
        )}

        {step === "idle" ? (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="verify-email" className="text-sm font-medium text-ink-800 dark:text-paper-100">
              Email
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                id="verify-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className={cn(
                  inputClass,
                  "w-full",
                  fieldError ? "border-red-400" : "border-paper-200 dark:border-ink-800",
                )}
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={isSending}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-ink-900 px-4 py-2.5 text-sm font-semibold text-paper-50 transition-colors hover:bg-ink-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-ember-400 dark:text-ink-950 dark:hover:bg-ember-300"
              >
                {isSending && <Loader2 size={15} className="animate-spin" />}
                {isSending ? "Sending..." : "Send code"}
              </button>
            </div>
            <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">
              Adding or changing your email requires a verification code.
            </p>
            {fieldError && <p className="text-xs text-red-600 dark:text-red-400">{fieldError}</p>}
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="verify-email-code" className="text-sm font-medium text-ink-800 dark:text-paper-100">
              Verification code
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                id="verify-email-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                autoFocus
                value={code}
                onChange={(event) => {
                  const digits = event.target.value.replace(/\D/g, "");
                  setCode(digits.slice(0, 6));
                }}
                placeholder="6-digit code"
                className={cn(
                  inputClass,
                  "w-full font-mono tracking-[0.3em]",
                  fieldError ? "border-red-400" : "border-paper-200 dark:border-ink-800",
                )}
              />
              <button
                type="button"
                onClick={handleVerify}
                disabled={isVerifying}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-paper-50 transition-colors hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isVerifying && <Loader2 size={15} className="animate-spin" />}
                {isVerifying ? "Verifying..." : "Verify email"}
              </button>
            </div>
            <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">
              We sent a 6-digit code to <span className="font-medium text-ink-800 dark:text-paper-100">{sentTo}</span>.
              Check your inbox.
            </p>
            {fieldError && <p className="text-xs text-red-600 dark:text-red-400">{fieldError}</p>}

            <div className="mt-2 flex items-center gap-4">
              <button
                type="button"
                onClick={() => setStep("idle")}
                className="inline-flex items-center gap-1 text-xs font-medium text-ink-500 transition-colors hover:text-ink-800 dark:text-ink-300 dark:hover:text-paper-100"
              >
                <ArrowLeft size={13} /> Change email
              </button>
              <button
                type="button"
                onClick={handleSend}
                disabled={isSending}
                className="text-xs font-medium text-ember-600 transition-colors hover:text-ember-500 disabled:opacity-60 dark:text-ember-400"
              >
                Resend code
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
