/** One intake contract for contact, audit and quick-inquiry forms. */
export function bindLeadForms() {
  document.querySelectorAll<HTMLFormElement>('form[data-lead-form]').forEach((form) => {
    if (form.dataset.bound) return;
    form.dataset.bound = 'true';
    let pending = false;
    let previousFields = '';
    let attemptId = '';
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (pending) return;
      pending = true;
      const buttons = [...form.querySelectorAll<HTMLButtonElement>('button[type="submit"]')];
      const status = form.querySelector<HTMLElement>('[data-form-status]');
      const success = form.parentElement?.querySelector<HTMLElement>('[data-form-success]');
      buttons.forEach((button) => (button.disabled = true));
      form.setAttribute('aria-busy', 'true');
      if (status) {
        status.hidden = false;
        status.classList.remove('hidden', 'text-red-500', 'text-green-500');
        status.textContent = 'Sending…';
      }
      const raw = Object.fromEntries(new FormData(form).entries());
      const fingerprint = JSON.stringify(raw);
      if (previousFields !== fingerprint || !attemptId) {
        attemptId = crypto.randomUUID();
        previousFields = fingerprint;
      }
      const params = new URLSearchParams(window.location.search);
      const payload = {
        ...raw,
        name: raw.name || [raw.first_name, raw.last_name].filter(Boolean).join(' '),
        company: raw.company || raw.company_name || '',
        message: raw.message || raw.comments || '',
        page: window.location.pathname,
        page_url: window.location.origin + window.location.pathname,
        form_type: raw.form_type || 'contact_us',
        idempotency_key: attemptId,
        ...Object.fromEntries(
          ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].map((key) => [
            key,
            params.get(key) || '',
          ])
        ),
      };
      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(payload),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'We could not save your request. Please try again.');
        // Honeypot responses have no receipt. Never count them as accepted leads.
        if (result.submission_id && !result.duplicate) {
          try {
            const analytics = window as Window & { dataLayer?: unknown[] };
            analytics.dataLayer = analytics.dataLayer || [];
            analytics.dataLayer.push({
              event: 'generate_lead',
              form_type: payload.form_type,
              page_path: payload.page,
              submission_id: result.submission_id,
            });
          } catch {
            // Analytics availability must never turn a saved inquiry into an error.
          }
        }
        if (status) {
          status.textContent = form.dataset.successMessage || 'Thanks! We received your message.';
          status.classList.add('text-green-500');
        }
        if (success) {
          form.classList.add('hidden');
          success.classList.remove('hidden');
        }
        form.reset();
        attemptId = '';
        previousFields = '';
      } catch (error) {
        if (status) {
          status.textContent = error instanceof Error ? error.message : 'Please try again or email info@ziaflow.com.';
          status.classList.add('text-red-500');
        }
        // Keep the same key after an error: a lost response must not create a second lead.
      } finally {
        pending = false;
        buttons.forEach((button) => (button.disabled = false));
        form.removeAttribute('aria-busy');
      }
    });
  });
}
