export default {
  routes: [
    {
      method: 'GET',
      path: '/doctor-accounts/me',
      handler: 'api::doctor-account.doctor-account.me',
    },
    {
      method: 'PUT',
      path: '/doctor-accounts/me/link',
      handler: 'api::doctor-account.doctor-account.link',
    },
  ],
};