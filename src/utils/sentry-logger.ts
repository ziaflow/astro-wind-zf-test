import * as Sentry from '@sentry/astro';

export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogAttributes {
  domain?: string;
  action?: string;
  userId?: string;
  leadId?: string;
  submissionId?: string;
  endpoint?: string;
  statusCode?: number;
  [key: string]: unknown;
}

// Keys that should never be logged to Sentry or terminal
const SENSITIVE_KEY_REGEX = /(?:password|secret|token|auth|key|cookie|credit|ssn)/i;

/**
 * Sanitizes attributes to prevent sensitive PII or secrets from leaking into logs.
 */
function sanitizeAttributes(attributes?: LogAttributes): Record<string, unknown> {
  if (!attributes) return {};
  const clean: Record<string, unknown> = {};

  for (const [key, val] of Object.entries(attributes)) {
    // Omit absent optional attributes rather than logging null/undefined
    if (val === undefined || val === null) continue;

    if (SENSITIVE_KEY_REGEX.test(key)) {
      clean[key] = '[REDACTED]';
    } else if (typeof val === 'object') {
      clean[key] = Array.isArray(val)
        ? val
            .filter((item) => item !== undefined && item !== null)
            .map((item) => (typeof item === 'object' ? sanitizeAttributes(item as LogAttributes) : item))
        : sanitizeAttributes(val as LogAttributes);
    } else {
      clean[key] = val;
    }
  }

  return clean;
}

const isDev = () => Boolean(import.meta.env?.DEV);

/**
 * Structured Sentry Logger following Sentry Observability best practices:
 * - Structured attributes over string interpolation (enables indexing & queryability)
 * - Safe sanitization of credentials and PII
 * - Correlated with active traces & spans
 * - Dual-reporting to terminal during development
 */
export const logger = {
  fmt: Sentry.logger?.fmt,

  trace(message: string, attributes?: LogAttributes) {
    const safeAttrs = sanitizeAttributes(attributes);
    Sentry.logger?.trace?.(message, safeAttrs);
    if (isDev()) {
      console.debug(`[TRACE] ${message}`, safeAttrs);
    }
  },

  debug(message: string, attributes?: LogAttributes) {
    const safeAttrs = sanitizeAttributes(attributes);
    Sentry.logger?.debug?.(message, safeAttrs);
    if (isDev()) {
      console.debug(`[DEBUG] ${message}`, safeAttrs);
    }
  },

  info(message: string, attributes?: LogAttributes) {
    const safeAttrs = sanitizeAttributes(attributes);
    Sentry.logger?.info?.(message, safeAttrs);
    if (isDev()) {
      console.info(`[INFO] ${message}`, safeAttrs);
    }
  },

  warn(message: string, attributes?: LogAttributes) {
    const safeAttrs = sanitizeAttributes(attributes);
    Sentry.logger?.warn?.(message, safeAttrs);
    if (isDev()) {
      console.warn(`[WARN] ${message}`, safeAttrs);
    }
  },

  error(message: string, attributes?: LogAttributes, error?: unknown) {
    const safeAttrs = sanitizeAttributes(attributes);
    if (error instanceof Error) {
      safeAttrs.errorName = error.name;
      safeAttrs.errorMessage = error.message;
    }
    Sentry.logger?.error?.(message, safeAttrs);
    if (isDev()) {
      console.error(`[ERROR] ${message}`, safeAttrs, error || '');
    }
  },

  fatal(message: string, attributes?: LogAttributes, error?: unknown) {
    const safeAttrs = sanitizeAttributes(attributes);
    if (error instanceof Error) {
      safeAttrs.errorName = error.name;
      safeAttrs.errorMessage = error.message;
    }
    Sentry.logger?.fatal?.(message, safeAttrs);
    if (isDev()) {
      console.error(`[FATAL] ${message}`, safeAttrs, error || '');
    }
  },
};

export default logger;
