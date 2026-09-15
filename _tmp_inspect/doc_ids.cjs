const Database = require("better-sqlite3");
const db = new Database(require("path").join(__dirname, "..", ".tmp", "data.db"), { readonly: true });
console.log("=== doctors (id <-> document_id) ===");
for (const r of db.prepare("SELECT id, document_id, name FROM doctors ORDER BY id").all()) console.log(JSON.stringify(r));
console.log("=== lnk table schema ===");
for (const r of db.prepare("SELECT sql FROM sqlite_master WHERE name='appointments_doctor_lnk'").all()) console.log(r.sql);
db.close();