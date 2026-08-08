import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Check, Loader2, X } from "lucide-react";
import { useSearchOptions } from "../../features/courses/hooks/useSearchOptions";
import {
  LANGUAGE_OPTIONS,
  LEVEL_OPTIONS,
  PRICING_TYPE_OPTIONS,
} from "../../features/courses/constants";
import { useToast } from "../../providers/ToastProvider";
import { parseApiError } from "../../lib/api/parseApiError";
import { cn } from "../../lib/utils";
import { Field, SelectInput, TextArea, TextInput } from "./controls";
import type { CourseCreatePayload, CourseLevel, PricingType } from "../../features/courses/types";

const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
// Matches the backend CourseCreateUpdateSerializer cap (2MB).
const MAX_THUMBNAIL_MB = 2;
const VIDEO_DOMAINS = ["youtube.com", "youtu.be", "vimeo.com"];
const KNOWN_FIELDS = [
  "title",
  "subtitle",
  "description",
  "category",
  "tags",
  "level",
  "language",
  "thumbnail",
  "intro_video",
  "pricing_type",
  "price",
  "requirements",
  "what_included",
];

export interface CourseFormValues {
  title: string;
  subtitle: string;
  description: string;
  category: string;
  tags: string[];
  level: CourseLevel;
  language: string;
  pricingType: PricingType;
  price: string;
  requirements: string;
  whatIncluded: string;
  introVideo: string;
  /** Existing thumbnail URL (edit mode) — already passed through resolveMediaUrl. */
  thumbnailUrl: string | null;
}

export const EMPTY_COURSE_FORM: CourseFormValues = {
  title: "",
  subtitle: "",
  description: "",
  category: "",
  tags: [],
  level: "ALL_LEVELS",
  language: "en",
  pricingType: "MONTHLY",
  price: "",
  requirements: "",
  whatIncluded: "",
  introVideo: "",
  thumbnailUrl: null,
};

interface CourseFormProps {
  initial?: CourseFormValues;
  submitLabel?: string;
  submitPendingLabel?: string;
  /** When provided, a "Cancel" button that calls this appears next to submit. */
  onCancel?: () => void;
  onSubmit: (payload: CourseCreatePayload) => Promise<void>;
}

/** Shared create/edit course form. Owns field state, thumbnail upload,
 * validation and error rendering; the page passes the API call. */
