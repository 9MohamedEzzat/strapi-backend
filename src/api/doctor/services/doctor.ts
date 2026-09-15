/**
 * doctor service
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::doctor.doctor', ({ strapi }) => ({
  async find(params: any = {}) {
    const results = await strapi.documents('api::doctor.doctor').findMany({
      ...params,
      status: 'published',
      populate: {
        ...(params.populate || {}),
        category: true,
        image: true,
      },
    });

    const order = ['Adel', 'Tamer', 'Sarah'];
    const rank = (d: any) => {
      const i = d.name ? order.findIndex((n) => (d.name as string).includes(n)) : -1;
      return i === -1 ? 99 : i;
    };
    results.sort((a: any, b: any) => rank(a) - rank(b));

    const pagination = params.pagination || {};
    return { results, pagination };
  },

  async findOne(documentId: string, params: any = {}) {
    const result = await strapi.documents('api::doctor.doctor').findOne({
      documentId,
      ...params,
      status: 'published',
      populate: {
        ...(params.populate || {}),
        category: true,
        image: true,
      },
    });

    return result;
  },
}));