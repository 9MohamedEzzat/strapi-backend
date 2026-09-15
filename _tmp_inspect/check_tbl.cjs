const Database = require("better-sqlite3");
const db = new Database(".tmp/data.db", { readonly: true });
const tabs = db
  .prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
  .all()
  .map((r) => r.name);
console.log("appointments table exists:", tabs.includes("appointments"));
console.log(
  "appointments_link tables:",
  tabs.filter((t) => t.startsWith("appointments") && t.includes("_lnk")).join(", ") || "(none)"
);
if (tabs.includes("appointments")) {
  console.log(
    "cols:",
    db.prepare("PRAGMA table_info(appointments)").all().map((c) => `${c.name}:${c.type}`).join(", ")
  );
}
db.close();