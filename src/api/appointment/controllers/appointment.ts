/**
 * appointment controller
 */

import { factories } from '@strapi/strapi';
import { errors } from '@strapi/utils';
import { sendNotification } from '../../../utils/mailer';

export default factories.createCoreController('api::appointment.appointment', () => ({
  async find(ctx: any) {
    const { query = {} } = ctx;
    const params = { ...query };
    delete params.populate; // handled manually below
    const results: any[] = await strapi
      .documents('api::appointment.appointment')
      .findMany(params);
    const ids = results.map((r: any) => r.id);

    let lnks: any[] = [];
    if (ids.length) {
      try {
        lnks = await strapi.db
          .connection('appointments_doctor_lnk')
          .whereIn('appointment_id', ids)
          .select('appointment_id', 'doctor_id');
      } catch {
        lnks = [];
      }
    }

    const doctorIds = Array.from(new Set(lnks.map((l) => l.doctor_id)));
    const doctorsById = new Map<any, any>();
    for (const did of doctorIds) {
      try {
        const dr = await strapi.db
          .query('api::doctor.doctor')
          .findOne({ where: { id: did }, populate: { category: true, image: true } });
        if (dr) doctorsById.set(did, dr);
      } catch {
        /* skip */
      }
    }

    for (const r of results) {
      const lnk = lnks.find((l: any) => l.appointment_id === r.id);
      const dr = lnk ? doctorsById.get(lnk.doctor_id) : null;
      r.doctor = dr || null;
    }

    return { data: results };
  },
  async create(ctx: any) {
    const { data } = ctx.request.body ?? {};
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new errors.ValidationError('Missing "data" payload in the request body');
    }
    const { userName, email, date, time, doctor, user } = data;
    if (!userName || typeof userName !== 'string') {
      throw new errors.ValidationError('userName is required');
    }
    if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)) {
      throw new errors.ValidationError('email is required and must be valid');
    }
    if (!date || typeof date !== 'string') {
      throw new errors.ValidationError('date is required');
    }
    if (!time || typeof time !== 'string') {
      throw new errors.ValidationError('time is required');
    }
    if (!doctor || typeof doctor !== 'string') {
      throw new errors.ValidationError('doctor is required');
    }
    let entity;
    try {
      entity = await strapi.documents('api::appointment.appointment').create({
        data: {
          userName,
          email,
          date,
          time,
          doctor,
          ...(user !== undefined && user !== null && user !== ''
            ? { user: String(user) }
            : {}),
        },
      });
    } catch (e: any) {
      const msg = (e && e.message) || 'Failed to create appointment';
      throw new errors.ValidationError(msg);
    }
    try {
      let doctorLabel: string = doctor;
      const doc: any = await strapi
        .documents('api::doctor.doctor')
        .findOne({ documentId: doctor });
      if (doc) doctorLabel = doc.name_ar || doc.name || doctor;
      await sendNotification('حجز موعد جديد - New Appointment', [
        ['المريض / Patient', userName],
        ['البريد / Email', email],
        ['الطبيب / Doctor', doctorLabel],
        ['التاريخ / Date', date],
        ['الوقت / Time', time],
      ]);
    } catch (e) {
      strapi.log.error(
        `[booking-notify] ${e instanceof Error ? e.message : String(e)}`
      );
    }
    return { data: entity };
  },
  async cancel(ctx: any) {
    const jwtUser = ctx.state.user;
    if (!jwtUser || !jwtUser.id) {
      throw new errors.UnauthorizedError();
    }
    const { id } = ctx.request.body ?? {};
    if (!id || typeof id !== 'string') {
      throw new errors.ValidationError('"id" is required');
    }
    let appointment: any;
    try {
      appointment = await strapi
        .documents('api::appointment.appointment')
        .findOne({ documentId: id });
    } catch {
      throw new errors.NotFoundError('Appointment not found');
    }
    if (!appointment) {
      throw new errors.NotFoundError('Appointment not found');
    }
    const profile = await strapi.db
      .query('plugin::users-permissions.user')
      .findOne({ where: { id: jwtUser.id } });
    const ownEmail = profile ? profile.email : null;
    const bookedByMe =
      appointment.user === String(jwtUser.id) ||
      (!!ownEmail && appointment.email === ownEmail);
    if (!bookedByMe) {
      const account = await strapi
        .documents('api::doctor-account.doctor-account')
        .findFirst({ filters: { user: String(jwtUser.id) }, populate: ['doctor'] });
      if (!account || !account.doctor) {
        throw new errors.ForbiddenError();
      }
      const doc = appointment.doctor;
      const docId = Array.isArray(doc) ? doc[0]?.documentId : doc?.documentId;
      if (docId !== account.doctor.documentId) {
        throw new errors.ForbiddenError();
      }
    }
    const updated = await strapi
      .documents('api::appointment.appointment')
      .update({ documentId: id, data: { canceled: true } });
    return { data: updated };
  },
  async mine(ctx: any) {
    const jwtUser = ctx.state.user;
    if (!jwtUser || !jwtUser.id) {
      throw new errors.UnauthorizedError();
    }
    const account = await strapi
      .documents('api::doctor-account.doctor-account')
      .findFirst({ filters: { user: String(jwtUser.id) }, populate: ['doctor'] });
    const doctorId = account && account.doctor ? account.doctor.documentId : null;
    type SortEntry = { [key: string]: 'asc' | 'desc' };
    const sort: SortEntry[] = [{ date: 'desc' }, { id: 'desc' }];
    const profile = await strapi.db
      .query('plugin::users-permissions.user')
      .findOne({ where: { id: jwtUser.id } });
    const ownEmail = profile ? profile.email : null;
    const ownFilters = ownEmail
      ? { $or: [{ user: String(jwtUser.id) }, { email: { $eq: ownEmail } }] }
      : { user: String(jwtUser.id) };
    const own = await strapi.documents('api::appointment.appointment').findMany({
      filters: ownFilters,
      populate: ['doctor'],
      sort,
    });
    if (!doctorId) {
      return { data: own.filter((a) => !a.canceled) };
    }
    const doc = await strapi.documents('api::appointment.appointment').findMany({
      filters: { doctor: { documentId: doctorId } },
      populate: ['doctor'],
      sort,
    });
    const seen = new Set();
    const merged: any[] = [];
    for (const a of [...own, ...doc]) {
      const key = a.id ?? a.documentId;
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(a);
    }
    merged.sort((a, b) => {
      const ad = a.date || '';
      const bd = b.date || '';
      if (ad !== bd) return ad < bd ? 1 : -1;
      return (b.id ?? 0) - (a.id ?? 0);
    });
    return { data: merged.filter((a) => !a.canceled) };
  },
}));