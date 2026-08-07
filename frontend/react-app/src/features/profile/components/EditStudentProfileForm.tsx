import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { profileApi } from "../api/profileApi";
import { useToast } from "../../../providers/ToastProvider";
import { parseApiError } from "../../../lib/api/parseApiError";
import { cn } from "../../../lib/utils";
import { Switch } from "../../../components/ui/Switch";
import type { Gender, StudentProfile } from "../types";

const BIO_MAX_LENGTH = 300; // not confirmed against backend — adjust if it rejects a shorter/longer limit

interface Props {
  profile: StudentProfile;
  onSaved: (updated: StudentProfile) => void;
}

export function EditStudentProfileForm({ profile, onSaved }: Props) {
  const { showToast } = useToast();
  const [gender, setGender] = useState<Gender | "">(profile.gender ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [isVisible, setIsVisible] = useState(profile.is_visible);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFieldErrors({});
    setGeneralError(null);

    const diff: { gender?: Gender | null; bio?: string; is_visible?: boolean } = {};
    const normalizedGender = gender || null;
    if (normalizedGender !== profile.gender) diff.gender = normalizedGender;
    if (bio !== (profile.bio ?? "")) diff.bio = bio;
    if (isVisible !== profile.is_visible) diff.is_visible = isVisible;

    if (Object.keys(diff).length === 0) {
      showToast("Nothing to save — no changes made.");
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await profileApi.updateStudentProfile(diff);
      onSaved(updated);
      showToast("Student details updated successfully.");
    } catch (err) {
      const parsed = parseApiError(err);
      setFieldErrors(parsed.fieldErrors);
      const knownFields = ["gender", "bio", "is_visible"];
      const hasUnmapped = Object.keys(parsed.fieldErrors).some((key) => !knownFields.includes(key));
      if (hasUnmapped || Object.keys(parsed.fieldErrors).length === 0) {
        setGeneralError(parsed.generalMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
      {generalError && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400"
        >
          {generalError}
        </div>
      )}

      {/* Gender */}
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-ink-800 dark:text-paper-100">Gender</span>
        <div className="flex gap-2">
          {(["MALE", "FEMALE"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setGender(gender === option ? "" : option)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium capitalize transition-colors",
                gender === option
                  ? "border-ember-400 bg-ember-400/10 text-ember-600 dark:text-ember-400"
                  : "border-paper-200 text-ink-600 hover:border-ink-300 dark:border-ink-800 dark:text-ink-300 dark:hover:border-ink-600",
              )}
            >
              {option.toLowerCase()}
            </button>
          ))}
        </div>
        <p className="text-xs text-ink-500 dark:text-ink-400">Optional — click again to clear.</p>
        {fieldErrors.gender && <p className="text-xs text-red-600 dark:text-red-400">{fieldErrors.gender}</p>}
      </div>

      {/* Bio */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between">
          <label htmlFor="bio" className="text-sm font-medium text-ink-800 dark:text-paper-100">
            Bio
          </label>
          <span
            className={cn(
              "text-xs",
              bio.length > BIO_MAX_LENGTH ? "text-red-600 dark:text-red-400" : "text-ink-400 dark:text-ink-500",
            )}
          >
            {bio.length}/{BIO_MAX_LENGTH}
          </span>
        </div>
        <textarea
          id="bio"
          value={bio}
          onChange={(event) => setBio(event.target.value)}
          rows={4}
          maxLength={BIO_MAX_LENGTH}
          placeholder="Tell other learners a bit about yourself..."
          className={cn(
            "resize-none rounded-lg border bg-white px-3.5 py-2.5 text-sm text-ink-950 outline-none transition-colors placeholder:text-ink-500/60 focus:border-ember-400 dark:bg-ink-900 dark:text-paper-50",
            fieldErrors.bio ? "border-red-400" : "border-paper-200 dark:border-ink-800",
          )}
        />
        {fieldErrors.bio && <p className="text-xs text-red-600 dark:text-red-400">{fieldErrors.bio}</p>}
      </div>

      {/* Visibility */}
      <div className="rounded-lg border border-paper-200 p-4 dark:border-ink-800">
        <Switch
          checked={isVisible}
          onChange={setIsVisible}
          label="Public profile"
          description="Let other students and instructors see your profile and progress."
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "flex items-center justify-center gap-2 rounded-full bg-ink-900 px-5 py-2.5 text-sm font-semibold text-paper-50 transition-colors hover:bg-ink-800 disabled:cursor-not-allowed disabled:opacity-70",
            "dark:bg-ember-400 dark:text-ink-950 dark:hover:bg-ember-300",
          )}
        >
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          {isSubmitting ? "Saving..." : "Save changes"}
        </button>
      </div>
    </form>
  );
}