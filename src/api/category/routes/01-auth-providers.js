'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/auth-providers',
      handler: 'api::category.auth-providers.list',
      config: {
        auth: false,
      },
    },
  ],
};