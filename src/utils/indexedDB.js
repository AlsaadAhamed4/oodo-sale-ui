import { openDB } from "idb";

const DB_NAME = "sales_dashboard_db";
const STORE_NAME = "sales_data";

export async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    },
  });
}

export async function saveSalesData(data) {
  const db = await getDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  for (const item of data) {
    await store.put(item);
  }
  await tx.done;
}

export async function getAllSalesData() {
  const db = await getDB();
  return db.getAll(STORE_NAME);
}
