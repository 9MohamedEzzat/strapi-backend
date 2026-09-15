export default {
  routes: [
    {
      method: 'GET',
      path: '/my-appointments',
      handler: 'api::appointment.appointment.mine',
    },
    {
      method: 'POST',
      path: '/cancel-appointment',
      handler: 'api::appointment.appointment.cancel',
    },
  ],
};