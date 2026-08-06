import { useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";
import { Loader2 } from "lucide-react";
import { authApi } from "../../api/authApi";
import { tokenStorage } from "../../../../lib/api/tokenStorage";
import { parseApiError } from "../../../../lib/api/parseApiError";
import { cn } from "../../../../lib/utils";

const CODE_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 30;

interface Props {
  emailOrPhone: string;
  onSuccess: () => void;
  onBack: () => void;
}

export function SignupCodeStep({ emailOrPhone, onSuccess, onBack }: Props) {
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  function updateDigit(index: number, char: string) {
    if (!/^\d?$/.test(char)) return; // digits only
    setDigits((prev) => {
      const next = [...prev];
      next[index] = char;
      return next;
    });
    if (char && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH);
    if (!pasted) return;
    event.preventDefault();
    setDigits((prev) => {
      const next = [...prev];
      for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
      return next;
    });
    inputRefs.current[Math.min(pasted.length, CODE_LENGTH - 1)]?.focus();
  }

  async function handleSubmit(code: string) {
    setError(null);
    if (code.length !== CODE_LENGTH) {
      setError("Enter the full 6-digit code.");
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await authApi.verifyCode({
        email_or_phone: emailOrPhone,
        verification_code: code,
      });
      tokenStorage.setActivationToken(result.token);
      onSuccess();
    } catch (err) {
      setError(parseApiError(err).generalMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResend() {
    if (cooldown > 0) return;
    setError(null);
    try {
      await authApi.signup({ email_or_phone: emailOrPhone });
      setCooldown(RESEND_COOLDOWN_SECONDS);
      setDigits(Array(CODE_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(parseApiError(err).generalMessage);
    }
  }

  const code = digits.join("");

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400"
        >
          {error}
        </div>
      )}

      <p className="text-sm text-ink-600 dark:text-ink-300">
        Enter the 6-digit code sent to{" "}
        <span className="font-medium text-ink-900 dark:text-paper-50">{emailOrPhone}</span>
      </p>

      <div className="flex justify-between gap-2">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(event) => updateDigit(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onPaste={handlePaste}
            className="h-12 w-11 rounded-lg border border-paper-200 bg-white text-center text-lg font-semibold text-ink-950 outline-none transition-colors focus:border-ember-400 dark:border-ink-800 dark:bg-ink-900 dark:text-paper-50"
          />
        ))}
      </div>

      <button
        type="button"
        onClick={() => handleSubmit(code)}
        disabled={isSubmitting}
        className={cn(
          "flex items-center justify-center gap-2 rounded-full bg-ink-900 py-2.5 text-sm font-semibold text-paper-50 transition-colors hover:bg-ink-800 disabled:cursor-not-allowed disabled:opacity-70",
          "dark:bg-ember-400 dark:text-ink-950 dark:hover:bg-ember-300",
        )}
      >
        {isSubmitting && <Loader2 size={16} className="animate-spin" />}
        {isSubmitting ? "Verifying..." : "Verify"}
      </button>

      <div className="flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={onBack}
          className="text-ink-600 hover:underline dark:text-ink-300"
        >
          Use a different email/phone
        </button>
        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0}
          className="font-medium text-ember-600 hover:underline disabled:cursor-not-allowed disabled:text-ink-400 disabled:no-underline dark:text-ember-400 dark:disabled:text-ink-500"
        >
          {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
        </button>
      </div>
    </div>
  );
}