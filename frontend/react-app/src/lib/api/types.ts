/** The {success, message, data} wrapper every successful response from this
 * backend uses. Error responses do NOT use this shape — see parseApiError.ts. */
export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}