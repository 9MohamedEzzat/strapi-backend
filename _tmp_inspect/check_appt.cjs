const Database = require("better-sqlite3");
const db = new Database(".tmp/data.db", { readonly: true });
console.log(
  "appointments cols:",
  db.prepare("PRAGMA table_info(appointments)").all()
    .map((c) => `${c.name}:${c.type}`)
    .join(", ")
);
const lnks = db
  .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'appointments%' ORDER BY name")
  .all()
  .map((r) => r.name);
console.log("appointment tables:", lnks.join(", "));
console.log(
  "appointment rows:",
  db.prepare("SELECT id, userName, email, date, time, doctor_id FROM appointments").all()
);
db.close();