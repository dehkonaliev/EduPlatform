import { useState, type FormEvent } from "react";
import { GraduationCap, Loader2, Presentation } from "lucide-react";
import { authApi } from "../../api/authApi";
import { tokenStorage } from "../../../../lib/api/tokenStorage";
import { parseApiError } from "../../../../lib/api/parseApiError";
import { cn } from "../../../../lib/utils";
import type { UserRole } from "../../types";

interface Props {
  onSuccess: () => void;
}

const ROLES: Array<{ id: UserRole; label: string; description: string; icon: typeof GraduationCap }> = [
  { id: "STUDENT", label: "Student", description: "I want to learn", icon: GraduationCap },
  { id: "INSTRUCTOR", label: "Instructor", description: "I want to teach", icon: Presentation },
];

export function SignupProfileStep({ onSuccess }: Props) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState<UserRole>("STUDENT");
  const [password, setPassword] = useState("");
  const [confPassword, setConfPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFieldErrors({});
    setGeneralError(null);

    const token = tokenStorage.getActivationToken();
    if (!token) {
      setGeneralError("Your verification session expired. Please start signup again.");
      return;
    }

    if (password !== confPassword) {
      setFieldErrors({ conf_password: "Passwords don't match." });
      return;
    }

    setIsSubmitting(true);
    try {
      await authApi.activateAccount({
        token,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        username: username.trim(),
        user_role: role,
        password,
        conf_password: confPassword,
      });
      tokenStorage.clearActivationToken();
      onSuccess();
    } catch (err) {
      const parsed = parseApiError(err);
      setFieldErrors(parsed.fieldErrors);
      // "token" errors aren't tied to a visible field, so surface them as a banner
      setGeneralError(parsed.fieldErrors.token ?? null);
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputClass =
    "rounded-lg border bg-white px-3.5 py-2.5 text-sm text-ink-950 outline-none transition-colors placeholder:text-ink-500/60 focus:border-ember-400 dark:bg-ink-900 dark:text-paper-50";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      {generalError && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400"
        >
          {generalError}
        </div>
      )}

      {/* Role selection */}
      <div className="grid grid-cols-2 gap-3">
        {ROLES.map(({ id, label, description, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setRole(id)}
            className={cn(
              "flex flex-col items-start gap-1 rounded-xl border p-3.5 text-left transition-colors",
              role === id
                ? "border-ember-400 bg-ember-400/10"
                : "border-paper-200 hover:border-ink-300 dark:border-ink-800 dark:hover:border-ink-600",
            )}
          >
            <Icon
              size={18}
              className={role === id ? "text-ember-500 dark:text-ember-400" : "text-ink-500 dark:text-ink-300"}
            />
            <span className="text-sm font-semibold text-ink-950 dark:text-paper-50">{label}</span>
            <span className="text-xs text-ink-500 dark:text-ink-300">{description}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="firstName" className="text-sm font-medium text-ink-800 dark:text-paper-100">
            First name
          </label>
          <input
            id="firstName"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            className={cn(inputClass, fieldErrors.first_name ? "border-red-400" : "border-paper-200 dark:border-ink-800")}
          />
          {fieldErrors.first_name && <p className="text-xs text-red-600 dark:text-red-400">{fieldErrors.first_name}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="lastName" className="text-sm font-medium text-ink-800 dark:text-paper-100">
            Last name
          </label>
          <input
            id="lastName"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            className={cn(inputClass, fieldErrors.last_name ? "border-red-400" : "border-paper-200 dark:border-ink-800")}
          />
          {fieldErrors.last_name && <p className="text-xs text-red-600 dark:text-red-400">{fieldErrors.last_name}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="username" className="text-sm font-medium text-ink-800 dark:text-paper-100">
          Username
        </label>
        <input
          id="username"
          autoComplete="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          className={cn(inputClass, "w-full", fieldErrors.username ? "border-red-400" : "border-paper-200 dark:border-ink-800")}
        />
        {fieldErrors.username && <p className="text-xs text-red-600 dark:text-red-400">{fieldErrors.username}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium text-ink-800 dark:text-paper-100">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className={cn(inputClass, "w-full", fieldErrors.password ? "border-red-400" : "border-paper-200 dark:border-ink-800")}
        />
        {fieldErrors.password && <p className="text-xs text-red-600 dark:text-red-400">{fieldErrors.password}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="confPassword" className="text-sm font-medium text-ink-800 dark:text-paper-100">
          Confirm password
        </label>
        <input
          id="confPassword"
          type="password"
          autoComplete="new-password"
          value={confPassword}
          onChange={(event) => setConfPassword(event.target.value)}
          className={cn(inputClass, "w-full", fieldErrors.conf_password ? "border-red-400" : "border-paper-200 dark:border-ink-800")}
        />
        {fieldErrors.conf_password && (
          <p className="text-xs text-red-600 dark:text-red-400">{fieldErrors.conf_password}</p>
        )}
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
        {isSubmitting ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
}