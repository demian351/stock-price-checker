'use strict';

const fetch = require('node-fetch');

module.exports = function (app) {

  // 🔧 Base de datos temporal en memoria
  // FCC no pide DB real, solo que funcione mientras corre el server
  let stocksData = {}; // { 'GOOG': { likes: Set([ip1, ip2]), price: ... } }

  // Función para traer precio desde la API de FCC (Alpha Vantage rota a veces, pero FCC usa mock)
  async function getStockPrice(stock) {
    try {
      let res = await fetch(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock}/quote`);
      let data = await res.json();
      return data.latestPrice;
    } catch (err) {
      console.error("❌ Error obteniendo precio:", err);
      return null;
    }
  }

  app.route('/api/stock-prices')
    .get(async function (req, res) {
      try {
        let stock = req.query.stock;
        let like  = req.query.like === 'true';
        let ip    = req.ip;

        if (!stock) {
          return res.json({ error: "stock query param required" });
        }

        // Permite 1 o 2 stocks
        if (Array.isArray(stock)) {
          let results = [];

          for (let s of stock) {
            let symbol = s.toUpperCase();
            let price = await getStockPrice(symbol);

            if (!stocksData[symbol]) {
              stocksData[symbol] = { likes: new Set(), price: price };
            }

            if (like) stocksData[symbol].likes.add(ip);
            stocksData[symbol].price = price;

            results.push({
              stock: symbol,
              price: price,
              likes: stocksData[symbol].likes.size
            });
          }

          // Comparar likes
          let rel1 = results[0].likes - results[1].likes;
          let
