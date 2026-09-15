const Database = require("better-sqlite3");
const db = new Database(require("path").join(__dirname, "..", ".tmp", "data.db"), { readonly: true });
console.log("=== PUBLIC (role 2) perms ===");
for (const r of db.prepare(`SELECT p.id, p.action FROM up_permissions p JOIN up_permissions_role_lnk l ON l.permission_id = p.id WHERE l.role_id = 2 ORDER BY p.id`).all()) {
  console.log(r.id, r.action);
}
console.log("=== AUTHENTICATED (role 1) perms ===");
for (const r of db.prepare(`SELECT p.id, p.action FROM up_permissions p JOIN up_permissions_role_lnk l ON l.permission_id = p.id WHERE l.role_id = 1 ORDER BY p.id`).all()) {
  console.log(r.id, r.action);
}
db.close();