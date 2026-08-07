import { Link, Navigate } from "react-router-dom";
import { Logo } from "../../components/layout/Navbar/Logo";
import { PasswordResetRequestForm } from "../../features/auth/components/PasswordResetRequestForm";
import { useAuth } from "../../providers/AuthProvider";

export default function PasswordResetPage() {
  const { user, isLoading } = useAuth();

  if (!isLoading && user) return <Navigate to="/" replace />;

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-ink-950 p-10 text-paper-50 lg:flex">
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--color-ember-400), transparent 70%)" }}
        />
        <Logo />
        <blockquote className="relative max-w-md">
          <p className="font-display text-2xl italic leading-snug text-paper-50">
            "Locked out? Every good story has a second chance."
          </p>
          <footer className="mt-3 text-sm text-ink-300">
            We'll send you a link to get back to your courses in no time.
          </footer>
        </blockquote>
      </div>

      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <h1 className="font-display text-2xl italic text-ink-950 dark:text-paper-50">
            Reset your password
          </h1>
          <p className="mb-6 mt-1 text-sm text-ink-600 dark:text-ink-300">
            Remembered it?{" "}
            <Link to="/login" className="font-medium text-ink-900 hover:underline dark:text-paper-50">
              Back to sign in
            </Link>
          </p>
          <PasswordResetRequestForm />
        </div>
      </div>
    </div>
  );
}
