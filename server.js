'use strict';

const express     = require('express');
const bodyParser  = require('body-parser');
const cors        = require('cors');
const helmet      = require('helmet');

const apiRoutes        = require('./routes/api.js');
const fccTestingRoutes = require('./routes/fcctesting.js');
const runner           = require('./test-runner');

const app = express();

// ---------- 🔐 Configuración Helmet (tests 2–13) ----------
app.use(helmet.hidePoweredBy());                          // test 1
app.use(helmet.frameguard({ action: 'sameorigin' }));     // test 2
app.use(helmet.dnsPrefetchControl());                     // test 3
app.use(helmet.referrerPolicy({ policy: 'same-origin' }));// test 4
app.use(helmet.noSniff());                                // test 5
app.use(helmet.xssFilter());                              // test 6
app.use(helmet.ieNoOpen());                               // test 7
app.use(helmet.hsts({ maxAge: 90 * 24 * 60 * 60, force: true })); // test 8
app.use(helmet.noCache());                                // test 9
app.use(helmet.contentSecurityPolicy({                    // test 10–13
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", 'trusted-cdn.com']
  }
}));
// ----------------------------------------------------------

app.use('/public', express.static(process.cwd() + '/public'));

app.use(cors({ origin: '*' })); // FCC necesita CORS abierto

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rutas FCC
fccTestingRoutes(app);

// Rutas API
apiRoutes(app);

// Página principal
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  });

// Error 404
app.use(function (req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("Listening on port " + port);
  if (process.env.NODE_ENV === 'test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch (e) {
        let error = e;
        console.log('Tests are not valid:');
        console.log(error);
      }
    }, 1500);
  }
});

module.exports = app;
