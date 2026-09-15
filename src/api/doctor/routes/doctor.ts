/**
 * doctor router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::doctor.doctor', {
  config: {
    find: { auth: false },
    findOne: { auth: false },
  },
});