import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Camera, Loader2, X } from "lucide-react";
import { authApi } from "../api/authApi";
import { useAuth } from "../../../providers/AuthProvider";
import { useToast } from "../../../providers/ToastProvider";
import { resolveMediaUrl } from "../../../lib/media";
import { parseApiError } from "../../../lib/api/parseApiError";
import { cn } from "../../../lib/utils";

const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
// Backend doesn't document a size cap — this is a sane client-side guard so
// people get instant feedback instead of waiting on a slow upload that fails.
// Loosen or remove once you confirm the real limit (or lack of one).
const MAX_FILE_SIZE_MB = 5;

function usernamePattern(value: string): string | null {
  if (!value.trim()) return "Username is required.";
  if (value.length < 3) return "Username must be at least 3 characters.";
  if (!/^[\w.+-]+$/.test(value)) {
    return "Only letters, numbers, and . + - _ are allowed.";
  }
  return null;
}

export function EditProfileForm() {
  const { user, refetchUser } = useAuth();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [firstName, setFirstName] = useState(user?.first_name ?? "");
  const [lastName, setLastName] = useState(user?.last_name ?? "");
  const [username, setUsername] = useState(user?.username ?? "");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    resolveMediaUrl(user?.photo),
  );

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) return null;

  const initials = `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase() || "?";

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setFieldErrors((prev) => ({ ...prev, photo: "" }));

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setFieldErrors((prev) => ({ ...prev, photo: "Please choose a JPG, PNG, or WEBP image." }));
      event.target.value = "";
      return;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setFieldErrors((prev) => ({ ...prev, photo: `Image must be under ${MAX_FILE_SIZE_MB}MB.` }));
      event.target.value = "";
      return;
    }

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  function removeSelectedPhoto() {
    setPhotoFile(null);
    setPhotoPreview(resolveMediaUrl(user!.photo));
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setGeneralError(null);

    const errors: Record<string, string> = {};
    if (!firstName.trim()) errors.first_name = "First name is required.";
    if (!lastName.trim()) errors.last_name = "Last name is required.";
    const usernameError = usernamePattern(username);
    if (usernameError) errors.username = usernameError;

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});

    // Only send what actually changed. This matters beyond efficiency: your
    // backend's username-uniqueness check apparently doesn't exclude the
    // current user, so re-submitting an unchanged username was triggering a
    // false "already exists" error. Not sending untouched fields sidesteps it.
    const payload: {
      first_name?: string;
      last_name?: string;
      username?: string;
      photo?: File;
    } = {};
    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();
    const trimmedUsername = username.trim();
    if (trimmedFirst !== user.first_name) payload.first_name = trimmedFirst;
    if (trimmedLast !== user.last_name) payload.last_name = trimmedLast;
    if (trimmedUsername !== user.username) payload.username = trimmedUsername;
    if (photoFile) payload.photo = photoFile;

    if (Object.keys(payload).length === 0) {
      showToast("Nothing to save — no changes made.");
      return;
    }

    setIsSubmitting(true);
    try {
      await authApi.updateProfile(payload);
      await refetchUser(); // picks up new name/photo everywhere (navbar, profile page)
      setPhotoFile(null);
      showToast("Profile updated successfully.");
    } catch (err) {
      const parsed = parseApiError(err);
      setFieldErrors(parsed.fieldErrors);
      // Show a banner too if the error isn't tied to a field we render
      // (e.g. a non-field error, or a key we don't have an input for)
      const knownFields = ["first_name", "last_name", "username", "photo"];
      const hasUnmappedError = Object.keys(parsed.fieldErrors).some(
        (key) => !knownFields.includes(key),
      );
      if (hasUnmappedError || Object.keys(parsed.fieldErrors).length === 0) {
        setGeneralError(parsed.generalMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputClass =
    "rounded-lg border bg-white px-3.5 py-2.5 text-sm text-ink-950 outline-none transition-colors placeholder:text-ink-500/60 focus:border-ember-400 dark:bg-ink-900 dark:text-paper-50";

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

      {/* Photo */}
      <div className="flex items-center gap-5">
        <div className="group relative">
          {photoPreview ? (
            <img
              src={photoPreview}
              alt=""
              className="h-20 w-20 rounded-full object-cover ring-2 ring-paper-200 dark:ring-ink-800"
            />
          ) : (
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-ink-800 text-xl font-semibold text-paper-50 dark:bg-ember-400 dark:text-ink-950">
              {initials}
            </span>
          )}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Change photo"
            className="absolute inset-0 flex items-center justify-center rounded-full bg-ink-950/0 text-transparent transition-colors group-hover:bg-ink-950/50 group-hover:text-paper-50"
          >
            <Camera size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-full border border-paper-200 px-3.5 py-1.5 text-xs font-semibold text-ink-800 transition-colors hover:bg-paper-100 dark:border-ink-800 dark:text-paper-100 dark:hover:bg-ink-800"
            >
              Change photo
            </button>
            {photoFile && (
              <button
                type="button"
                onClick={removeSelectedPhoto}
                className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-ink-500 hover:text-red-600 dark:text-ink-300"
              >
                <X size={13} /> Cancel
              </button>
            )}
          </div>
          <p className="text-xs text-ink-500 dark:text-ink-400">JPG, PNG, or WEBP. Up to {MAX_FILE_SIZE_MB}MB.</p>
          {fieldErrors.photo && <p className="text-xs text-red-600 dark:text-red-400">{fieldErrors.photo}</p>}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          onChange={handlePhotoChange}
          className="hidden"
        />
      </div>

      {/* Name */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
          {fieldErrors.first_name && (
            <p className="text-xs text-red-600 dark:text-red-400">{fieldErrors.first_name}</p>
          )}
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
          {fieldErrors.last_name && (
            <p className="text-xs text-red-600 dark:text-red-400">{fieldErrors.last_name}</p>
          )}
        </div>
      </div>

      {/* Username */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="username" className="text-sm font-medium text-ink-800 dark:text-paper-100">
          Username
        </label>
        <input
          id="username"
          autoComplete="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="your_username"
          className={cn(inputClass, "w-full", fieldErrors.username ? "border-red-400" : "border-paper-200 dark:border-ink-800")}
        />
        <p className="text-xs text-ink-500 dark:text-ink-400">
          This is how other students and instructors will see you.
        </p>
        {fieldErrors.username && (
          <p className="text-xs text-red-600 dark:text-red-400">{fieldErrors.username}</p>
        )}
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