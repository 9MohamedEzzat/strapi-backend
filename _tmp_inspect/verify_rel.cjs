const Database = require("better-sqlite3");
const db = new Database(require("path").join(__dirname, "..", ".tmp", "data.db"), { readonly: true });
console.log("=== appointments_doctor_lnk ===");
try { for (const r of db.prepare("SELECT * FROM appointments_doctor_lnk").all()) console.log(JSON.stringify(r)); } catch (e) { console.log("err", e.message); }
console.log("=== recent appointments ===");
try { for (const r of db.prepare("SELECT id, document_id, user_name, email, date, time FROM appointments ORDER BY id DESC LIMIT 8").all()) console.log(JSON.stringify(r)); } catch (e) { console.log("err", e.message); }
db.close();