var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var config = require('./settings/config');
var middleware = require('./settings/middleware');

//Conexión a BD

  mongoose.connect(config.database);



//Importación de Modelos MongoDB
require('./models/usuario');
require('./models/actividad');
require('./models/dependencia');
require('./models/horario');
require('./models/sala');
require('./models/reservacion');
require('./models/sancion');

//Importación de Rutas 
var routes = require('./routes/index');
var usuario = require('./routes/usuario');
var auth = require('./routes/auth');
var actividad = require('./routes/actividad');
var dependencia = require('./routes/dependencia');
var horario = require('./routes/horario');
var sala = require('./routes/sala');
var reserva = require('./routes/reservacion');
var sancion = require('./routes/sancion');

var app = express();

//Generar palabra clave - Token
app.set('superSecret', config.phrase);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//Dominios Cruzados
app.all('*', middleware.dominiosCruzados);

//Generar Rutas
app.use('/', routes);
app.use('/auth', auth);
app.use('/app', reserva, sala, horario, dependencia, actividad, usuario, sancion);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
