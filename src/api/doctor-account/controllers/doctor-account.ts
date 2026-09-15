/**
 * doctor-account controller
 */

import { factories } from '@strapi/strapi';
import { errors } from '@strapi/utils';

const USER_UID = 'plugin::users-permissions.user';
const DA_UID = 'api::doctor-account.doctor-account';

async function findAccountFor(jwtUserId: number) {
  return strapi.documents(DA_UID).findFirst({
    filters: { user: String(jwtUserId) },
    populate: ['doctor'],
  });
}

export default factories.createCoreController(DA_UID, () => ({
  async me(ctx: any) {
    const jwtUser = ctx.state.user;
    if (!jwtUser || !jwtUser.id) {
      throw new errors.UnauthorizedError();
    }
    const me = await strapi.documents(USER_UID).findFirst({
      filters: { id: jwtUser.id },
    });
    if (!me) {
      throw new errors.UnauthorizedError();
    }
    const account = await findAccountFor(jwtUser.id);
    const doc = account && account.doctor ? account.doctor : null;
    return {
      data: {
        doctor: doc ? { documentId: doc.documentId, name: doc.name, name_ar: doc.name_ar } : null,
      },
    };
  },

  async link(ctx: any) {
    const jwtUser = ctx.state.user;
    if (!jwtUser || !jwtUser.id) {
      throw new errors.UnauthorizedError();
    }
    const me = await strapi.documents(USER_UID).findFirst({
      filters: { id: jwtUser.id },
    });
    if (!me) {
      throw new errors.UnauthorizedError();
    }
    const { data } = ctx.request.body ?? {};
    const doctorId = typeof data === 'string' ? data : null;
    if (!doctorId) {
      throw new errors.ValidationError('doctor (documentId) is required');
    }
    const doctor = await strapi.documents('api::doctor.doctor').findOne({ documentId: doctorId });
    if (!doctor) {
      throw new errors.ValidationError('doctor not found');
    }
    const existing = await findAccountFor(jwtUser.id);
    if (existing) {
      await strapi.documents(DA_UID).update({
        documentId: existing.documentId,
        data: { doctor: doctorId },
      });
    } else {
      await strapi.documents(DA_UID).create({
        data: { user: String(jwtUser.id), doctor: doctorId },
      });
    }
    return { data: { ok: true, doctor: doctorId } };
  },
}));