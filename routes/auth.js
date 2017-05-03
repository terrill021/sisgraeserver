var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Usuario = mongoose.model('Usuario');
var Sancion = mongoose.model('Sancion');
var serv = require('../settings/service');
var middleware = require('../settings/middleware');

router.post('/registrar', function(req, res) {
    var params = {
        $or: [{cc_usuario: req.body.cc_usuario}, 
            {correo_usuario: req.body.correo_usuario}
        ]
    };
    var mensaje = {};

    Usuario.findOne(params, function(err, user) {
        if (err) {
            res.send({error:true, message:'Oops, Ocurrió un error.'});
        }

        if (!user) {
            var user = new Usuario();

            user.tipo = req.body.tipo;
            user.cc_usuario = req.body.cc_usuario;
            user.nombre_usuario = req.body.nombre_usuario;
            user.apellido_usuario = req.body.apellido_usuario;
            user.correo_usuario = req.body.correo_usuario;            
            user.tel_usuario = req.body.tel_usuario;
            user.dependencia = req.body.dependencia;
            user.dir_usuario = req.body.dir_usuario;
            user.clave_usuario = serv.encriptar(req.body.correo_usuario, req.body.clave_usuario);
            //user.pb_token = req.body.pb_token;

            user.save(function(err) {
                if (err) {
                    res.send({error:true, message:'Ocurrió un error.'});    
                }

                mensaje.tipo = 'registrarUsuario';
                mensaje.nombre = user.nombre_usuario;
                mensaje.apellido = user.apellido_usuario;
                mensaje.to = '"' + mensaje.nombre + ' ' + mensaje.apellido + '" <' + user.correo_usuario + '>';
                mensaje.asunto = 'Registro de usuario';
                mensaje.cuerpo = 'Usted ha sido registrado en el Sistema de Gestión y Reservación de Ambientes Educativos, <br>'
                                + 'con ello acepta las condiciones, restricciones y políticas del CIeduca y la Universidad de Cartagena.<br>'
                                + '<h3>Datos de ingreso</h3>'
                                + '<b>Usuario: </b>' + user.correo_usuario + '<br>' 
                                + '<b>Contraseña: </b>' + req.body.clave_usuario + '<br><br>'
                                + 'Por su seguridad le recomendamos cambiar la contraseña, recuerde que su usuario también puede ser el<br> documento de identidad registrado.';
                serv.enviarMensaje(mensaje);

                res.send({error: false, message:'Usuario registrado con éxito.'});
            });
        } else {
            res.send({error: true, message:'Usuario registrado anteriormente.'});
        }
    });
});

router.post('/login', function(req, res, next) {
    if (!serv.validarMail(req.body.cc_usuario)) {
        var search = { cc_usuario: req.body.cc_usuario };
    } else {
        var search = { correo_usuario: req.body.cc_usuario };
    }
    
    // find the user
    Usuario.findOne(search, function(err, user) {
        if (err) {
            res.send({error:true, message:'Oops, Ocurrió un error.'});
        }
        
        if (!user) {
            res.send({error:true, message:'Usuario no encontrado.'});
        } else if (user) {
            if (user.estado == false) {
                res.send({ error: true, message: 'Este usuario está deshabilitado, comuníquese con el administrador del sistema.'});
            } else {
                var contEncriptada = serv.encriptar(user.correo_usuario, req.body.clave_usuario);
            
                //comprobar password
                if (user.clave_usuario === contEncriptada) {
                    // Si es correcta generamos el token
                    user.pb_token = req.body.pb_token;
                    user.save(function(err) {
                        if (err) {
                            res.send({error:true, message:'Ocurrió un error.', err: err});    
                        }
                    });

                    var token = serv.crearToken(user);

                    res.send({ error: false, message:'Autenticación exitosa.', token: token, usuario: user });
                } else {                
                    res.send({error: true, message: 'La contraseña no es correcta.'});
                }
            }
        }
    });
});

router.post('/logout', function(req, res, next) {
    serv.invalidarToken(req, res);
});

//Enviar correo para restablecer contraseña
router.post('/recuperar-clave', function(req, res, next) {
    var filtro = {
        cc_usuario: req.body.cc_usuario,
        correo_usuario: req.body.correo_usuario
    };
    var mensaje = {};

    Usuario.findOne(filtro, function(err, user) {
        if (err) {
            res.send({error:true, message:'Oops, Ocurrió un error.'});
        }

        if (!user) {
            res.send({error: true, message: 'Usuario no está registrado.'});
        } else if (user) {            
            var token = serv.passwordToken(user);
            mensaje.tipo = 'recuperarPass';
            mensaje.nombre = user.nombre_usuario;
            mensaje.apellido = user.apellido_usuario;
            mensaje.to = '"' + mensaje.nombre + ' ' + mensaje.apellido + '" <' + user.correo_usuario + '>';
            mensaje.asunto = 'Restablecer contraseña';
            mensaje.cuerpo = 'El equipo de soporte ha recibido una solictud para cambiar tu contraseña.<br>'
                            + 'Puedes restablecer tu contraseña haciendo clic en el siguiente enlace: <br><br>'
                            + '<a href="http://190.242.62.252/sisgrae/#/cambiarclave/usuario/' + user._id + '/reset_token/'
                            + token + '" target="_blank">Cambiar mi contraseña</a><br><br>'
                                + 'En caso de que usted no haya hecho la solicitud de cambio de contraseña, ignore este mensaje.<br><br>'
                            + 'Este enlace caduca minutos después de la hora de envío.<br>'
                            + 'El enlace lo dirige a la página de restablecimiento de cuentas CIeduca.';
            serv.enviarMensaje(mensaje);
            res.json({error: false, message: 'Se ha enviado el enlace al correo electrónico con los instrucciones para recuperar la contraseña.'})
        }
    });
});

//PUT - Restablecer contraseña
router.put('/usuario/:id/reset_token/:token', middleware.validatePassToken, function(req, res) {
    Usuario.findById(req.params.id, function(err, usuario) {
        if (err) {
            res.send({error:true, message:'Oops, Ocurrió un error.'});
        }

        if (!usuario) {
            res.send({error: true, message: 'Usuario no está registrado.'});
        } else {
            usuario.clave_usuario = serv.encriptar(usuario.correo_usuario, req.body.clave_usuario);

            usuario.save(function(err) {
                if (err) {
                    res.send(err);
                }
                
                res.json({error: false, message: 'La contraseña ha sido cambiada con éxito.'});
            });
        }
    })
})

module.exports = router;