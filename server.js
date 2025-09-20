'use strict';

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');

const apiRoutes = require('./routes/api.js');
const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner');

const app = express();

// Configuración para Replit environment  
app.set('trust proxy', true);

// Middleware de seguridad con CSP
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
      },
    },
    crossOriginResourcePolicy: { policy: 'same-site' },
    xContentTypeOptions: true,
  })
);

// Archivos estáticos
app.use('/public', express.static(process.cwd() + '/public'));

// CORS (solo abierto para compatibilidad con FCC)
app.use(cors({ origin: '*' }));

// Parseo de body con límite de 100kb
app.use(bodyParser.json({ limit: '100kb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '100kb' }));

// Index page
app.route('/').get((req, res) => {
  res.sendFile(process.cwd() + '/views/index.html');
});

// FCC Testing routes
fccTestingRoutes(app);

// API routes
apiRoutes(app);

// 404 Not Found
app.use((req, res) => {
  res.status(404).type('text').send('Not Found');
});

// Puerto dinámico Replit
const PORT = process.env.PORT || 5000;
const listener = app.listen(PORT, () => {
  console.log('Your app is listening on port ' + listener.address().port);

  // Corre tests solo si NODE_ENV=test
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

module.exports = app; // para FCC testing
