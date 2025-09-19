'use strict';

const { MongoClient } = require('mongodb');
const crypto = require('crypto');

const MONGO_URI = process.env.MONGO_URI;
const client = new MongoClient(MONGO_URI);
let collection;

(async () => {
  await client.connect();
  const db = client.db('stockchecker');
  collection = db.collection('likes');
})();

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

        // Likes: actualizar si corresponde
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

        return {
          stock: data.symbol,
          price: data.latestPrice,
          likes: likesDoc.count
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
