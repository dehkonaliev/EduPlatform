import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

interface FieldProps {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}

/** Label + control + (hint or error) block used by the create-* forms. */
export function Field({ label, htmlFor, hint, error, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-ink-800 dark:text-paper-100">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      ) : hint ? (
        <p className="text-xs text-ink-500 dark:text-ink-400">{hint}</p>
      ) : null}
    </div>
  );
}

const controlClass =
  "w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-ink-950 outline-none transition-colors placeholder:text-ink-500/60 focus:border-ember-400 dark:bg-ink-900 dark:text-paper-50";

function invalidClass(invalid?: boolean) {
  return invalid ? "border-red-400" : "border-paper-200 dark:border-ink-800";
}

export function TextInput({
  invalid,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return <input className={cn(controlClass, invalidClass(invalid), className)} {...props} />;
}

export function TextArea({
  invalid,
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return <textarea className={cn(controlClass, invalidClass(invalid), className)} {...props} />;
}

export function SelectInput({
  invalid,
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }) {
  return (
    <select className={cn(controlClass, invalidClass(invalid), className)} {...props}>
      {children}
    </select>
  );
}
