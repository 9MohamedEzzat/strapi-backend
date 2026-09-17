const Database = require('better-sqlite3');
const path = 'C:/Users/MG/Projects/appointment_strapi/doctor_appointment/db/data.db';
const db = new Database(path, { readonly: true });
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all().map(r => r.name);
console.log('tables=' + tables.join(', '));
db.close();