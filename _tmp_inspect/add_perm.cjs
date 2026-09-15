const Database = require("better-sqlite3");
const db = new Database(".tmp/data.db");
const now = Date.now();
const docId =
  Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10).substring(0, 8);
const action = "api::appointment.appointment.create";
const exists = db
  .prepare("SELECT id FROM up_permissions WHERE action = ?")
  .get(action);
if (exists) {
  console.log("ALREADY EXISTS id", exists.id);
} else {
  const info = db
    .prepare(
      "INSERT INTO up_permissions (document_id, action, created_at, updated_at, published_at, created_by_id, updated_by_id, locale) VALUES (?,?,?,?,?,?,?,?)"
    )
    .run(docId, action, now, now, now, null, null, null);
  const permId = info.lastInsertRowid;
  const ord =
    db
      .prepare("SELECT COALESCE(MAX(permission_ord),0)+1 AS n FROM up_permissions_role_lnk WHERE role_id=2")
      .get().n;
  db.prepare(
    "INSERT INTO up_permissions_role_lnk (permission_id, role_id, permission_ord) VALUES (?,?,?)"
  ).run(permId, 2, ord);
  console.log("INSERTED permission", permId, "linked to Public role (2), ord", ord);
}
console.log(
  JSON.stringify(
    db
      .prepare(
        "SELECT p.id, p.action, r.name AS role FROM up_permissions p LEFT JOIN up_permissions_role_lnk l ON l.permission_id=p.id LEFT JOIN up_roles r ON r.id=l.role_id WHERE p.action LIKE 'api::%' ORDER BY p.id"
      )
      .all(),
    null,
    1
  )
);
db.close();