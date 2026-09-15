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
  console.log('dirs.app =', strapi.dirs.app);
  console.log('dirs.dist =', strapi.dirs.dist);
  console.log('dirs.dist.api =', strapi.dirs.dist.api);
  console.log('dirs.dist.src =', strapi.dirs.dist.src);
  try { console.log('apis registry =', strapi.get('apis') && Object.keys(strapi.get('apis').getStore?.() || strapi.get('apis') || {})); } catch (e) { console.log('apis dump fail', e.message); }
  const apis = strapi.get('apis');
  try { for (const k of Object.keys(apis.getStore ? ops : apis)) {} } catch (e) {}
  console.log('contentTypes UIDs =', Object.keys(strapi.contentTypes).sort().join(', '));
  process.exit(0);
})().catch((e) => { console.error('PROBE FAIL', e); process.exit(1); });