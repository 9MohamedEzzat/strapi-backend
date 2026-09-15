process.env.NODE_PATH = 'C:\\Users\\MG\\Projects\\appointment_strapi\\doctor_appointment\\node_modules';
require('module').Module._initPaths();
const { createStrapi } = require('@strapi/strapi');
const path = require('path');
const cwd = 'C:\\Users\\MG\\Projects\\appointment_strapi\\doctor_appointment';
(async () => {
  const strapi = createStrapi({
    appDir: cwd,
    distDir: path.join(cwd, 'dist'),
    app: { keys: ['myKeyA', 'myKeyB'] },
  });
  strapi.config.set('database.connection', {
    client: 'sqlite',
    connection: { filename: path.join(cwd, '.tmp', 'data.db') },
    useNullAsDefault: true,
    acquireConnectionTimeout: 60000,
  });
  await strapi.load();
  const ct = strapi.contentTypes['api::appointment.appointment'];
  console.log('has doctor attr:', !!(ct && ct.schema && ct.schema.attributes && ct.schema.attributes.doctor));
  console.log('doctor attr:', JSON.stringify(ct?.schema?.attributes?.doctor));
  try {
    const svc = strapi.service('api::appointment.appointment');
    const res = await svc.create({
      data: { userName: 'probe', email: 'probe@test.com', date: '2026-10-01', time: '10:00 AM', doctor: 'egbtaom2m23n6u7t1mhazhyl' },
    });
    console.log('SERVICE CREATE OK, documentId:', res.documentId);
  } catch (e) {
    console.log('SERVICE CREATE FAIL:', e.message);
  }
  process.exit(0);
})().catch((e) => { console.error('PROBE FAIL', e); process.exit(1); });