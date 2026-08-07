import { useState, type FormEvent } from "react";
import { Eye, EyeOff, KeyRound, Loader2 } from "lucide-react";
import { authApi } from "../api/authApi";
import { useToast } from "../../../providers/ToastProvider";
import { parseApiError } from "../../../lib/api/parseApiError";
import { cn } from "../../../lib/utils";

const inputClass =
  "w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-ink-950 outline-none transition-colors placeholder:text-ink-500/60 focus:border-ember-400 dark:bg-ink-900 dark:text-paper-50";

export function PasswordChangeCard() {
  const { showToast } = useToast();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confPassword, setConfPassword] = useState("");
  const [show, setShow] = useState<"old" | "new" | "conf" | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFieldErrors({});
    setGeneralError(null);

    if (!oldPassword || !newPassword || !confPassword) {
      setGeneralError("Please fill in all fields.");
      return;
    }
    if (newPassword !== confPassword) {
      setFieldErrors({ conf_password: "Passwords do not match." });
      return;
    }

    setIsSubmitting(true);
    try {
      await authApi.changePassword({
        old_password: oldPassword,
        new_password: newPassword,
        conf_password: confPassword,
      });
      setOldPassword("");
      setNewPassword("");
      setConfPassword("");
      showToast("Password changed successfully!");
    } catch (err) {
      const parsed = parseApiError(err);
      setFieldErrors(parsed.fieldErrors);
      setGeneralError(parsed.generalMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  function toggle(field: "old" | "new" | "conf") {
    setShow((prev) => (prev === field ? null : field));
  }

  const passwordInputs = [
    { id: "old-password", field: "old" as const, label: "Current password", value: oldPassword, setValue: setOldPassword, autoComplete: "current-password" },
    { id: "new-password", field: "new" as const, label: "New password", value: newPassword, setValue: setNewPassword, autoComplete: "new-password" },
    { id: "conf-password", field: "conf" as const, label: "Confirm new password", value: confPassword, setValue: setConfPassword, autoComplete: "new-password" },
  ];

  return (
    <div className="rounded-2xl border border-paper-200 bg-white p-5 dark:border-ink-800 dark:bg-ink-900">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-paper-100 text-ink-600 dark:bg-ink-800 dark:text-ink-200">
          <KeyRound size={16} />
        </span>
        <div>
          <h3 className="text-sm font-semibold text-ink-950 dark:text-paper-50">Password</h3>
          <p className="mt-0.5 text-xs text-ink-500 dark:text-ink-400">
            You'll be asked to sign in again after changing it.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4" noValidate>
        {generalError && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400"
          >
            {generalError}
          </div>
        )}

        {passwordInputs.map(({ id, field, label, value, setValue, autoComplete }) => (
          <div key={id} className="flex flex-col gap-1.5">
            <label htmlFor={id} className="text-sm font-medium text-ink-800 dark:text-paper-100">
              {label}
            </label>
            <div className="relative">
              <input
                id={id}
                type={show === field ? "text" : "password"}
                autoComplete={autoComplete}
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder="••••••••"
                className={cn(
                  inputClass,
                  "pr-10",
                  fieldErrors[field === "conf" ? "conf_password" : field === "new" ? "new_password" : "old_password"]
                    ? "border-red-400"
                    : "border-paper-200 dark:border-ink-800",
                )}
              />
              <button
                type="button"
                onClick={() => toggle(field)}
                aria-label={show === field ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-800 dark:text-ink-300 dark:hover:text-paper-50"
              >
                {show === field ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {fieldErrors[field === "conf" ? "conf_password" : field === "new" ? "new_password" : "old_password"] && (
              <p className="text-xs text-red-600 dark:text-red-400">
                {fieldErrors[field === "conf" ? "conf_password" : field === "new" ? "new_password" : "old_password"]}
              </p>
            )}
          </div>
        ))}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-ink-900 px-4 py-2.5 text-sm font-semibold text-paper-50 transition-colors hover:bg-ink-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-ember-400 dark:text-ink-950 dark:hover:bg-ember-300"
        >
          {isSubmitting && <Loader2 size={15} className="animate-spin" />}
          {isSubmitting ? "Changing..." : "Change password"}
        </button>
      </form>
    </div>
  );
}
