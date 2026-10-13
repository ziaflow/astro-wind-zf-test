import { Resend } from 'resend';

const apiKey =
  process.env.RESEND_API_KEY ||
  import.meta.env.RESEND_API_KEY;

export const resend = apiKey ? new Resend(apiKey) : null;

export function getResendClient(): Resend | null {
  return resend;
}
