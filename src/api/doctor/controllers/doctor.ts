/**
 * doctor controller
 */

import { factories } from '@strapi/strapi';
import { errors } from '@strapi/utils';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

export default factories.createCoreController('api::doctor.doctor', ({ strapi }) => ({
  async find(ctx: any) {
    const self = this as any;
    const sanitizedQuery = await self.sanitizeQuery(ctx);
    const { results, pagination } = await strapi.service('api::doctor.doctor').find(sanitizedQuery);
    return self.transformResponse(results, { pagination });
  },
  async findOne(ctx: any) {
    const self = this as any;
    const { id } = ctx.params;
    const sanitizedQuery = await self.sanitizeQuery(ctx);
    const entity = await strapi.service('api::doctor.doctor').findOne(id, sanitizedQuery);
    return self.transformResponse(entity);
  },
  async register(ctx: any) {
    const jwtUser = ctx.state.user;
    if (!jwtUser || !jwtUser.id) {
      throw new errors.UnauthorizedError();
    }
    const body = (ctx.request.body && ctx.request.body.data) || ctx.request.body || {};
    const { name, name_ar, year_of_experience, about, about_ar, phone, category, imageBase64 } = body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      throw new errors.ValidationError('name is required');
    }
    let image: any = null;
    if (imageBase64 && typeof imageBase64 === 'string') {
      const m = /^data:(image\/(?:png|jpe?g|webp|gif));base64,(.+)$/.exec(imageBase64.trim());
      if (!m) {
        throw new errors.ValidationError('imageBase64 must be a data:image URI');
      }
      const buffer = Buffer.from(m[2], 'base64');
      if (buffer.length === 0 || buffer.length > 5 * 1024 * 1024) {
        throw new errors.ValidationError('image is empty or too large (max 5MB)');
      }
      const ext = m[1].split('/')[1] === 'jpeg' ? 'jpg' : m[1].split('/')[1];
      const tmpPath = path.join(os.tmpdir(), `avatar-${Date.now()}-${Math.floor(Math.random() * 1e6)}.${ext}`);
      fs.writeFileSync(tmpPath, buffer);
      try {
        const files: any = await strapi.plugin('upload').service('upload').upload({
          data: { fileInfo: {} },
          files: [
            {
              originalFilename: `avatar-${Date.now()}.${ext}`,
              mimetype: m[1],
              size: buffer.length,
              filepath: tmpPath,
            },
          ],
        });
        const file = Array.isArray(files) ? files[0] : null;
        if (file && file.id) {
          image = [file.id];
        }
      } finally {
        try {
          fs.unlinkSync(tmpPath);
        } catch {
          /* ignore */
        }
      }
    }
    const createData: any = {
      name: name.trim(),
      name_ar: (name_ar && typeof name_ar === 'string' && name_ar.trim()) || name.trim(),
    };
    if (year_of_experience != null && !isNaN(Number(year_of_experience))) {
      createData.year_of_experience = Number(year_of_experience);
    }
    if (about && typeof about === 'string' && about.trim()) {
      createData.about = about.trim();
    }
    if (about_ar && typeof about_ar === 'string' && about_ar.trim()) {
      createData.about_ar = about_ar.trim();
    }
    if (phone != null && !isNaN(Number(phone))) {
      createData.phone = Number(phone);
    }
    if (category && typeof category === 'string') {
      createData.category = category;
    }
    if (image) {
      createData.image = image;
    }
    const doc = await strapi.documents('api::doctor.doctor').create({
      data: createData,
    });
    const published = await strapi
      .documents('api::doctor.doctor')
      .publish({ documentId: doc.documentId });
    const account = await strapi
      .documents('api::doctor-account.doctor-account')
      .findFirst({ filters: { user: String(jwtUser.id) } });
    if (account) {
      await strapi
        .documents('api::doctor-account.doctor-account')
        .update({ documentId: account.documentId, data: { doctor: published.documentId } });
    } else {
      await strapi
        .documents('api::doctor-account.doctor-account')
        .create({ data: { user: String(jwtUser.id), doctor: published.documentId } });
    }
    return { data: published };
  },
}));