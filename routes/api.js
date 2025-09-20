'use strict';

const crypto = require('crypto');
const fetch = require('node-fetch'); // npm install node-fetch@2

// Likes en memoria (clave = símbolo de stock)
const likesMemory = {};

module.exports = function(app) {
  app.get('/api/stock-prices', async (req, res) => {
    try {
      let { stock, like } = req.query;
      if (!stock) return res.status(400).json({ error: 'Stock query required' });

      // Normalizar like parameter para manejar diferentes formatos
      const liked = like === true || like === 'true' || like === 'on';
      
      // Normalizar a array y convertir a mayúsculas
      const stocks = Array.isArray(stock) ? stock.map(s => s.toUpperCase()) : [stock.toUpperCase()];

      // Hash de IP para limitar 1 like por IP (usando trust proxy)
      const clientIP = req.ips[0] || req.ip;
      const userIP = crypto.createHash('sha256').update(clientIP).digest('hex');

      // Obtener info de cada stock
      const results = await Promise.all(
        stocks.map(async (sym) => {
          const resp = await fetch(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${sym}/quote`);
          const data = await resp.json();

          if (!data || !data.symbol || data === 'Unknown symbol') {
            return { stock: sym, error: 'Invalid symbol' };
          }

          // Inicializar likes en memoria
          if (!likesMemory[sym]) likesMemory[sym] = { likes: [], count: 0 };

          // Contar like si es true y no lo había hecho esta IP
          if (liked && !likesMemory[sym].likes.includes(userIP)) {
            likesMemory[sym].likes.push(userIP);
            likesMemory[sym].count++;
          }

          return {
            stock: data.symbol,
            price: data.latestPrice,
            likes: likesMemory[sym].count
          };
        })
      );

      // Si hay dos stocks → devolver rel_likes
      if (results.length === 2) {
        const [a, b] = results;
        return res.json({
          stockData: [
            { stock: a.stock, price: a.price, rel_likes: a.likes - b.likes },
            { stock: b.stock, price: b.price, rel_likes: b.likes - a.likes }
          ]
        });
      }

      // Si hay uno solo → likes normal
      return res.json({ stockData: results[0] });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
};
