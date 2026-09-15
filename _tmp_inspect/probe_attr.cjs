process.env.NODE_PATH = 'C:\\Users\\MG\\Projects\\appointment_strapi\\doctor_appointment\\node_modules';
require('module').Module._initPaths();
const fs = require('fs');
const { createStrapi } = require('@strapi/strapi');
const path = require('path');
const cwd = 'C:\\Users\\MG\\Projects\\appointment_strapi\\doctor_appointment';
(async () => {
  const rawFile = path.join(cwd, 'dist', 'src', 'api', 'appointment', 'content-types', 'appointment', 'schema.json');
  const raw = JSON.parse(fs.readFileSync(rawFile, 'utf8'));
  console.log('FILE schema attributes:', Object.keys(raw.attributes));
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
  await strapi.listen();
  const ct = strapi.contentTypes['api::appointment.appointment'];
  console.log('RUNTIME attributes:', Object.keys(ct?.schema?.attributes || {}));
  console.log('RUNTIME all attr JSON:', JSON.stringify(ct?.schema?.attributes));
  console.log('RUNTIME info:', JSON.stringify(ct?.schema?.info));
  console.log('RUNTIME schema keys:', Object.keys(ct?.schema || {}));
  const doc = strapi.contentTypes['api::doctor.doctor'];
  console.log('DOCTOR runtime attributes:', Object.keys(doc?.schema?.attributes || {}));
  console.log('DOCTOR runtime schema keys:', Object.keys(doc?.schema || {}));
  process.exit(0);
})().catch((e) => { console.error('PROBE FAIL', e); process.exit(1); });