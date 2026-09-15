const Database = require("better-sqlite3");
const db = new Database(".tmp/data.db", { readonly: true });
const rows = db
  .prepare("SELECT key, value FROM strapi_core_store_settings WHERE key LIKE '%onfig%' OR key LIKE '%ontent%' OR key LIKE '%chema%' OR key LIKE '%ppointment%'")
  .all();
for (const r of rows) {
  console.log("\n### KEY:", r.key);
  console.log(String(r.value).slice(0, 1500));
}
db.close();