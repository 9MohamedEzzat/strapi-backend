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
            | { username?: string; email?: string; provider?: string; createdAt?: string }
            | undefined;
          if (!user) return;
          const provider = user.provider === 'local' ? 'بريد إلكتروني / Email' : user.provider;
          await sendNotification('تسجيل حساب جديد - New Registration', [
            ['الاسم / Username', user.username],
            ['البريد / Email', user.email],
            ['طريقة الدخول / Provider', provider],
            ['التاريخ / Date', user.createdAt],
          ]);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          strapi.log.error(`[registration-notify] ${message}`);
        }
      },
    });
  },
};
