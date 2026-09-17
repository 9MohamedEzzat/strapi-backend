import type { Core } from '@strapi/strapi';
import { sendNotification } from './utils/mailer';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    strapi.db.lifecycles.subscribe({
      models: ['plugin::users-permissions.user'],
      async afterCreate(event) {
        try {
          const user = event.result as
            | { username?: string; name?: string; email?: string; provider?: string; createdAt?: string }
            | undefined;
          if (!user) return;
          const provider = user.provider === 'local' ? 'Email' : user.provider;
await sendNotification('New Registration', [
          ['Name', user.name || user.username],
          ['Email', user.email],
          ['Provider', provider],
          ['Date', user.createdAt],
        ]);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          strapi.log.error(`[registration-notify] ${message}`);
        }
      },
    });
  },
};
