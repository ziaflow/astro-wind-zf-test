import { ActionError, defineAction } from 'astro:actions';
import { z } from 'astro:schema';

import { processSubmission, requestMeta } from '~/lib/forms/submit';
import { supabase } from '~/lib/supabase';
import { identifyUser, trackEvent } from '~/lib/customerio';
import { logCommunication } from '~/lib/communications';

export const server = {
  /**
   * Progressive-enhancement path for <ziaflow-contact-form>.
   */
  submitInquiry: defineAction({
    accept: 'form',
    handler: async (formData, context) => {
      const result = await processSubmission(formData, requestMeta(context.request, context.clientAddress));

      if (result.ok) {
        return { submissionId: result.submissionId, message: result.message };
      }

      if (result.code === 'invalid' && result.fieldErrors) {
        return { submissionId: null, message: result.message, fieldErrors: result.fieldErrors };
      }

      throw new ActionError({
        code:
          result.status === 429 ? 'TOO_MANY_REQUESTS' : result.status === 400 ? 'BAD_REQUEST' : 'INTERNAL_SERVER_ERROR',
        message: result.message,
      });
    },
  }),

  /**
   * Type-safe Astro Action for QuickLeadForm and HeroQuickForm.
   * Validates schema, persists to Supabase, dispatches Customer.io event.
   */
  submitQuickLead: defineAction({
    accept: 'form',
    input: z.object({
      name: z.string().min(2, 'Name must be at least 2 characters'),
      email: z.string().email('Valid business email is required'),
      phone: z.string().optional(),
      company_name: z.string().optional(),
      service_needed: z.string().min(2, 'Please select or describe a service'),
      comments: z.string().optional(),
      page_submitted_from: z.string().default('/'),
      form_type: z.string().default('quick_lead'),
      utm_source: z.string().optional(),
      utm_medium: z.string().optional(),
      utm_campaign: z.string().optional(),
      utm_term: z.string().optional(),
      utm_content: z.string().optional(),
      referrer: z.string().optional(),
    }),
    handler: async (input) => {
      let insertedLeadId: string | number | null = null;

      // 1. Persist directly into Supabase leads table
      if (supabase) {
        const { data: dbData, error: dbError } = await supabase
          .from('leads')
          .insert([
            {
              name: input.name,
              email: input.email,
              phone: input.phone || null,
              company_name: input.company_name || null,
              service_needed: input.service_needed,
              comments: input.comments || null,
              page_submitted_from: input.page_submitted_from,
              status: 'new',
            },
          ])
          .select('id')
          .single();

        if (!dbError && dbData?.id) {
          insertedLeadId = dbData.id;
        }
      }

      // 2. Dispatch Customer.io contact_form_submitted event
      try {
        const customerId = insertedLeadId ? `lead_${insertedLeadId}` : input.email;
        await identifyUser(customerId, {
          email: input.email,
          company_name: input.company_name,
          phone: input.phone,
          service_needed: input.service_needed,
          utm_source: input.utm_source,
          utm_medium: input.utm_medium,
          utm_campaign: input.utm_campaign,
          landing_page: input.page_submitted_from,
          referrer: input.referrer,
        });

        await trackEvent(customerId, 'contact_form_submitted', {
          form_type: input.form_type,
          service_needed: input.service_needed,
          page_submitted_from: input.page_submitted_from,
          utm_source: input.utm_source,
          utm_campaign: input.utm_campaign,
        });
      } catch (e) {
        console.warn('Customer.io action event notice:', e);
      }

      // 3. Log to Supabase communications log
      await logCommunication({
        channel: 'form',
        direction: 'inbound',
        status: 'received',
        subject: `Quick Lead: ${input.name}`,
        sender: `${input.name} <${input.email}>`,
        recipient: 'ZiaFlow',
        content: input.comments || `Service: ${input.service_needed}`,
        pagePath: input.page_submitted_from,
        formId: input.form_type,
        metadata: { ...input },
      });

      return {
        success: true,
        message: 'Thank you! We have received your inquiry and will follow up shortly.',
      };
    },
  }),
};

