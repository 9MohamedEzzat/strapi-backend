export default {
  routes: [
    {
      method: 'GET',
      path: '/newsletter-subscribers/admin',
      handler: 'api::newsletter-subscriber.newsletter-subscriber.adminList',
      config: {
        auth: false,
      },
    },
    {
      method: 'DELETE',
      path: '/newsletter-subscribers/admin/:documentId',
      handler: 'api::newsletter-subscriber.newsletter-subscriber.adminDelete',
      config: {
        auth: false,
      },
    },
  ],
};