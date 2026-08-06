import { Navigate, useLocation } from "react-router-dom";
import { Logo } from "../../components/layout/Navbar/Logo";
import { LoginForm } from "../../features/auth/components/LoginForm";
import { useAuth } from "../../providers/AuthProvider";

export default function LoginPage() {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const justActivated = (location.state as { justActivated?: boolean } | null)?.justActivated;

  // Already signed in? Don't show the login page.
  if (!isLoading && user) return <Navigate to="/" replace />;

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel — hidden on small screens, this is a decorative detail not core content */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-ink-950 p-10 text-paper-50 lg:flex">
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--color-ember-400), transparent 70%)" }}
        />
        <Logo />
        <blockquote className="relative max-w-md">
          <p className="font-display text-2xl italic leading-snug text-paper-50">
            "Curiosity is the compass. Structured lessons are the map."
          </p>
          <footer className="mt-3 text-sm text-ink-300">
            Pick up right where you left off, on every device.
          </footer>
        </blockquote>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <h1 className="font-display text-2xl italic text-ink-950 dark:text-paper-50">
            Welcome back
          </h1>
          <p className="mb-6 mt-1 text-sm text-ink-600 dark:text-ink-300">
            Sign in to continue your learning.
          </p>
          {justActivated && (
            <div className="mb-4 rounded-lg border border-teal-500/30 bg-teal-500/10 px-3.5 py-2.5 text-sm text-teal-700 dark:text-teal-400">
              Account created! Sign in to get started.
            </div>
          )}
          <LoginForm />
        </div>
      </div>
    </div>
  );
}