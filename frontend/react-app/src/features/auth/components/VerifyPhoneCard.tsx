import { useState } from "react";
import { ArrowLeft, Loader2, MessageCircle } from "lucide-react";
import { authApi } from "../api/authApi";
import { useAuth } from "../../../providers/AuthProvider";
import { useToast } from "../../../providers/ToastProvider";
import { parseApiError } from "../../../lib/api/parseApiError";
import { cn } from "../../../lib/utils";
import { VerifiedBadge } from "./VerifiedBadge";

// Same rule as the backend (authentication/serializers.py VerifyPhoneSerializer).
const PHONE_REGEX = /^\d{9}$/;

const inputClass =
  "rounded-lg border bg-white px-3.5 py-2.5 text-sm text-ink-950 outline-none transition-colors placeholder:text-ink-500/60 focus:border-ember-400 dark:bg-ink-900 dark:text-paper-50";

export function VerifyPhoneCard() {
  const { user, refetchUser } = useAuth();
  const { showToast } = useToast();

  const [phone, setPhone] = useState(user?.phone_number ?? "");
  const [step, setStep] = useState<"idle" | "code">("idle");
  const [code, setCode] = useState("");
  const [sentTo, setSentTo] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  if (!user) return null;

  async function handleSend() {
    const trimmed = phone.trim();
    if (!PHONE_REGEX.test(trimmed)) {
      setFieldError("Please enter a valid 9-digit phone number.");
      return;
    }

    setFieldError(null);
    setGeneralError(null);
    setIsSending(true);
    try {
      const result = await authApi.requestPhoneVerification(trimmed);
      setSentTo(result.phone_number);
      setStep("code");
      showToast("Verification code sent to your Telegram bot.");
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
      const result = await authApi.verifyPhoneCode(code);
      await refetchUser(); // picks up the new phone + phone_verified flag
      setPhone(result.phone_number);
      setCode("");
      setStep("idle");
      showToast("Phone number verified!");
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
            <MessageCircle size={16} />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-ink-950 dark:text-paper-50">
              Phone number
            </h3>
            <p className="mt-0.5 text-xs text-ink-500 dark:text-ink-400">
              Verification codes are delivered through our Telegram bot.
            </p>
          </div>
        </div>
        <VerifiedBadge verified={user.phone_verified} />
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
            <label htmlFor="verify-phone" className="text-sm font-medium text-ink-800 dark:text-paper-100">
              Phone number
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                id="verify-phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                value={phone}
                onChange={(event) => {
                  const digits = event.target.value.replace(/\D/g, "");
                  setPhone(digits.slice(0, 9));
                }}
                placeholder="901234567"
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
              Adding or changing your phone number requires a verification code.
            </p>
            {fieldError && <p className="text-xs text-red-600 dark:text-red-400">{fieldError}</p>}
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="verify-phone-code" className="text-sm font-medium text-ink-800 dark:text-paper-100">
              Verification code
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                id="verify-phone-code"
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
                {isVerifying ? "Verifying..." : "Verify phone"}
              </button>
            </div>
            <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">
              We sent a 6-digit code for{" "}
              <span className="font-medium text-ink-800 dark:text-paper-100">{sentTo}</span> to
              your Telegram bot.
            </p>
            {fieldError && <p className="text-xs text-red-600 dark:text-red-400">{fieldError}</p>}

            <div className="mt-2 flex items-center gap-4">
              <button
                type="button"
                onClick={() => setStep("idle")}
                className="inline-flex items-center gap-1 text-xs font-medium text-ink-500 transition-colors hover:text-ink-800 dark:text-ink-300 dark:hover:text-paper-100"
              >
                <ArrowLeft size={13} /> Change phone number
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
