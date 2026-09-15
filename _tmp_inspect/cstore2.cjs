const Database = require("better-sqlite3");
const db = new Database(".tmp/data.db", { readonly: true });
const row = db
  .prepare("SELECT value FROM strapi_core_store_settings WHERE key = 'strapi_content_types_schema'")
  .get();
const json = row ? JSON.parse(row.value) : {};
console.log("keys:", Object.keys(json));
for (const [k, v] of Object.entries(json)) {
  if (k.includes("appointment") || k.includes("doctor")) {
    console.log("\n==== " + k + " ====");
    console.log(JSON.stringify(v.attributes, null, 2));
  }
}
db.close();