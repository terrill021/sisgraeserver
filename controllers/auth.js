var mongoose = require('mongoose');
var Usuario = mongoose.model('Usuario');
var serv = require('../settings/service');



exports.registrarUsuario = function(req, res) {

    var params = {
        $or: [{cc_usuario: req.body.cc_usuario}, 
            {correo_usuario: req.body.correo_usuario}
        ]
    };
    var mensaje = {};

    Usuario.findOne(params, function(err, user) {
        if (err) {
            res.json({error:true, message:'Oops, Ocurrió un error.'});
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
                    res.json({error:true, message:'Ocurrió un error. No se pudo crear el usuario.'});    
                }

                mensaje.tipo = 'registrarUsuario';
                mensaje.nombre = user.nombre_usuario;
                mensaje.apellido = user.apellido_usuario;
                mensaje.to = '"' + mensaje.nombre + ' ' + mensaje.apellido + '" <' + user.correo_usuario + '>';
                mensaje.asunto = 'Registro de usuario';
                mensaje.cuerpo = 'Usted ha sido registrado en el Sistema de Gestión y Reservación de Ambientes Educativos, <br>'
                                + 'con ello acepta las condiciones, restricciones y políticas del CIeducar y la Universidad de Cartagena.<br>'
                                + '<h3>Datos de ingreso</h3>'
                                + '<b>Usuario: </b>' + user.correo_usuario + '<br>' 
                                + '<b>Contraseña: </b>' + req.body.clave_usuario + '<br><br>'
                                + 'Por su seguridad le recomendamos cambiar la contraseña, recuerde que su usuario también puede ser el<br> documento de identidad registrado.';
                serv.enviarMensaje(mensaje);

                res.json({error: false, message:'Usuario registrado con éxito.'});
            });
        } else {
            res.json({error: true, message:'Usuario registrado anteriormente.'});
        }
    });
}

exports.iniciarSesion = function(req, res, next) {

    console.log("iniciar sesion")
    if (!serv.validarMail(req.body.cc_usuario)) {
        var search = { cc_usuario: req.body.cc_usuario };
    } else {
        console.log("es correo")
        var search = { correo_usuario: req.body.cc_usuario };
    }
    
    // find the user
    Usuario.findOne(search, function(err, user) {
        if (err) {
            res.json({error:true, message:'Oops, Ocurrió un error.'});
        }
        
        if (!user) {
            console.log("no existe")
            res.json({error:true, message:'Usuario no encontrado.'});
        } else if (user) {
                        console.log(" existe")

            //Validar que usuario tenga estado activo
            if (user.estado == false) {
                res.json({ error: true, message: 'Este usuario está deshabilitado, comuníquese con el administrador del sistema.'});
            } else {
                var contEncriptada = serv.encriptar(user.correo_usuario, req.body.clave_usuario);
            
                //comprobar password
                if (user.clave_usuario === contEncriptada) {
                    // Si es correcta generamos el token
                    user.pb_token = req.body.pb_token;
                    user.save(function(err) {
                        if (err) {
                            res.json({error:true, message:'Ocurrió un error.', err: err});    
                        }
                    });

                    var token = serv.crearToken(user);

                    res.json({ error: false, message:'Autenticación exitosa.', token: token, usuario: user });
                } else {                
                    res.json({error: true, message: 'La contraseña no es correcta.'});
                }
            }
        }
    });
}

exports.recuperarClave = function(req, res, next) {
    var filtro = {
        cc_usuario: req.body.cc_usuario,
        correo_usuario: req.body.correo_usuario
    };
    var mensaje = {};

    Usuario.findOne(filtro, function(err, user) {
        if (err) {
            res.localhost({error:true, message:'Oops, Ocurrió un error.'});
        }

        if (!user) {
            res.json({error: true, message: 'Usuario no está registrado.'});
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
                            + 'El enlace lo dirige a la página de restablecimiento de cuentas CIeducar.';
            serv.enviarMensaje(mensaje);
            res.json({error: false, message: 'Se ha enviado el enlace al correo electrónico con los instrucciones para recuperar la contraseña.'})
        }
    });
}

exports.restablecerContrasena = function(req, res) {
    Usuario.findById(req.params.id, function(err, usuario) {
        if (err) {
            res.json({error:true, message:'Oops, Ocurrió un error.'});
        }

        if (!usuario) {
            res.json({error: true, message: 'Usuario no está registrado.'});
        } else {
            usuario.clave_usuario = serv.encriptar(usuario.correo_usuario, req.body.clave_usuario);

            usuario.save(function(err) {
                if (err) {
                    res.json({error: true, message: "No se pudo restablecer contraseña"});
                }
                
                res.json({error: false, message: 'La contraseña ha sido cambiada con éxito.'});
            });
        }
    })
}