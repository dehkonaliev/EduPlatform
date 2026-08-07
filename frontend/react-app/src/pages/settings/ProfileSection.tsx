import { EditProfileForm } from "../../features/auth/components/EditProfileForm";

export default function ProfileSection() {
  return (
    <section className="max-w-xl">
      <h2 className="mb-1 text-sm font-semibold text-ink-950 dark:text-paper-50">
        Profile information
      </h2>
      <p className="mb-5 text-xs text-ink-500 dark:text-ink-400">
        This is what other people on Curiosite see.
      </p>
      <EditProfileForm />
    </section>
  );
}