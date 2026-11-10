import { $, $$ } from '@/utils/dom';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const newIdempotencyKey = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `short-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export default function init() {
  const forms = $$<HTMLFormElement>('[data-short-lead-form]');
  if (!forms.length) return;

  forms.forEach((form) => {
    if (form.dataset.bound === 'true') return;
    form.dataset.bound = 'true';

    const submitBtn = $<HTMLButtonElement>('[data-short-submit]', form);
    const statusEl = $('[data-short-status]', form);
    let activeIdempotencyKey = newIdempotencyKey();

    const setError = (name: string, message: string) => {
      const input = form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement | null;
      const error = $(`[data-error-for="${name}"]`, form);
      if (input) input.setAttribute('aria-invalid', String(Boolean(message)));
      if (error) error.textContent = message;
      return !message;
    };

    $$<HTMLInputElement | HTMLSelectElement>('input[required], select[required]', form).forEach((input) => {
      input.addEventListener('input', () => {
        if (input.getAttribute('aria-invalid') === 'true') setError(input.name, '');
      });
      input.addEventListener('change', () => {
        if (input.getAttribute('aria-invalid') === 'true') setError(input.name, '');
      });
    });

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!submitBtn) return;
      if (submitBtn.disabled) return;

      const data = new FormData(form);
      const name = String(data.get('name') ?? '').trim();
      const company = String(data.get('company') ?? '').trim();
      const email = String(data.get('email') ?? '').trim();
      const serviceInterest = String(data.get('service_interest') ?? '').trim();
      const websiteUrl = String(data.get('website_url') ?? '').trim();

      const valid = [
        setError('name', name ? '' : 'Please enter your full name.'),
        setError('company', company ? '' : 'Please enter your company name.'),
        setError('email', EMAIL_REGEX.test(email) ? '' : 'Please enter a valid work email.'),
        setError('service_interest', serviceInterest ? '' : 'Please select a primary service interest.'),
      ].every(Boolean);

      if (!valid) {
        $<HTMLInputElement | HTMLSelectElement>('[aria-invalid="true"]', form)?.focus();
        if (statusEl) statusEl.textContent = '';
        return;
      }

      submitBtn.disabled = true;
      submitBtn.setAttribute('aria-busy', 'true');
      if (statusEl) {
        statusEl.className = 'mt-4 min-h-6 text-sm text-mute';
        statusEl.textContent = 'Recording your inquiry...';
      }

      const params = new URLSearchParams(window.location.search);
      const payload = {
        name,
        company,
        email,
        service_interest: serviceInterest,
        form_type: 'short_lead',
        page: window.location.pathname,
        page_url: window.location.href,
        utm_source: params.get('utm_source') || '',
        utm_medium: params.get('utm_medium') || '',
        utm_campaign: params.get('utm_campaign') || '',
        utm_term: params.get('utm_term') || '',
        utm_content: params.get('utm_content') || '',
        website_url: websiteUrl,
        idempotency_key: activeIdempotencyKey,
      };

      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const body = (await res.json().catch(() => ({}))) as {
          message?: string;
          duplicate?: boolean;
          submission_id?: string;
        };

        if (res.ok) {
          if (!body.duplicate) {
            const win = window as unknown as {
              dataLayer?: Record<string, unknown>[];
              gtag?: (...args: unknown[]) => void;
            };
            if (win.dataLayer) {
              win.dataLayer.push({
                event: 'form_submission',
                form_name: 'short_lead_form',
                service_interest: serviceInterest,
                company,
              });
            }
            if (typeof win.gtag === 'function') {
              win.gtag('event', 'generate_lead', {
                event_category: 'engagement',
                event_label: serviceInterest || 'short_lead_form',
                value: 1,
              });
            }
          }

          activeIdempotencyKey = newIdempotencyKey();
          if (statusEl) {
            statusEl.className = 'mt-4 min-h-6 text-sm text-emerald-400 font-medium';
            statusEl.innerHTML = `Thank you, ${name.split(' ')[0]}! Your project details have been recorded. <a href="https://calendly.com/jeremy-sanchez-ziaflow" target="_blank" rel="noopener noreferrer" class="underline font-bold text-bone hover:text-signal ml-1 inline-flex items-center gap-1">Want to pick a consultation time now? Open calendar &rarr;</a>`;
          }
          form.reset();
        } else {
          if (statusEl) {
            statusEl.className = 'mt-4 min-h-6 text-sm text-signal';
            statusEl.textContent = body.message ?? 'Could not save your inquiry. Please call (602) 834-4239.';
          }
        }
      } catch {
        if (statusEl) {
          statusEl.className = 'mt-4 min-h-6 text-sm text-signal';
          statusEl.textContent = 'Network error. Please try again or call (602) 834-4239 directly.';
        }
      } finally {
        submitBtn.removeAttribute('aria-busy');
        setTimeout(() => {
          submitBtn.disabled = false;
        }, 1000);
      }
    });
  });
}
