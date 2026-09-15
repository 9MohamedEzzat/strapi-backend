const Database = require("better-sqlite3");
const db = new Database(".tmp/data.db", { readonly: true });
const std = (sql) => db.prepare(sql).all();
console.log("role_lnk cols:", db.prepare("PRAGMA table_info(up_permissions_role_lnk)").all().map((c) => `${c.name}:${c.type}`).join(", "));
console.log("role_lnk rows:", JSON.stringify(std("SELECT * FROM up_permissions_role_lnk ORDER BY id LIMIT 20"), null, 1));
console.log("roles:", JSON.stringify(std("SELECT id, name, type, document_id FROM up_roles"), null, 1));
console.log("doctor permission ids linked to roles:");
console.log(JSON.stringify(std("SELECT p.id, p.action, r.name FROM up_permissions p LEFT JOIN up_permissions_role_lnk l ON l.up_permissions_id = p.id LEFT JOIN up_roles r ON r.id = l.up_role_id WHERE p.action LIKE 'api::%'"), null, 1));
db.close();