var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Sancion = mongoose.model('Sancion');
var Usuario = mongoose.model('Usuario');
var middleware = require('../settings/middleware');
var serv = require('../settings/service');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

//GET - Listar sanciones
router.get('/sanciones', middleware.ensureAuthorized, function(req, res, next) {
    Sancion.find(function(err, sancion) {
        if (err) {
        	return next(err);
        }

        res.json(sancion);
    })
    .populate('administrador')
    .populate('sancionado');
})

//GET - Listar sanciones por usuario
router.get('/sanciones/usuario/:id', middleware.ensureAuthorized, function(req, res, next) {
    Sancion.find({ sancionado: req.params.id }, function(err, sancion) {
        if (err) {
            return next(err);
        }

        res.json(sancion);
    })
    .populate('administrador')
    .populate('sancionado');
})

//POST - Agregar sanción
router.post('/sancion', middleware.ensureAuthorized, function(req, res, next) {
    var sancion = new Sancion(req.body);
    var mensaje = {};

    sancion.save(function(err, sancion) {
		if (err) {
			return next(err);
		}

        Usuario.findById(req.body.sancionado, function(err, usuario) {
            console.log(req.body);
            usuario.fecha_act_registro = new Date();

            if (usuario.max_reservaciones > 0)  {
                usuario.max_reservaciones--;
                usuario.max_res_pend--;
            }

            usuario.save(function(err) {
                if (err) {
                    res.send(err);
                }

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
                    serv.sendPush("Usted ha sido sancionado durante 15 días hábiles. Revisar las políticas del Cieducar.", req.client.pushToken, callback);
                } else {
                    mensaje.cuerpo += 'De ahora en adelante solo podrá realizar máximo ' + usuario.max_reservaciones + ' reservación(es).';
                    //Notificar PUSH al cliente
                    serv.sendPush("Solo podrá realizar máximo " + usuario.max_reservaciones + " reservación(es).", req.client.pushToken, callback);
                }

                serv.enviarMensaje(mensaje);
            });
        });

    	res.json({ error: false, message: 'Se ha registrado una sanción.', sancion: sancion });
    });
})

//PUT - Actualizar sanción
router.put('/sancion/:id', middleware.ensureAuthorized, function(req, res) {
    Sancion.findById(req.params.id, function(err, sancion) {
	    var sancion = new Sancion(req.body);

        sancion.save(function(err) {
            if (err) {
            	res.send(err);
            }
            
            res.json(sancion);
        });
    })
})

//DELETE - Eliminar sanción
router.delete('/sancion/:id', middleware.ensureAuthorized, function(req, res){
    Sancion.findByIdAndRemove(req.params.id, function(err) {
        if (err) {
        	res.send(err)
        }
        
        res.json({message: 'La sancion se ha eliminado.'});
    })
})

module.exports = router;