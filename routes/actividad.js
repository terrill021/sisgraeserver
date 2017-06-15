var express = require('express');
var router = express.Router();

var middleware = require('../settings/middleware');
var actividades = require('../controllers/actividad');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

//GET - Listar actividades
router.get('/actividades', middleware.ensureAuthorized, actividades.obtenerActividades);

//POST - Agregar actividad
router.post('/actividad', middleware.ensureAuthorized, actividades.agregarActividad);

//PUT - Actualizar actividad
router.put('/actividad/:id', middleware.ensureAuthorized, actividades.actualizarActividad);

//DELETE - Eliminar actividad
router.delete('/actividad/:id', middleware.ensureAuthorized, actividades.eliminarActividad);

module.exports = router;