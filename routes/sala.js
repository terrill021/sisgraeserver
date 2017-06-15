var express = require('express');
var router = express.Router();
var middleware = require('../settings/middleware');
var salas = require('../controllers/sala');
/* GET salas listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

//GET - Listar salas
router.get('/salas', middleware.ensureAuthorized, salas.obtenerSalas);

//GET - Listar salas por actividad, equipos y asistentes
router.get('/salas/q', middleware.ensureAuthorized, salas.obtenerSalasPorPropiedades);

//POST - Agregar salas
router.post('/sala', middleware.ensureAuthorized, salas.agregarSala);

//PUT - Actualizar salas
router.put('/sala/:id', middleware.ensureAuthorized, salas.actualizarSala)

//DELETE - Eliminar sala
router.delete('/sala/:id', middleware.ensureAuthorized, salas.eliminarSala);

module.exports = router;