export function CourseForm({
  initial = EMPTY_COURSE_FORM,
  submitLabel = "Create course",
  submitPendingLabel = "Creating…",
  onCancel,
  onSubmit,
}: CourseFormProps) {
  const { categories, tags, isLoading: isLoadingOptions } = useSearchOptions();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(initial.title);
  const [subtitle, setSubtitle] = useState(initial.subtitle);
  const [description, setDescription] = useState(initial.description);
  const [categoryId, setCategoryId] = useState(initial.category);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(initial.tags);
  const [level, setLevel] = useState<CourseLevel>(initial.level);
  const [language, setLanguage] = useState(initial.language);
  const [pricingType, setPricingType] = useState<PricingType>(initial.pricingType);
  const [price, setPrice] = useState(initial.price);
  const [requirements, setRequirements] = useState(initial.requirements);
  const [whatIncluded, setWhatIncluded] = useState(initial.whatIncluded);
  const [introVideo, setIntroVideo] = useState(initial.introVideo);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function toggleTag(tagId: string) {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId],
    );
  }

  function handleThumbnailChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setFieldErrors((prev) => ({ ...prev, thumbnail: "" }));

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setFieldErrors((prev) => ({
        ...prev,
        thumbnail: "Please choose a JPG, PNG, or WEBP image.",
      }));
      event.target.value = "";
      return;
    }
    if (file.size > MAX_THUMBNAIL_MB * 1024 * 1024) {
      setFieldErrors((prev) => ({
        ...prev,
        thumbnail: `Thumbnail must be under ${MAX_THUMBNAIL_MB}MB.`,
      }));
      event.target.value = "";
      return;
    }

    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  }

  function clearThumbnail() {
    setThumbnailFile(null);
    setThumbnailPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // Show a new upload while one is chosen, otherwise the existing image.
  const displayedThumbnail = thumbnailPreview ?? initial.thumbnailUrl;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setGeneralError(null);

    const errors: Record<string, string> = {};
    if (title.trim().length < 5) errors.title = "Title must be at least 5 characters long.";
    if (description.trim().length < 20)
      errors.description = "Description must be at least 20 characters long.";
    if (!categoryId) errors.category = "Category is required.";
    if (selectedTagIds.length > 10)
      errors.tags = "You can assign a maximum of 10 tags to a course.";
    if (introVideo.trim()) {
      const url = introVideo.trim().toLowerCase();
      if (!VIDEO_DOMAINS.some((domain) => url.includes(domain))) {
        errors.intro_video = "Intro video must be a YouTube or Vimeo link.";
      }
    }
    if (pricingType !== "FREE") {
      const numericPrice = Number(price);
      if (!price || Number.isNaN(numericPrice) || numericPrice <= 0) {
        errors.price = "Price must be greater than 0 for paid courses.";
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    try {
      await onSubmit({
        title: title.trim(),
        subtitle: subtitle.trim() || undefined,
        description: description.trim(),
        category: categoryId,
        tags: selectedTagIds,
        level,
        language,
        thumbnail: thumbnailFile ?? undefined,
        intro_video: introVideo.trim() || undefined,
        pricing_type: pricingType,
        price: pricingType === "FREE" ? undefined : price.trim(),
        requirements: requirements.trim() || undefined,
        what_included: whatIncluded.trim() || undefined,
      });
      showToast(submitLabel === "Create course" ? "Course created." : "Course saved.");
    } catch (err) {
      const parsed = parseApiError(err);
      setFieldErrors(parsed.fieldErrors);
      const hasUnmappedError = Object.keys(parsed.fieldErrors).some(
        (key) => !KNOWN_FIELDS.includes(key),
      );
      if (hasUnmappedError || Object.keys(parsed.fieldErrors).length === 0) {
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

      {/* Thumbnail */}
      <Field
        label="Thumbnail"
        htmlFor="thumbnail"
        hint="JPG, PNG, or WEBP. Up to 2MB."
        error={fieldErrors.thumbnail}
      >
        <div className="flex items-center gap-4">
          <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-lg border border-paper-200 bg-ink-100 dark:border-ink-800 dark:bg-ink-800">
            {displayedThumbnail ? (
              <img src={displayedThumbnail} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-xs text-ink-500 dark:text-ink-300">
                No image
              </span>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-full border border-paper-200 px-3.5 py-1.5 text-xs font-semibold text-ink-800 transition-colors hover:bg-paper-100 dark:border-ink-800 dark:text-paper-100 dark:hover:bg-ink-800"
              >
                {thumbnailFile || initial.thumbnailUrl ? "Change" : "Upload"}
              </button>
              {(thumbnailFile || initial.thumbnailUrl) && (
                <button
                  type="button"
                  onClick={clearThumbnail}
                  className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-ink-500 hover:text-red-600 dark:text-ink-300"
                >
                  <X size={13} /> Remove
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              id="thumbnail"
              type="file"
              accept={ACCEPTED_TYPES.join(",")}
              onChange={handleThumbnailChange}
              className="hidden"
            />
          </div>
        </div>
      </Field>

      {/* Title & subtitle */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Title" htmlFor="title" error={fieldErrors.title}>
          <TextInput
            id="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. Modern Python for Beginners"
            invalid={Boolean(fieldErrors.title)}
          />
        </Field>
        <Field label="Subtitle" htmlFor="subtitle" error={fieldErrors.subtitle}>
          <TextInput
            id="subtitle"
            value={subtitle}
            onChange={(event) => setSubtitle(event.target.value)}
            placeholder="One-line hook for the course card"
            invalid={Boolean(fieldErrors.subtitle)}
          />
        </Field>
      </div>

      {/* Description */}
      <Field label="Description" htmlFor="description" error={fieldErrors.description}>
        <TextArea
          id="description"
          rows={4}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="What will students learn in this course?"
          invalid={Boolean(fieldErrors.description)}
        />
      </Field>

      {/* Category & level & language */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="Category" htmlFor="category" error={fieldErrors.category}>
          <SelectInput
            id="category"
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            disabled={isLoadingOptions}
            invalid={Boolean(fieldErrors.category)}
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Level" htmlFor="level" error={fieldErrors.level}>
          <SelectInput
            id="level"
            value={level}
            onChange={(event) => setLevel(event.target.value as CourseLevel)}
          >
            {LEVEL_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Language" htmlFor="language" error={fieldErrors.language}>
          <SelectInput
            id="language"
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
          >
            {LANGUAGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectInput>
        </Field>
      </div>

      {/* Tags */}
      <Field
        label="Tags"
        hint={selectedTagIds.length > 0 ? `${selectedTagIds.length}/10 selected` : "Pick up to 10 tags"}
        error={fieldErrors.tags}
      >
        {isLoadingOptions ? (
          <div className="h-9 animate-pulse rounded-lg bg-paper-200 dark:bg-ink-800" />
        ) : (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => {
              const selected = selectedTagIds.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                    selected
                      ? "border-ember-400 bg-ember-400/10 text-ember-700 dark:text-ember-300"
                      : "border-paper-200 text-ink-600 hover:bg-paper-100 dark:border-ink-800 dark:text-ink-300 dark:hover:bg-ink-800",
                  )}
                >
                  {selected && <Check size={12} />}
                  {tag.name}
                </button>
              );
            })}
          </div>
        )}
      </Field>

      {/* Pricing */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Pricing type" htmlFor="pricingType" error={fieldErrors.pricing_type}>
          <SelectInput
            id="pricingType"
            value={pricingType}
            onChange={(event) => setPricingType(event.target.value as PricingType)}
          >
            {PRICING_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectInput>
        </Field>
        {pricingType !== "FREE" && (
          <Field
            label="Price"
            htmlFor="price"
            hint="In your platform's currency"
            error={fieldErrors.price}
          >
            <TextInput
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              placeholder="0.00"
              invalid={Boolean(fieldErrors.price)}
            />
          </Field>
        )}
      </div>

      {/* Intro video */}
      <Field
        label="Intro video"
        htmlFor="introVideo"
        hint="YouTube or Vimeo link (optional)"
        error={fieldErrors.intro_video}
      >
        <TextInput
          id="introVideo"
          value={introVideo}
          onChange={(event) => setIntroVideo(event.target.value)}
          placeholder="https://youtube.com/watch?v=…"
          invalid={Boolean(fieldErrors.intro_video)}
        />
      </Field>

      {/* Requirements & what's included */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          label="Requirements"
          htmlFor="requirements"
          hint="What students need before starting (optional)"
          error={fieldErrors.requirements}
        >
          <TextArea
            id="requirements"
            rows={3}
            value={requirements}
            onChange={(event) => setRequirements(event.target.value)}
            invalid={Boolean(fieldErrors.requirements)}
          />
        </Field>
        <Field
          label="What's included"
          htmlFor="whatIncluded"
          hint="e.g. videos, articles, quizzes (optional)"
          error={fieldErrors.what_included}
        >
          <TextArea
            id="whatIncluded"
            rows={3}
            value={whatIncluded}
            onChange={(event) => setWhatIncluded(event.target.value)}
            invalid={Boolean(fieldErrors.what_included)}
          />
        </Field>
      </div>

      <div className="flex justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-paper-200 px-5 py-2.5 text-sm font-semibold text-ink-800 transition-colors hover:bg-paper-100 dark:border-ink-800 dark:text-paper-100 dark:hover:bg-ink-800"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-ink-900 px-5 py-2.5 text-sm font-semibold text-paper-50 transition-colors hover:bg-ink-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-ember-400 dark:text-ink-950 dark:hover:bg-ember-300"
        >
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          {isSubmitting ? submitPendingLabel : submitLabel}
        </button>
      </div>
    </form>
  );
}
