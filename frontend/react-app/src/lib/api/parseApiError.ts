import { isAxiosError } from "axios";

/**
 * Your backend's error responses are NOT wrapped in {success, message, data}
 * like success responses are — they're raw DRF serializer errors, e.g.:
 *   { "email": ["User with this email already exists!"] }
 *   { "token": { "token": "Invalid token!" } }
 * This walks that shape and pulls out a message per field, plus one general
 * message for the top of the form (whichever error was found first).
 */
function extractFirstMessage(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = extractFirstMessage(item);
      if (found) return found;
    }
    return null;
  }
  if (value && typeof value === "object") {
    for (const key of Object.keys(value as Record<string, unknown>)) {
      const found = extractFirstMessage((value as Record<string, unknown>)[key]);
      if (found) return found;
    }
  }
  return null;
}

export interface ParsedApiError {
  /** field name -> message, for showing errors under the matching input */
  fieldErrors: Record<string, string>;
  /** one message for a top-of-form banner, always present */
  generalMessage: string;
}

export function parseApiError(error: unknown): ParsedApiError {
  if (isAxiosError(error)) {
    const data = error.response?.data;

    if (data && typeof data === "object" && !Array.isArray(data)) {
      const fieldErrors: Record<string, string> = {};
      for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
        const message = extractFirstMessage(value);
        if (message) fieldErrors[key] = message;
      }

      const generalMessage = Object.values(fieldErrors)[0] ?? "Something went wrong. Please try again.";
      return { fieldErrors, generalMessage };
    }

    if (error.response?.status === 429) {
      return { fieldErrors: {}, generalMessage: "Too many attempts. Please wait a moment and try again." };
    }
  }
  return { fieldErrors: {}, generalMessage: "Something went wrong. Please check your connection and try again." };
}