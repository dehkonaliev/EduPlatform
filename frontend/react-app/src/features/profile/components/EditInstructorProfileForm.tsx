import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { profileApi } from "../api/profileApi";
import { useToast } from "../../../providers/ToastProvider";
import { parseApiError } from "../../../lib/api/parseApiError";
import { cn } from "../../../lib/utils";
import type { InstructorProfile } from "../types";

const HEADLINE_MIN = 5;
const HEADLINE_MAX = 200;
const BIO_MIN = 20;
const BIO_MAX = 2000;

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isLinkedInUrl(value: string): boolean {
  return /(?:https?:\/\/)?(?:www\.)?linkedin\.com\//i.test(value);
}

interface Props {
  profile: InstructorProfile;
  onSaved: (updated: InstructorProfile) => void;
}

export function EditInstructorProfileForm({ profile, onSaved }: Props) {
  const { showToast } = useToast();
  const [headline, setHeadline] = useState(profile.headline ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [linkedinUrl, setLinkedinUrl] = useState(profile.linkedin_url ?? "");
  const [websiteUrl, setWebsiteUrl] = useState(profile.website_url ?? "");

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFieldErrors({});
    setGeneralError(null);

    const nextHeadline = headline.trim();
    const nextBio = bio.trim();
    const nextLinkedin = linkedinUrl.trim();
    const nextWebsite = websiteUrl.trim();

    const errors: Record<string, string> = {};
    if (nextHeadline.length < HEADLINE_MIN) {
      errors.headline = `Headline must be at least ${HEADLINE_MIN} characters long.`;
    } else if (nextHeadline.length > HEADLINE_MAX) {
      errors.headline = `Headline cannot exceed ${HEADLINE_MAX} characters.`;
    }
    if (nextBio.length < BIO_MIN) {
      errors.bio = `Bio must be at least ${BIO_MIN} characters long.`;
    } else if (nextBio.length > BIO_MAX) {
      errors.bio = `Bio cannot exceed ${BIO_MAX} characters long.`;
    }
    if (nextLinkedin && !isValidHttpUrl(nextLinkedin)) {
      errors.linkedin_url = "Enter a valid URL.";
    } else if (nextLinkedin && !isLinkedInUrl(nextLinkedin)) {
      errors.linkedin_url =
        "Please enter a valid LinkedIn profile URL (e.g. https://www.linkedin.com/in/your-name).";
    }
    if (nextWebsite && !isValidHttpUrl(nextWebsite)) {
      errors.website_url = "Enter a valid URL.";
    }

    const mergedLinkedin = nextLinkedin !== "" ? nextLinkedin : profile.linkedin_url ?? "";
    const mergedWebsite = nextWebsite !== "" ? nextWebsite : profile.website_url ?? "";
    if (!mergedLinkedin && !mergedWebsite) {
      errors.non_field_error = "Please provide at least one of LinkedIn or website.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    const diff: { headline?: string; bio?: string; linkedin_url?: string; website_url?: string } = {};
    if (nextHeadline !== (profile.headline ?? "")) diff.headline = nextHeadline;
    if (nextBio !== (profile.bio ?? "")) diff.bio = nextBio;
    if (nextLinkedin !== (profile.linkedin_url ?? "")) diff.linkedin_url = nextLinkedin;
    if (nextWebsite !== (profile.website_url ?? "")) diff.website_url = nextWebsite;

    if (Object.keys(diff).length === 0) {
      showToast("Nothing to save — no changes made.");
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await profileApi.updateInstructorProfile(diff);
      onSaved(updated);
      showToast("Instructor profile updated successfully.");
    } catch (err) {
      const parsed = parseApiError(err);
      setFieldErrors(parsed.fieldErrors);
      const knownFields = ["headline", "bio", "linkedin_url", "website_url", "non_field_error"];
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

      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between">
          <label htmlFor="headline" className="text-sm font-medium text-ink-800 dark:text-paper-100">
            Headline
          </label>
          <span
            className={cn(
              "text-xs",
              headline.length > HEADLINE_MAX
                ? "text-red-600 dark:text-red-400"
                : "text-ink-400 dark:text-ink-500",
            )}
          >
            {headline.length}/{HEADLINE_MAX}
          </span>
        </div>
        <input
          id="headline"
          type="text"
          value={headline}
          onChange={(event) => setHeadline(event.target.value)}
          maxLength={HEADLINE_MAX}
          placeholder="e.g. Full-stack developer teaching Python & Django"
          className={cn(
            "w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-ink-950 outline-none transition-colors placeholder:text-ink-500/60 focus:border-ember-400 dark:bg-ink-900 dark:text-paper-50",
            fieldErrors.headline ? "border-red-400" : "border-paper-200 dark:border-ink-800",
          )}
        />
        {fieldErrors.headline && (
          <p className="text-xs text-red-600 dark:text-red-400">{fieldErrors.headline}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between">
          <label htmlFor="bio" className="text-sm font-medium text-ink-800 dark:text-paper-100">
            Bio
          </label>
          <span
            className={cn(
              "text-xs",
              bio.length > BIO_MAX ? "text-red-600 dark:text-red-400" : "text-ink-400 dark:text-ink-500",
            )}
          >
            {bio.length}/{BIO_MAX}
          </span>
        </div>
        <textarea
          id="bio"
          value={bio}
          onChange={(event) => setBio(event.target.value)}
          rows={5}
          maxLength={BIO_MAX}
          placeholder="Tell students about your experience, background and teaching style..."
          className={cn(
            "w-full resize-none rounded-lg border bg-white px-3.5 py-2.5 text-sm text-ink-950 outline-none transition-colors placeholder:text-ink-500/60 focus:border-ember-400 dark:bg-ink-900 dark:text-paper-50",
            fieldErrors.bio ? "border-red-400" : "border-paper-200 dark:border-ink-800",
          )}
        />
        {fieldErrors.bio && <p className="text-xs text-red-600 dark:text-red-400">{fieldErrors.bio}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="linkedin_url" className="text-sm font-medium text-ink-800 dark:text-paper-100">
          LinkedIn profile URL
        </label>
        <input
          id="linkedin_url"
          type="url"
          value={linkedinUrl}
          onChange={(event) => setLinkedinUrl(event.target.value)}
          placeholder="https://www.linkedin.com/in/your-name"
          className={cn(
            "w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-ink-950 outline-none transition-colors placeholder:text-ink-500/60 focus:border-ember-400 dark:bg-ink-900 dark:text-paper-50",
            fieldErrors.linkedin_url ? "border-red-400" : "border-paper-200 dark:border-ink-800",
          )}
        />
        {fieldErrors.linkedin_url && (
          <p className="text-xs text-red-600 dark:text-red-400">{fieldErrors.linkedin_url}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="website_url" className="text-sm font-medium text-ink-800 dark:text-paper-100">
          Website URL
        </label>
        <input
          id="website_url"
          type="url"
          value={websiteUrl}
          onChange={(event) => setWebsiteUrl(event.target.value)}
          placeholder="https://your-site.com"
          className={cn(
            "w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-ink-950 outline-none transition-colors placeholder:text-ink-500/60 focus:border-ember-400 dark:bg-ink-900 dark:text-paper-50",
            fieldErrors.website_url ? "border-red-400" : "border-paper-200 dark:border-ink-800",
          )}
        />
        {fieldErrors.website_url && (
          <p className="text-xs text-red-600 dark:text-red-400">{fieldErrors.website_url}</p>
        )}
      </div>

      {fieldErrors.non_field_error && (
        <p className="text-xs text-red-600 dark:text-red-400">{fieldErrors.non_field_error}</p>
      )}

      <p className="-mt-3 text-xs text-ink-500 dark:text-ink-400">
        At least one of LinkedIn or Website is required.
      </p>

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
