/**
 * Pure, framework-free validation of a submission against its FormDefinition.
 * Used by both the Astro Action (JS path) and the native POST page (no-JS path).
 */

import {
  ATTRIBUTION_FIELDS,
  HONEYPOT_FIELD,
  MIN_FILL_TIME_MS,
  getFormDefinition,
  type FieldDefinition,
  type FormDefinition,
} from './definitions';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_ALLOWED_RE = /^[0-9+().\-\s]*(?:(?:ext\.?|x)\s*\d{1,6})?$/i;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_ATTRIBUTION_LENGTH = 200;
/** Reject start timestamps older than this (stale tab / replayed payload). */
const MAX_FILL_TIME_MS = 24 * 60 * 60 * 1000;

export interface AttachmentPayload {
  name: string;
  mimeType: string;
  size: number;
  file: File;
}

export type ValidationFailure =
  | { kind: 'unknown_form' }
  | { kind: 'spam'; reason: 'honeypot' | 'too_fast' }
  | { kind: 'invalid'; fieldErrors: Record<string, string> };

export interface ValidatedSubmission {
  formId: string;
  definition: FormDefinition;
  submissionId: string;
  values: Record<string, string>;
  attachment: AttachmentPayload | null;
  attribution: Record<string, string>;
  pagePath: string;
  /** False when the client never ran JS (no start timestamp) — recorded for review, not rejected. */
  clientTimed: boolean;
}

export type ValidationResult = { ok: true; data: ValidatedSubmission } | { ok: false; failure: ValidationFailure };

function str(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === 'string' ? v.trim() : '';
}

function validateField(field: FieldDefinition, raw: string): string | null {
  if (field.required && raw.length === 0) return `${field.label} is required.`;
  if (raw.length === 0) return null;
  if (field.maxLength && raw.length > field.maxLength) {
    return `${field.label} must be ${field.maxLength} characters or fewer.`;
  }
  switch (field.type) {
    case 'email':
      return EMAIL_RE.test(raw) ? null : 'Enter a valid email address.';
    case 'tel': {
      const digits = raw.replace(/\D/g, '');
      if (!PHONE_ALLOWED_RE.test(raw) || digits.length < 7 || digits.length > 20) {
        return 'Enter a valid phone number.';
      }
      return null;
    }
    case 'select':
      return field.options?.some((o) => o.value === raw) ? null : `Choose a valid ${field.label.toLowerCase()}.`;
    default:
      return null;
  }
}

function validateAttachment(
  field: FieldDefinition,
  value: FormDataEntryValue | null
): AttachmentPayload | string | null {
  if (!value || typeof value === 'string' || value.size === 0) {
    return field.required ? `${field.label} is required.` : null;
  }
  const file = value as File;
  if (field.maxBytes && file.size > field.maxBytes) {
    return `${field.label} must be ${Math.floor(field.maxBytes / 1024 / 1024)} MB or smaller.`;
  }
  const mimeType = file.type || 'application/octet-stream';
  if (field.allowedMimeTypes && !field.allowedMimeTypes.includes(mimeType)) {
    return `${field.label} must be a PDF, image, text, or Word document.`;
  }
  const name = (file.name || 'attachment').replace(/[^\w.\- ]+/g, '_').slice(0, 120);
  return { name, mimeType, size: file.size, file };
}

export function validateSubmission(formData: FormData, now = Date.now()): ValidationResult {
  // 1. Allowlist: form_id must be known and form_type must match its definition.
  const formId = str(formData, 'form_id');
  const definition = getFormDefinition(formId);
  if (!definition || str(formData, 'form_type') !== definition.formType) {
    return { ok: false, failure: { kind: 'unknown_form' } };
  }

  // 2. Honeypot must be empty.
  if (str(formData, HONEYPOT_FIELD) !== '') {
    return { ok: false, failure: { kind: 'spam', reason: 'honeypot' } };
  }

  // 3. Minimum fill time (only enforceable when the client script set the start timestamp).
  const startedRaw = str(formData, 'form_started_at');
  let clientTimed = false;
  if (startedRaw !== '') {
    const started = Number(startedRaw);
    const elapsed = now - started;
    if (!Number.isFinite(started) || elapsed < MIN_FILL_TIME_MS || elapsed > MAX_FILL_TIME_MS) {
      return { ok: false, failure: { kind: 'spam', reason: 'too_fast' } };
    }
    clientTimed = true;
  }

  // 4. Field validation driven entirely by the definition.
  const fieldErrors: Record<string, string> = {};
  const values: Record<string, string> = {};
  let attachment: AttachmentPayload | null = null;

  for (const field of definition.fields) {
    if (field.type === 'file') {
      const result = validateAttachment(field, formData.get(field.name));
      if (typeof result === 'string') fieldErrors[field.name] = result;
      else attachment = result;
      continue;
    }
    const raw = str(formData, field.name);
    const error = validateField(field, raw);
    if (error) fieldErrors[field.name] = error;
    else values[field.name] = field.type === 'email' ? raw.toLowerCase() : raw;
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, failure: { kind: 'invalid', fieldErrors } };
  }

  // 5. Attribution + meta (informational only).
  const attribution: Record<string, string> = {};
  for (const key of ATTRIBUTION_FIELDS) {
    const v = str(formData, key).slice(0, MAX_ATTRIBUTION_LENGTH);
    if (v) attribution[key] = v;
  }
  const pagePathRaw = str(formData, 'page_path');
  const pagePath = pagePathRaw.startsWith('/') ? pagePathRaw.slice(0, 300) : '';

  const clientId = str(formData, 'submission_id');
  const submissionId = UUID_RE.test(clientId) ? clientId.toLowerCase() : crypto.randomUUID();

  return {
    ok: true,
    data: { formId, definition, submissionId, values, attachment, attribution, pagePath, clientTimed },
  };
}
