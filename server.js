'use strict';

require('dotenv').config();
const express     = require('express');
const bodyParser  = require('body-parser');
const cors        = require('cors');
const helmet      = require('helmet');

const apiRoutes         = require('./routes/api.js');
const fccTestingRoutes  = require('./routes/fcctesting.js');
const runner            = require('./test-runner');

const app = express();

// Middleware de seguridad
app.use(helmet({
  contentSecurityPolicy: false, // necesario si servís HTML simple sin CSP definida
  crossOriginResourcePolicy: { policy: "same-site" },
  xContentTypeOptions: true
}));

// Archivos estáticos
app.use('/public', express.static(process.cwd() + '/public'));

// CORS (solo abierto por compatibilidad con los tests de FCC)
app.use(cors({ origin: '*' }));

// Parseo de body (con límite de tamaño para evitar DoS)
app.use(bodyParser.json({ limit: '100kb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '100kb' }));

// Index page (HTML)
app.route('/')
  .get((req, res) => {
    res.sendFile(process.cwd() + '/views/index.html');
  });

// Rutas para testing de FCC
fccTestingRoutes(app);

// Rutas de API
apiRoutes(app);

// 404 Not Found Middleware
app.use((req, res) => {
  res.status(404)
    .type('text')
    .send('Not Found');
});

// Start server + correr tests si está en modo test
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
  if (process.env.NODE_ENV === 'test') {
    console.log('Running Tests...');
    setTimeout(() => {
      try {
        runner.run();
      } catch (e) {
        console.log('Tests are not valid:');
        console.error(e);
      }
    }, 3500);
  }
});

module.exports = app; // para testing
