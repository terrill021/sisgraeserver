var express = require('express');
var router = express.Router();
var middleware = require('../settings/middleware');
var sanciones = require('../controllers/sancion');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

//GET - Listar sanciones
router.get('/sanciones', middleware.ensureAuthorized, sanciones.obtenerSanciones);

//GET - Listar sanciones por usuario
router.get('/sanciones/usuario/:id', middleware.ensureAuthorized, sanciones.obtenerSancionesPorUsuario);

//POST - Agregar sanción
router.post('/sancion', middleware.ensureAuthorized, sanciones.agregarSancion);

//PUT - Actualizar sanción
router.put('/sancion/:id', middleware.ensureAuthorized, sanciones.actualizarSancion);

//DELETE - Eliminar sanción
router.delete('/sancion/:id', middleware.ensureAuthorized, sanciones.eliminarSancion);

module.exports = router;