import { PasswordChangeCard } from "../../features/auth/components/PasswordChangeCard";

export default function PasswordSection() {
  return (
    <section className="max-w-xl">
      <h2 className="mb-1 text-sm font-semibold text-ink-950 dark:text-paper-50">Password</h2>
      <p className="mb-5 text-xs text-ink-500 dark:text-ink-400">
        Keep your account secure with a strong password.
      </p>

      <PasswordChangeCard />
    </section>
  );
}
