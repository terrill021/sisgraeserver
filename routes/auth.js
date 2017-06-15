var express = require('express');
var router = express.Router();

var serv = require('../settings/service');
var middleware = require('../settings/middleware');
var auth = require('../controllers/auth.js');

router.post('/registrar', auth.registrarUsuario);

router.post('/login', auth.iniciarSesion);

router.post('/logout', function(req, res, next) {
    serv.invalidarToken(req, res);
});

//Enviar correo para restablecer contraseña
router.post('/recuperar-clave', auth.recuperarClave);

//PUT - Restablecer contraseña
router.put('/usuario/:id/reset_token/:token', middleware.validatePassToken, auth.restablecerContrasena);

module.exports = router;