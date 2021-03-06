var mongoose = require('mongoose');
var Usuario = mongoose.model('Usuario');
var serv = require('../settings/service');
var config = require('../settings/config');


exports.obtenerUsuarios = function(req, res, next) {
    Usuario.find(function(err, usuario) {
        if (err) {
            return next(err);
        }
        res.json(usuario);
    });
}

exports.agregarUsuario = function(req, res, next) {

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
                                + 'con ello acepta las condiciones, restricciones y políticas del Cieducar y la Universidad de Cartagena.<br>'
                                + '<h3>Datos de ingreso</h3>'
                                + '<b>Usuario: </b>' + user.correo_usuario + '<br>' 
                                + '<b>Contraseña: </b>' + req.body.clave_usuario + '<br><br>'
                                + 'Por su seguridad le recomendamos cambiar la contraseña,',
                                + 'recuerde que su usuario también puede ser el<br> documento de identidad registrado.';
                serv.enviarMensaje(mensaje);

                res.send({error: false, message:'Usuario registrado con éxito.'});
            });
        } else {
            res.send({error: true, message:'Usuario registrado anteriormente.'});
        }
    });
}

exports.actualizarUsuario = function(req, res) {
    
    Usuario.findById(req.params.id, function(err, usuario) {
        usuario.cc_usuario = req.body.cc_usuario;
        usuario.nombre_usuario = req.body.nombre_usuario;
        usuario.apellido_usuario = req.body.apellido_usuario;
        usuario.correo_usuario = req.body.correo_usuario;
        usuario.tel_usuario = req.body.tel_usuario;
        usuario.dependencia = req.body.dependencia;
        usuario.dir_usuario = req.body.dir_usuario;
        usuario.tipo = req.body.tipo;
        usuario.estado = req.body.estado;
        usuario.max_reservaciones = req.body.max_reservaciones;
        //usuario.pb_token = req.body.pb_token;

        usuario.save(function(err) {
            if (err) {
                res.send(err);
            }
            
            res.json({error: false, message: 'Usuario actualizado con éxito.', usuario: usuario});
        });
    })
}

exports.cambiarContrasena = function(req, res) {
    Usuario.findById(req.params.id, function(err, usuario) {
        var claveEncriptada = serv.encriptar(usuario.correo_usuario, req.body.clave_anterior);
        
        if (usuario.clave_usuario === clave_anterior) {
            usuario.clave_usuario = serv.encriptar(usuario.correo_usuario, req.body.clave_nueva);

            usuario.save(function(err) {
                if (err) {
                    res.send(err);
                }
                
                res.json({error: false, message: 'La contraseña ha sido cambiada con éxito.'});
            });
        } else {
            res.send({error: true, message: 'La contraseña no es correcta.'});
        }
    })
}

exports.eliminarUsuario = function(req, res){
    Usuario.findByIdAndRemove(req.params.id, function(err){
        if (err) {
            res.send(err)
        }
        
        res.json({message: 'El usuario se ha eliminado.'});
    })
}