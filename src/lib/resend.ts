import { Resend } from "resend";

let instance: Resend | null = null;

/**
 * Lazy-initialised Resend client.
 * Throws at call time if RESEND_API_KEY is not configured.
 */
export function getResend(): Resend {
  if (!instance) {
    const key = process.env.RESEND_API_KEY;
    if (!key) {
      throw new Error("RESEND_API_KEY environment variable is not set");
    }
    instance = new Resend(key);
  }
  return instance;
}
