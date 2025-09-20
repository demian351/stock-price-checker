'use strict';

const { MongoClient } = require('mongodb');
const crypto = require('crypto');

const MONGO_URI = process.env.MONGO_URI;
let client;
let collection;

// Inicializar conexión a MongoDB solo si MONGO_URI está disponible
if (MONGO_URI) {
  client = new MongoClient(MONGO_URI);
  (async () => {
    try {
      await client.connect();
      const db = client.db('stockchecker');
      collection = db.collection('likes');
      console.log('✅ Conectado a MongoDB exitosamente!');
    } catch (err) {
      console.error('❌ Error al conectar a MongoDB:', err);
    }
  })();
} else {
  console.warn('⚠️ MONGO_URI no encontrado. La funcionalidad de likes estará deshabilitada.');
}

module.exports = function (app) {
  app.get('/api/stock-prices', async (req, res) => {
    try {
      let { stock, like } = req.query;
      const userIP = crypto.createHash('sha256')
                           .update(req.ip)
                           .digest('hex');

      // Normalizar stock a array
      const stocks = Array.isArray(stock) ? stock : [stock];

      // Obtener info de cada acción
      const results = await Promise.all(stocks.map(async sym => {
        const resp = await fetch(
          `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${sym}/quote`
        );
        const data = await resp.json();

        if (!data || !data.symbol || data === 'Unknown symbol') {
          return { stock: sym, error: 'Invalid symbol' };
        }

        // Likes: actualizar si corresponde y hay conexión a base de datos
        let likesCount = 0;
        if (collection) {
          let likesDoc = await collection.findOne({ stock: sym });
          if (!likesDoc) {
            likesDoc = { stock: sym, likes: [], count: 0 };
            await collection.insertOne(likesDoc);
          }

          if (like === 'true' && !likesDoc.likes.includes(userIP)) {
            await collection.updateOne(
              { stock: sym },
              { $push: { likes: userIP }, $inc: { count: 1 } }
            );
            likesDoc.count++;
          }
          likesCount = likesDoc.count;
        } else {
          // Sin base de datos, usar valor predeterminado
          likesCount = 0;
        }

        return {
          stock: data.symbol,
          price: data.latestPrice,
          likes: likesCount
        };
      }));

      // Dos acciones → calcular rel_likes
      if (results.length === 2) {
        const [a, b] = results;
        const relA = a.likes - b.likes;
        const relB = b.likes - a.likes;
        return res.json({
          stockData: [
            { stock: a.stock, price: a.price, rel_likes: relA },
            { stock: b.stock, price: b.price, rel_likes: relB }
          ]
        });
      }

      // Una sola acción
      return res.json({ stockData: results[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
};
