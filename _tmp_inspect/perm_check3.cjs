const Database = require("better-sqlite3");
const db = new Database(require("path").join(__dirname, "..", ".tmp", "data.db"), { readonly: true });
console.log("=== up_permissions all ===");
for (const r of db.prepare(`SELECT id, action, document_id FROM up_permissions ORDER BY id`).all()) {
  console.log(r.id, r.document_id, r.action);
}
console.log("=== up_permissions_role_lnk all ===");
for (const r of db.prepare(`SELECT * FROM up_permissions_role_lnk ORDER BY permission_id`).all()) {
  console.log(JSON.stringify(r));
}
db.close();