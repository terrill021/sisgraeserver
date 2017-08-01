var mongoose = require('mongoose');
var Sancion = mongoose.model('Sancion');
var Usuario = mongoose.model('Usuario');
var serv = require('../settings/service');

exports.obtenerSanciones = function(req, res, next) {
    Sancion.find(function(err, sancion) {
        if (err) {
        	return next(err);
        }

        res.json(sancion);
    })
    .populate('administrador')
    .populate('sancionado');
}

exports.obtenerSancionesPorUsuario = function(req, res, next) {
    Sancion.find({ sancionado: req.params.id }, function(err, sancion) {
        if (err) {
            return next(err);
        }

        res.json(sancion);
    })
    .populate('administrador')
    .populate('sancionado');
}

exports.agregarSancion = function(req, res, next) {

    console.log("exports.agregarSancion")

    var sancion = new Sancion(req.body);
    var mensaje = {};

    //Guardar la sanción
    sancion.save(function(err, sancion) {
		if (err) {
			return res.json({error: true, message: "Error al registrar la sanción."});
		}

        //Buscar al usuario para sancionarlo
        Usuario.findById(req.body.sancionado, function(err, usuario) {

            usuario.fecha_act_registro = new Date();

            if (usuario.max_reservaciones > 0)  {
                //Restar una reservación
                usuario.max_reservaciones--;
            }

            //Guardar usuario.
            usuario.save(function(err) {
                if (err) {
                    res.json({error: true, message:"Error registrando sanción a usuario."});
                }

                //Notificar por correo
                mensaje.tipo = 'registrarSancion';
                mensaje.nombre = usuario.nombre_usuario;
                mensaje.apellido = usuario.apellido_usuario;
                mensaje.to = '"' + mensaje.nombre + ' ' + mensaje.apellido + '" <' + usuario.correo_usuario + '>';
                mensaje.asunto = sancion.asunto;
                mensaje.cuerpo = 'Usted ha sido sancionado por el Sistema de Gestión y Reservación de Ambientes Educativos de Cieducar. <br><br>'
                                + '<b>Motivo:</b> ' + mensaje.asunto + '<br>'
                                + '<b>Descripción: </b>' + sancion.descripcion + '<br><br>';

                if (usuario.max_reservaciones == 0) {
                    mensaje.cuerpo += 'De ahora en adelante no podrá realizar reservaciones durante 15 días hábiles y deberá <br>estar al día con los entregables.';
                    //Notificar PUSH al cliente
                    serv.sendPush("Usted ha sido sancionado durante 15 días hábiles. Revisar las políticas del Cieducar.", req.client.pushToken, () => {});
                } else {
                    mensaje.cuerpo += 'De ahora en adelante solo podrá realizar máximo ' + usuario.max_reservaciones + ' reservación(es).';
                    //Notificar PUSH al cliente
                    serv.sendPush("Solo podrá realizar máximo " + usuario.max_reservaciones + " reservación(es).", req.client.pushToken, () => {});
                }

                serv.enviarMensaje(mensaje);
            });
        });

    	res.json({ error: false, message: 'Se ha registrado una sanción.', sancion: sancion });
    });
}

exports.actualizarSancion = function(req, res) {
    Sancion.findById(req.params.id, function(err, sancion) {
	    var sancion = new Sancion(req.body);

        sancion.save(function(err) {
            if (err) {
            	res.send(err);
            }
            
            res.json(sancion);
        });
    })
}

exports.eliminarSancion = function(req, res){
    Sancion.findByIdAndRemove(req.params.id, function(err) {
        if (err) {
        	res.send(err)
        }
        
        res.json({message: 'La sancion se ha eliminado.'});
    })
}