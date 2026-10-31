import { randomUUID } from 'node:crypto';

export type DeliveryState = {
  status: 'pending' | 'sending' | 'accepted' | 'failed' | 'uncertain';
  token?: string;
  attempted_at?: string;
  http_status?: number;
};
export type ReceiptPayload = Record<string, unknown> & { deliveries?: Record<string, DeliveryState> };
export interface ReceiptStore {
  read(): Promise<ReceiptPayload>;
  replace(previous: ReceiptPayload, next: ReceiptPayload): Promise<boolean>;
}

/** Claim and journal dispatch in the existing, restricted receipt. No schema change is required. */
export async function deliverWithReceipt(
  store: ReceiptStore,
  channel: string,
  send: () => Promise<Response>,
  now = () => new Date()
): Promise<string> {
  const payload = await store.read();
  const state = payload.deliveries?.[channel];
  // Historical receipts lack delivery proof. Replaying them must not send old emails again.
  if (!state) return 'legacy_unknown';
  if (state.status === 'accepted' || state.status === 'uncertain') return state.status;
  if (state.status === 'sending') {
    if (now().getTime() - Date.parse(state.attempted_at || '') < 60_000) return 'in_progress';
    const uncertain = {
      ...payload,
      deliveries: { ...payload.deliveries, [channel]: { ...state, status: 'uncertain' as const } },
    };
    await store.replace(payload, uncertain);
    return 'uncertain';
  }
  const claim: DeliveryState = { status: 'sending', token: randomUUID(), attempted_at: now().toISOString() };
  const claimed = { ...payload, deliveries: { ...payload.deliveries, [channel]: claim } };
  if (!(await store.replace(payload, claimed))) return 'in_progress';
  let completed: DeliveryState;
  try {
    const response = await send();
    completed = { ...claim, status: response.ok ? 'accepted' : 'failed', http_status: response.status };
  } catch {
    // A timeout may have happened after acceptance. Hold for reconciliation instead of duplicating email.
    completed = { ...claim, status: 'uncertain' };
  }
  const next = { ...claimed, deliveries: { ...claimed.deliveries, [channel]: completed } };
  if (!(await store.replace(claimed, next))) return 'uncertain';
  return completed.status;
}

export function sourcePath(data: Record<string, unknown>, referer: string | null): string {
  for (const candidate of [data.page, data.page_submitted_from, data.page_url, referer]) {
    if (typeof candidate !== 'string' || !candidate) continue;
    try {
      const url = new URL(candidate, 'https://ziaflow.com');
      if (url.hostname === 'ziaflow.com' || url.hostname === 'www.ziaflow.com') return url.pathname.slice(0, 500);
    } catch {
      /* Try the next supplied source. */
    }
  }
  return '/contact';
}

export function pipelineBatch(id: string, payload: ReceiptPayload, timestamp: string) {
  const extra = (payload.extra || {}) as Record<string, unknown>;
  const name = String(payload.name || '').split(' ');
  const properties = {
    submission_id: id,
    message: payload.message,
    service_interest: payload.service_interest,
    page_url: extra.page_url,
    source_page: extra.page,
    form_type: extra.form_type,
    ...Object.fromEntries(Object.entries(extra).filter(([key]) => key.startsWith('utm_'))),
  };
  return {
    batch: [
      {
        type: 'identify',
        userId: payload.email,
        messageId: `intake:${id}:identify`,
        timestamp,
        traits: {
          email: payload.email,
          first_name: name[0],
          last_name: name.slice(1).join(' '),
          service_interest: payload.service_interest,
        },
      },
      {
        type: 'track',
        userId: payload.email,
        messageId: `intake:${id}:form_submit`,
        timestamp,
        event: 'form_submit',
        properties,
      },
    ],
  };
}
