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
    if (SENSITIVE_KEY_REGEX.test(key)) {
      clean[key] = '[REDACTED]';
    } else if (typeof val === 'object' && val !== null) {
      clean[key] = Array.isArray(val)
        ? val.map((item) =>
            typeof item === 'object' && item !== null ? sanitizeAttributes(item as LogAttributes) : item
          )
        : sanitizeAttributes(val as LogAttributes);
    } else {
      clean[key] = val;
    }
  }

  return clean;
}

/**
 * Structured Sentry Logger following Sentry Observability best practices:
 * - Structured attributes over string interpolation (enables indexing & queryability)
 * - Safe sanitization of credentials and PII
 * - Correlated with active traces & spans
 * - Dual-reporting to terminal during development
 */
export const logger = {
  trace(message: string, attributes?: LogAttributes) {
    const safeAttrs = sanitizeAttributes(attributes);
    Sentry.logger?.trace?.(message, safeAttrs);
    if (import.meta.env.DEV) {
      console.debug(`[TRACE] ${message}`, safeAttrs);
    }
  },

  debug(message: string, attributes?: LogAttributes) {
    const safeAttrs = sanitizeAttributes(attributes);
    Sentry.logger?.debug?.(message, safeAttrs);
    if (import.meta.env.DEV) {
      console.debug(`[DEBUG] ${message}`, safeAttrs);
    }
  },

  info(message: string, attributes?: LogAttributes) {
    const safeAttrs = sanitizeAttributes(attributes);
    Sentry.logger?.info?.(message, safeAttrs);
    if (import.meta.env.DEV) {
      console.info(`[INFO] ${message}`, safeAttrs);
    }
  },

  warn(message: string, attributes?: LogAttributes) {
    const safeAttrs = sanitizeAttributes(attributes);
    Sentry.logger?.warn?.(message, safeAttrs);
    if (import.meta.env.DEV) {
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
    if (import.meta.env.DEV) {
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
    if (import.meta.env.DEV) {
      console.error(`[FATAL] ${message}`, safeAttrs, error || '');
    }
  },
};

export default logger;
