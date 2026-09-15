const Database = require("better-sqlite3");
const db = new Database(".tmp/data.db", { readonly: true });
const tables = db
  .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'up_%' ORDER BY name")
  .all()
  .map((r) => r.name);
console.log("UP tables:", tables.join(", "));
const cols = db.prepare("PRAGMA table_info(up_permissions)").all().map((c) => c.name);
console.log("up_permissions cols:", cols.join(", "));
const p = db.prepare("SELECT * FROM up_permissions ORDER BY id LIMIT 40").all();
console.log(JSON.stringify(p, null, 1));
db.close();