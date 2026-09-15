export default {
  routes: [
    {
      method: 'POST',
      path: '/register-doctor',
      handler: 'api::doctor.doctor.register',
    },
  ],
};