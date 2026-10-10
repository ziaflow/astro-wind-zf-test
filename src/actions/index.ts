import { ActionError, defineAction } from 'astro:actions';

import { processSubmission, requestMeta } from '~/lib/forms/submit';

export const server = {
  /**
   * Progressive-enhancement path for <ziaflow-contact-form>.
   * Accepts raw FormData; all validation/allowlisting happens in processSubmission so the
   * JS path and the native no-JS POST path (src/pages/forms/submit.astro) behave identically.
   */
  submitInquiry: defineAction({
    accept: 'form',
    handler: async (formData, context) => {
      const result = await processSubmission(formData, requestMeta(context.request, context.clientAddress));

      if (result.ok) {
        return { submissionId: result.submissionId, message: result.message };
      }

      if (result.code === 'invalid' && result.fieldErrors) {
        // Field errors are returned as data so the client can mark individual inputs.
        return { submissionId: null, message: result.message, fieldErrors: result.fieldErrors };
      }

      throw new ActionError({
        code:
          result.status === 429 ? 'TOO_MANY_REQUESTS' : result.status === 400 ? 'BAD_REQUEST' : 'INTERNAL_SERVER_ERROR',
        message: result.message,
      });
    },
  }),
};
