/**
 * contact-message controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController(
  'api::contact-message.contact-message',
  ({ strapi }) => ({
    async create(ctx: any) {
      const self = this as any;
      const body = (ctx.request.body && ctx.request.body.data) || ctx.request.body || {};
      const { name, email, phone, message } = body;
      if (!name || typeof name !== 'string' || !name.trim()) {
        return ctx.badRequest('name is required');
      }
      if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email.trim())) {
        return ctx.badRequest('email is required and must be valid');
      }
      if (!message || typeof message !== 'string' || !message.trim()) {
        return ctx.badRequest('message is required');
      }
      const doc = await strapi.documents('api::contact-message.contact-message').create({
        data: {
          name: name.trim(),
          email: email.trim(),
          ...(phone && typeof phone === 'string' && phone.trim()
            ? { phone: phone.trim() }
            : {}),
          message: message.trim(),
        },
      });
      return { data: doc };
    },
  })
);