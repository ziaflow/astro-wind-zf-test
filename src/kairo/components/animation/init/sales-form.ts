import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { $, $$, motionEnabled } from '@/utils/dom';
import { setRollText } from '@/utils/roll';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const newIdempotencyKey = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `kairo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export default function init() {
  const form = $<HTMLFormElement>('[data-sales-form]');
  if (!form) return;
  const intents = $$<HTMLInputElement>('[data-intent-input]', form);
  const demoOnly = $('[data-demo-only]', form);
  const submit = $<HTMLButtonElement>('[data-sales-submit]', form);
  const label = $('[data-submit-label]', form);
  const status = $('[data-sales-status]', form);
  let activeIdempotencyKey = newIdempotencyKey();

  const setIntent = (intent: string) => {
    intents.forEach((input) => (input.checked = input.value === intent));
    if (demoOnly && motionEnabled()) {
      gsap.fromTo(demoOnly, { opacity: 0.7 }, { opacity: 1, duration: 0.3 });
    }
    if (label) setRollText(label, intent === 'demo' ? (label.dataset.demo ?? '') : (label.dataset.free ?? ''));
    ScrollTrigger.refresh();
  };

  const readUrl = () => {
    const params = new URLSearchParams(window.location.search);
    const intent = params.get('intent');
    setIntent(intent === 'demo' ? 'demo' : 'free');
    const prefillMessage = params.get('roi_summary');
    if (prefillMessage) {
      const msgEl = form.elements.namedItem('message') as HTMLTextAreaElement | null;
      if (msgEl && !msgEl.value) msgEl.value = prefillMessage;
    }
  };

  intents.forEach((input) => input.addEventListener('change', () => setIntent(input.value)));
  document.addEventListener('kairo:url', readUrl);
  readUrl();

  const setError = (name: string, message: string) => {
    const input = form.elements.namedItem(name) as HTMLInputElement | null;
    const error = $(`[data-error-for="${name}"]`, form);
    input?.setAttribute('aria-invalid', String(Boolean(message)));
    if (error) error.textContent = message;
    return !message;
  };

  $$<HTMLInputElement>('input[required]', form).forEach((input) => {
    input.addEventListener('input', () => {
      if (input.getAttribute('aria-invalid') === 'true') setError(input.name, '');
    });
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const name = String(data.get('name') ?? '').trim();
    const email = String(data.get('email') ?? '').trim();
    const company = String(data.get('company') ?? '').trim();
    const phone = String(data.get('phone') ?? '').trim();
    const serviceInterest = String(data.get('service_interest') ?? 'Lead Capture & Follow-Up Sprint').trim();
    const size = String(data.get('size') ?? '').trim();
    const rawMessage = String(data.get('message') ?? '').trim();
    const intent = String(data.get('intent') ?? 'free');
    const websiteUrl = String(data.get('website_url') ?? '').trim();

    const valid = [
      setError('name', name ? '' : (form.dataset.errorName ?? 'Please enter your name.')),
      setError('email', EMAIL.test(email) ? '' : (form.dataset.errorEmail ?? 'Please enter a valid work email.')),
      setError('company', company ? '' : (form.dataset.errorCompany ?? 'Please enter your business name.')),
    ].every(Boolean);

    if (!valid) {
      $<HTMLInputElement>('[aria-invalid="true"]', form)?.focus();
      if (status) status.textContent = '';
      return;
    }

    if (!submit || !status) return;
    submit.disabled = true;
    submit.setAttribute('aria-busy', 'true');
    status.className = 'mt-6 min-h-6 text-sm text-mute';
    status.textContent = form.dataset.sending ?? 'Recording your inquiry...';

    const combinedMessage = [
      rawMessage,
      size ? `Company Size: ${size}` : '',
      `Intent: ${intent === 'demo' ? 'Project Proposal' : 'Strategy Consultation'}`,
    ]
      .filter(Boolean)
      .join(' | ');

    const params = new URLSearchParams(window.location.search);
    const payload = {
      name,
      email,
      phone,
      company,
      service_interest: serviceInterest,
      message: combinedMessage,
      form_type: 'contact_us',
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

      const body = (await res.json().catch(() => ({}))) as { message?: string; duplicate?: boolean };

      if (res.ok) {
        if (!body.duplicate) {
          const win = window as unknown as {
            dataLayer?: Record<string, unknown>[];
            gtag?: (...args: unknown[]) => void;
          };
          if (win.dataLayer) {
            win.dataLayer.push({
              event: 'form_submission',
              form_name: 'kairo_sales_form',
              service_interest: serviceInterest,
              company_size: size,
            });
          }
          if (typeof win.gtag === 'function') {
            win.gtag('event', 'generate_lead', {
              event_category: 'engagement',
              event_label: serviceInterest || 'kairo_sales_form',
              value: 1,
            });
          }
        }
        activeIdempotencyKey = newIdempotencyKey();
        const demo = intent === 'demo';
        status.className = 'mt-6 min-h-6 text-sm text-emerald-400 font-medium';
        const template = (demo ? form.dataset.successDemo : form.dataset.successFree) ?? 'Thank you! Your inquiry is recorded.';
        status.textContent = template.replace('{name}', name.split(' ')[0]).replace('{email}', email);
        form.reset();
        setIntent(demo ? 'demo' : 'free');
      } else {
        status.className = 'mt-6 min-h-6 text-sm text-signal';
        status.textContent = body.message ?? 'Could not save your inquiry. Please call (602) 834-4239.';
      }
    } catch {
      status.className = 'mt-6 min-h-6 text-sm text-signal';
      status.textContent = 'Network error. Please try again or call (602) 834-4239 directly.';
    } finally {
      submit.removeAttribute('aria-busy');
      setTimeout(() => {
        submit.disabled = false;
      }, 1000);
    }
  });
}
