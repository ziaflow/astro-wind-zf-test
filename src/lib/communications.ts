import { supabase } from '~/lib/supabase';

export type CommunicationChannel = 'form' | 'email' | 'chat' | 'booking' | 'system';
export type CommunicationDirection = 'inbound' | 'outbound';
export type CommunicationStatus = 'received' | 'sent' | 'delivered' | 'failed' | 'pending';

export interface CommunicationLogEntry {
  channel: CommunicationChannel;
  direction: CommunicationDirection;
  status: CommunicationStatus;
  subject?: string;
  sender?: string;
  recipient?: string;
  content?: string;
  pagePath?: string;
  formId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Log communication event (forms, emails, notifications, bookings) into Supabase
 * Fails gracefully and silently in case of db timeout so it never blocks user-facing UX.
 */
export async function logCommunication(entry: CommunicationLogEntry): Promise<void> {
  if (!supabase) return;

  try {
    const { error } = await supabase.from('communications_log').insert([
      {
        channel: entry.channel,
        direction: entry.direction,
        status: entry.status,
        subject: entry.subject ?? null,
        sender: entry.sender ?? null,
        recipient: entry.recipient ?? null,
        content: entry.content ?? null,
        page_path: entry.pagePath ?? null,
        form_id: entry.formId ?? null,
        metadata: entry.metadata ?? {},
      },
    ]);

    if (error) {
      console.warn('Communications log table warning (table may need creation):', error.message);
    }
  } catch (err) {
    console.warn('Failed to record communication log:', err);
  }
}
