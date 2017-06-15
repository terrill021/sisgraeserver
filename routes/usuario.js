var express = require('express');
var router = express.Router();
var middleware = require('../settings/middleware');
var usuarios = require('../controllers/usuario');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

//GET - Listar usuarios
router.get('/usuarios', middleware.ensureAuthorized, usuarios.obtenerUsuarios);

//POST - Agregar usuarios
router.post('/usuario', middleware.ensureAuthorized, usuarios.agregarUsuario);

//PUT - Actualizar usuarios
router.put('/usuario/:id', middleware.ensureAuthorized, usuarios.actualizarUsuario);

//PUT - Cambiar contraseña
router.put('/usuario/:id/cambiar_clave', middleware.ensureAuthorized, usuarios.cambiarContrasena);

//DELETE - Eliminar usuario
router.delete('/usuario/:id', middleware.ensureAuthorized, usuarios.eliminarUsuario);

module.exports = router;