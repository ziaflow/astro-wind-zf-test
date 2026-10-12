/**
 * Single source of truth for every lead/intake form on the site.
 *
 * - Drives rendered fields (ContactIntakeForm.astro), server validation (submit.ts),
 *   column labels and Google Sheet tab names (Code.gs).
 * - FORM_DEFINITIONS is the server-side allowlist: a submission whose `form_id` is not a key
 *   here, or whose `form_type` does not match the definition, is rejected with 400.
 * - Routing decisions (sheet tab, notification target) are derived from this file only —
 *   never from values supplied by the browser.
 */

export const INQUIRY_TYPES = ['new_project', 'existing_client', 'partnership', 'general'] as const;
export type InquiryType = (typeof INQUIRY_TYPES)[number];

export const INQUIRY_TYPE_LABELS: Record<InquiryType, string> = {
  new_project: 'New project',
  existing_client: 'Existing client support',
  partnership: 'Partnership',
  general: 'General question',
};

export type FieldType = 'text' | 'email' | 'tel' | 'select' | 'textarea' | 'file';

export interface FieldDefinition {
  /** Form field name (also the key stored in Supabase metadata). */
  name: string;
  /** Human label — also used as the Google Sheet column header. */
  label: string;
  type: FieldType;
  required: boolean;
  maxLength?: number;
  placeholder?: string;
  autocomplete?: string;
  /** For `select` fields: allowlisted values and their labels. */
  options?: ReadonlyArray<{ value: string; label: string }>;
  /** For `file` fields. */
  accept?: string;
  maxBytes?: number;
  allowedMimeTypes?: readonly string[];
  /** Grid hint for the component: half-width on larger screens. */
  half?: boolean;
}

export interface FormDefinition {
  /** Must match the hidden `form_type` field posted by the browser. */
  formType: string;
  /** Google Sheet tab the Apps Script writes to (auto-created). */
  sheetTab: string;
  fields: readonly FieldDefinition[];
  submitLabel: string;
  successMessage: string;
}

/** Vercel serverless request bodies are capped at 4.5 MB; keep attachments well under that. */
export const MAX_ATTACHMENT_BYTES = 3 * 1024 * 1024;

export const ATTACHMENT_MIME_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const;

/** Required on every intake form. Do not relax these. */
const CORE_FIELDS: readonly FieldDefinition[] = [
  { name: 'name', label: 'Full Name', type: 'text', required: true, maxLength: 200, autocomplete: 'name', half: true },
  { name: 'email', label: 'Email', type: 'email', required: true, maxLength: 254, autocomplete: 'email', half: true },
  {
    name: 'company',
    label: 'Company',
    type: 'text',
    required: true,
    maxLength: 200,
    autocomplete: 'organization',
    half: true,
  },
  { name: 'phone', label: 'Phone', type: 'tel', required: true, maxLength: 30, autocomplete: 'tel', half: true },
  {
    name: 'inquiry_type',
    label: 'Inquiry Type',
    type: 'select',
    required: true,
    options: INQUIRY_TYPES.map((value) => ({ value, label: INQUIRY_TYPE_LABELS[value] })),
  },
  {
    name: 'message',
    label: 'Message',
    type: 'textarea',
    required: true,
    maxLength: 5000,
    placeholder: 'What challenges are you facing? What are your goals? The more detail, the better we can help.',
  },
];

const ATTACHMENT_FIELD: FieldDefinition = {
  name: 'attachment',
  label: 'Attachment',
  type: 'file',
  required: false,
  accept: '.pdf,.png,.jpg,.jpeg,.webp,.txt,.doc,.docx',
  maxBytes: MAX_ATTACHMENT_BYTES,
  allowedMimeTypes: ATTACHMENT_MIME_TYPES,
};

export const FORM_DEFINITIONS = {
  'contact-page': {
    formType: 'contact',
    sheetTab: 'Contact Page',
    fields: [...CORE_FIELDS, ATTACHMENT_FIELD],
    submitLabel: 'Send message',
    successMessage: 'Thanks! We received your message and will reply within one business day.',
  },
  'general-inquiry': {
    formType: 'contact',
    sheetTab: 'General Inquiries',
    fields: CORE_FIELDS,
    submitLabel: 'Send message',
    successMessage: 'Thanks! We received your message and will reply within one business day.',
  },
} as const satisfies Record<string, FormDefinition>;

export type FormId = keyof typeof FORM_DEFINITIONS;

export function getFormDefinition(formId: unknown): FormDefinition | null {
  if (typeof formId !== 'string') return null;
  if (!Object.prototype.hasOwnProperty.call(FORM_DEFINITIONS, formId)) return null;
  return FORM_DEFINITIONS[formId as FormId];
}

/** Hidden tracking/meta fields every form posts (never used for routing). */
export const ATTRIBUTION_FIELDS = ['utm_source', 'utm_medium', 'utm_campaign', 'gclid'] as const;

export const HONEYPOT_FIELD = 'hp_token';
export const MIN_FILL_TIME_MS = 3000;
