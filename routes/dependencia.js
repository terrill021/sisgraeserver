var express = require('express');
var router = express.Router();
var middleware = require('../settings/middleware');
var dependencias = require('../controllers/dependencia');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

//GET - Listar dependencia
router.get('/dependencias', dependencias.obtenerDependencias);

//POST - Agregar dependencia
router.post('/dependencia', dependencias.agregarDependencia);

//PUT - Actualizar dependencia
router.put('/dependencia/:id', middleware.ensureAuthorized, dependencias.actualizarDependencia);

//DELETE - Eliminar dependencia
router.delete('/dependencia/:id', middleware.ensureAuthorized, dependencias.eliminarDependencia);

module.exports = router;