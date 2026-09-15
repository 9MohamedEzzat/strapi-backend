import { factories } from '@strapi/strapi';

const ADMIN_KEY = process.env.NEWSLETTER_ADMIN_KEY || 'admin123';

function isAdmin(ctx: any) {
  const key = ctx.request.headers['x-admin-key'];
  return typeof key === 'string' && key === ADMIN_KEY;
}

export default factories.createCoreController(
  'api::newsletter-subscriber.newsletter-subscriber',
  ({ strapi }) => ({
    async create(ctx: any) {
      const body = (ctx.request.body && ctx.request.body.data) || ctx.request.body || {};
      const email = typeof body.email === 'string' ? body.email.trim() : '';
      if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
        return ctx.badRequest('email is required and must be valid');
      }
      const existing = await strapi
        .documents('api::newsletter-subscriber.newsletter-subscriber')
        .findFirst({
          filters: { email: { $eqi: email } },
        });
      if (existing) {
        return { data: existing, alreadySubscribed: true };
      }
      const doc = await strapi
        .documents('api::newsletter-subscriber.newsletter-subscriber')
        .create({
          data: { email },
        });
      return { data: doc };
    },
    async adminList(ctx: any) {
      if (!isAdmin(ctx)) {
        return ctx.forbidden('admin key required');
      }
      const entries = await strapi
        .documents('api::newsletter-subscriber.newsletter-subscriber')
        .findMany({
          sort: { createdAt: 'desc' },
          limit: 1000,
        });
      return { data: entries, total: entries.length };
    },
    async adminDelete(ctx: any) {
      if (!isAdmin(ctx)) {
        return ctx.forbidden('admin key required');
      }
      const { documentId } = ctx.params;
      if (!documentId) {
        return ctx.badRequest('documentId is required');
      }
      const deleted = await strapi
        .documents('api::newsletter-subscriber.newsletter-subscriber')
        .delete({ documentId });
      return { data: deleted };
    },
  })
);