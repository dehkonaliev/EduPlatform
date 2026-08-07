import { VerifyEmailCard } from "../../features/auth/components/VerifyEmailCard";
import { VerifyPhoneCard } from "../../features/auth/components/VerifyPhoneCard";
import { DeleteAccountCard } from "../../features/auth/components/DeleteAccountCard";

export default function AccountSection() {
  return (
    <section className="max-w-xl">
      <h2 className="mb-1 text-sm font-semibold text-ink-950 dark:text-paper-50">
        Security & verification
      </h2>
      <p className="mb-5 text-xs text-ink-500 dark:text-ink-400">
        Verify your contact details and manage your account.
      </p>

      <div className="flex flex-col gap-4">
        <VerifyEmailCard />
        <VerifyPhoneCard />
        <DeleteAccountCard />
      </div>
    </section>
  );
}
