import { useState, type FormEvent } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, Mail, Phone, User } from "lucide-react";
import { useAuth } from "../../../providers/AuthProvider";
import { cn } from "../../../lib/utils";
import { parseApiError } from "../../../lib/api/parseApiError";

type LoginMethod = "phone" | "username" | "email";

const METHODS: Array<{ id: LoginMethod; label: string; icon: typeof Mail }> = [
  { id: "phone", label: "Phone", icon: Phone },
  { id: "username", label: "Username", icon: User },
  { id: "email", label: "Email", icon: Mail },
];

// Per-method input attributes — purely UX (keyboard type, placeholder,
// autocomplete hint). All three still submit to the same
// `email_username_phone` field, since your backend figures out which kind
// it received.
const METHOD_CONFIG: Record<
  LoginMethod,
  { inputType: string; placeholder: string; autoComplete: string; inputMode?: "tel" | "email" | "text" }
> = {
  phone: { inputType: "tel", placeholder: "930804303", autoComplete: "tel", inputMode: "tel" },
  username: { inputType: "text", placeholder: "your_username", autoComplete: "username", inputMode: "text" },
  email: { inputType: "email", placeholder: "you@example.com", autoComplete: "email", inputMode: "email" },
};

export function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [method, setMethod] = useState<LoginMethod>("phone");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const config = METHOD_CONFIG[method];

  function handleMethodChange(next: LoginMethod) {
    setMethod(next);
    setIdentifier("");
    setError(null);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!identifier.trim() || !password) {
      setError("Please fill in both fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      await login({ email_username_phone: identifier.trim(), password });
      const redirectTo = (location.state as { from?: string } | null)?.from ?? "/";
      navigate(redirectTo, { replace: true });
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

      {/* Segmented control — purely a UX affordance, all three post to the same field */}
      <div
        role="tablist"
        aria-label="Login method"
        className="grid grid-cols-3 gap-1 rounded-full bg-paper-100 p-1 dark:bg-ink-900"
      >
        {METHODS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={method === id}
            onClick={() => handleMethodChange(id)}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-full py-1.5 text-xs font-medium transition-colors",
              method === id
                ? "bg-white text-ink-950 shadow-sm dark:bg-ink-700 dark:text-paper-50"
                : "text-ink-500 hover:text-ink-800 dark:text-ink-300 dark:hover:text-paper-100",
            )}
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="identifier" className="text-sm font-medium text-ink-800 dark:text-paper-100">
          {method === "phone" ? "Phone number" : method === "email" ? "Email address" : "Username"}
        </label>
        <input
          id="identifier"
          type={config.inputType}
          inputMode={config.inputMode}
          autoComplete={config.autoComplete}
          value={identifier}
          onChange={(event) => setIdentifier(event.target.value)}
          placeholder={config.placeholder}
          className="rounded-lg border border-paper-200 bg-white px-3.5 py-2.5 text-sm text-ink-950 outline-none transition-colors placeholder:text-ink-500/60 focus:border-ember-400 dark:border-ink-800 dark:bg-ink-900 dark:text-paper-50"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="text-sm font-medium text-ink-800 dark:text-paper-100">
            Password
          </label>
          <Link
            to="/password-reset"
            className="text-xs font-medium text-ember-600 hover:underline dark:text-ember-400"
          >
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            className="w-full rounded-lg border border-paper-200 bg-white px-3.5 py-2.5 pr-10 text-sm text-ink-950 outline-none transition-colors placeholder:text-ink-500/60 focus:border-ember-400 dark:border-ink-800 dark:bg-ink-900 dark:text-paper-50"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-800 dark:text-ink-300 dark:hover:text-paper-50"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
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
        {isSubmitting ? "Signing in..." : "Sign in"}
      </button>

      <p className="text-center text-sm text-ink-600 dark:text-ink-300">
        New to Curiosite?{" "}
        <Link to="/signup" className="font-medium text-ink-900 hover:underline dark:text-paper-50">
          Create an account
        </Link>
      </p>
    </form>
  );
}