import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::newsletter-subscriber.newsletter-subscriber', {
  config: {
    create: { auth: false },
  },
});