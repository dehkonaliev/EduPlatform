import { Link, Navigate, useNavigate } from "react-router-dom";
import { Logo } from "../../components/layout/Navbar/Logo";
import { SignupWizard } from "../../features/auth/components/SignupWizard";
import { useAuth } from "../../providers/AuthProvider";

export default function SignupPage() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

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
            "Every course is a door. All you have to do is knock."
          </p>
          <footer className="mt-3 text-sm text-ink-300">
            Join as a student or start teaching — takes about a minute.
          </footer>
        </blockquote>
      </div>

      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <h1 className="font-display text-2xl italic text-ink-950 dark:text-paper-50">
            Create your account
          </h1>
          <p className="mb-6 mt-1 text-sm text-ink-600 dark:text-ink-300">
            Already have one?{" "}
            <Link to="/login" className="font-medium text-ink-900 hover:underline dark:text-paper-50">
              Sign in
            </Link>
          </p>
          <SignupWizard
            onComplete={() =>
              navigate("/login", { state: { justActivated: true }, replace: true })
            }
          />
        </div>
      </div>
    </div>
  );
}