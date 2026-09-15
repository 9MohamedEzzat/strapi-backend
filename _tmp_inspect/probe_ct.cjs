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
  console.log('appointment schema attributes:', JSON.stringify(ct?.schema?.attributes, null, 2));
  const dbAttr = strapi.db.metadata.get('api::appointment.appointment')?.attributes || {};
  console.log('DB metadata attributes:', Object.keys(dbAttr));
  const doctorAttr = (strapi.db.metadata.get('api::appointment.appointment'))?.attributes?.doctor;
  console.log('DB doctor attr:', JSON.stringify(doctorAttr));
  process.exit(0);
})().catch((e) => { console.error('PROBE FAIL', e); process.exit(1); });