var express = require('express');
var router = express.Router();
var middleware = require('../settings/middleware');
var horarios = require('../controllers/horarios');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

//GET - Listar horarios
router.get('/horarios', middleware.ensureAuthorized, horarios.obtenerHorarios);

//POST - Agregar horario
router.post('/horario', middleware.ensureAuthorized, horarios.AgregarHorario);

//PUT - Actualizar horario
router.put('/horario/:id', middleware.ensureAuthorized, horarios.actualizarHorario);

//DELETE - Eliminar horario
router.delete('/horario/:id', middleware.ensureAuthorized, horarios.elimininarHorario);

module.exports = router;