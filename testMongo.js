// testMongo.js
require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

(async () => {
  try {
    await client.connect();
    console.log("✅ Conectado a MongoDB exitosamente!");

    const db = client.db("stockchecker");
    const collections = await db.listCollections().toArray();
    console.log("📦 Colecciones en 'stockchecker':", collections.map(c => c.name));
  } catch (err) {
    console.error("❌ Error al conectar:", err);
  } finally {
    await client.close();
  }
})();
