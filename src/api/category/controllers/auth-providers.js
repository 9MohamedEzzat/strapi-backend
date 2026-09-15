'use strict';

module.exports = {
  /**
   * Reports which OAuth providers are ACTUALLY usable
   * (enabled AND configured with a client id).
   */
  async list(ctx) {
    const rec = await strapi.db
      .query('strapi::core-store')
      .findOne({ where: { key: 'plugin_users-permissions_grant' } });
    const grant = rec ? JSON.parse(rec.value) : {};
    const out = {};
    for (const p of ['google', 'facebook']) {
      const cfg = grant[p];
      out[p] = !!(cfg && cfg.enabled && cfg.client_id);
    }
    ctx.body = out;
    return ctx;
  },
};