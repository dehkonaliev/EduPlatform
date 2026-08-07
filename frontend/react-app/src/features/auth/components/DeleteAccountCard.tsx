import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, ArrowLeft, Loader2, Mail, MessageCircle, Trash2 } from "lucide-react";
import { authApi } from "../api/authApi";
import { useAuth } from "../../../providers/AuthProvider";
import { useToast } from "../../../providers/ToastProvider";
import { parseApiError } from "../../../lib/api/parseApiError";
import { cn } from "../../../lib/utils";
import type { VerifyType } from "../types";

const inputClass =
  "rounded-lg border bg-white px-3.5 py-2.5 text-sm text-ink-950 outline-none transition-colors placeholder:text-ink-500/60 focus:border-ember-400 dark:bg-ink-900 dark:text-paper-50";

interface DeletionMethod {
  type: VerifyType;
  label: string;
  description: string;
}

export function DeleteAccountCard() {
  const { user, refetchUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState<"idle" | "code">("idle");
  const [selectedType, setSelectedType] = useState<VerifyType | null>(null);
  const [code, setCode] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const methods = useMemo<DeletionMethod[]>(() => {
    if (!user) return [];
    const result: DeletionMethod[] = [];
    if (user.email_verified) {
      result.push({
        type: "VIA_EMAIL",
        label: user.email ?? "Email",
        description: "We'll email you a verification code.",
      });
    }
    if (user.phone_verified) {
      result.push({
        type: "VIA_PHONE",
        label: user.phone_number ?? "Phone",
        description: "You'll get the code from our Telegram bot.",
      });
    }
    return result;
  }, [user]);

  const effectiveType = selectedType ?? methods[0]?.type ?? null;

  if (!user) return null;

  async function handleSend() {
    if (!effectiveType) return;

    setFieldError(null);
    setGeneralError(null);
    setIsSending(true);
    try {
      await authApi.requestAccountDeletion(effectiveType);
      setStep("code");
      showToast("Verification code sent. Check your email or Telegram bot.");
    } catch (err) {
      setGeneralError(parseApiError(err).generalMessage);
    } finally {
      setIsSending(false);
    }
  }

  async function handleConfirmDelete() {
    if (code.length !== 6) {
      setFieldError("Enter the 6-digit code.");
      return;
    }

    setFieldError(null);
    setGeneralError(null);
    setIsDeleting(true);
    try {
      await authApi.confirmAccountDeletion(code);
      await refetchUser(); // account_status becomes DELETED → clears session
      showToast("Your account has been deleted. We're sorry to see you go!");
      navigate("/");
    } catch (err) {
      setGeneralError(parseApiError(err).generalMessage);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-red-200 bg-red-50/40 p-5 dark:border-red-500/30 dark:bg-red-500/5">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400">
          <Trash2 size={16} />
        </span>
        <div>
          <h3 className="text-sm font-semibold text-ink-950 dark:text-paper-50">Delete account</h3>
          <p className="mt-0.5 text-xs text-ink-500 dark:text-ink-400">
            Permanently delete your account, enrollments, and progress. This cannot be undone.
          </p>
        </div>
      </div>

      <div className="mt-4">
        {generalError && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400"
          >
            {generalError}
          </div>
        )}

        {methods.length === 0 ? (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-white px-3.5 py-3 text-sm text-ink-700 dark:border-red-500/30 dark:bg-ink-900 dark:text-ink-200">
            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-red-500 dark:text-red-400" />
            <span>
              To delete your account you first need a verified email or phone number. Verify one
              above and come back here.
            </span>
          </div>
        ) : step === "idle" ? (
          <div className="flex flex-col gap-3">
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-1 text-xs font-medium text-ink-600 dark:text-ink-300">
                Receive the verification code via
              </legend>
              {methods.map((method) => (
                <label
                  key={method.type}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-lg border bg-white px-3.5 py-3 transition-colors dark:bg-ink-900",
                    effectiveType === method.type
                      ? "border-red-300 ring-1 ring-red-300 dark:border-red-500/40 dark:ring-red-500/30"
                      : "border-paper-200 hover:border-ink-300 dark:border-ink-800 dark:hover:border-ink-600",
                  )}
                >
                  <input
                    type="radio"
                    name="delete-method"
                    value={method.type}
                    checked={effectiveType === method.type}
                    onChange={() => setSelectedType(method.type)}
                    className="mt-0.5 accent-red-500"
                  />
                  <span className="flex min-w-0 flex-col">
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-900 dark:text-paper-50">
                      {method.type === "VIA_EMAIL" ? <Mail size={14} /> : <MessageCircle size={14} />}
                      {method.label}
                    </span>
                    <span className="mt-0.5 text-xs text-ink-500 dark:text-ink-400">
                      {method.description}
                    </span>
                  </span>
                </label>
              ))}
            </fieldset>

            <button
              type="button"
              onClick={handleSend}
              disabled={isSending || !effectiveType}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-500/30 dark:bg-ink-900 dark:text-red-400 dark:hover:bg-red-500/10"
            >
              {isSending && <Loader2 size={15} className="animate-spin" />}
              {isSending ? "Sending..." : "Send verification code"}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="delete-code" className="text-sm font-medium text-ink-800 dark:text-paper-100">
              Verification code
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                id="delete-code"
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
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isDeleting && <Loader2 size={15} className="animate-spin" />}
                {isDeleting ? "Deleting..." : "Delete my account"}
              </button>
            </div>
            <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">
              Enter the code we sent to confirm deletion. This action is permanent.
            </p>
            {fieldError && <p className="text-xs text-red-600 dark:text-red-400">{fieldError}</p>}

            <button
              type="button"
              onClick={() => setStep("idle")}
              className="mt-2 inline-flex items-center gap-1 self-start text-xs font-medium text-ink-500 transition-colors hover:text-ink-800 dark:text-ink-300 dark:hover:text-paper-100"
            >
              <ArrowLeft size={13} /> Go back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
