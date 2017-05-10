var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Reservacion = mongoose.model('Reservacion');
var Usuario = mongoose.model('Usuario');
var Sala = mongoose.model('Sala');
var Horario = mongoose.model('Horario');
var Sancion = mongoose.model('Sancion');
var middleware = require('../settings/middleware');
var serv = require('../settings/service');
var config = require('../settings/config');


//GET - Listar reservaciones
router.get('/reservaciones', middleware.ensureAuthorized, function(req, res, next) {
    Reservacion.find(function(err, reservacion) {
        if (err) {
            return next(err);
        }
        res.json(reservacion);
    })
    .populate('usuario')
    .populate('sala')
    .populate('dependencia')
    .populate('actividad');
})

//GET - Listar reservaciones por usuario
router.get('/reservaciones/:id', middleware.ensureAuthorized, function(req, res, next) {
    Reservacion.find({ usuario: req.params.id }, function(err, reservacion) {
        if (err) {
            return next(err);
        }

        res.json(reservacion);
    })
    .populate('usuario')
    .populate('sala')
    .populate('dependencia')
    .populate('actividad');
})

//GET - Listar horarios no reservados
router.get('/horarios/disponibles', middleware.ensureAuthorized, function(req, res, next) {
	var search = {
		fecha_reservacion: req.query.date,
		sala: req.query.sala
	};
	var dia = new Date(req.query.date).getDay();
	var horario_v = [];
	var horario_l = [];

    Reservacion.find(search, function(err, reservacion) {
        if (err) {
            res.json({error: false, message: 'Error iterno.', horario: horario_l});
        }

        if (reservacion.length > 0) {
        	horario_v = reservacion[0].sala.horario;
        	horario_l = [];

        	for (var i = 0; i < reservacion.length; i++) { //Recorrer reservaciones
				for (var j = 0; j < reservacion[i].horario.length; j++) { //Recorrer los índices de los horarios reservados        		
        			for (var k = 0; k < horario_v.length; k++) { //Recorrer horarios válidos        			
	        			if (dia == horario_v[k].dia && reservacion[i].horario[j].indice == horario_v[k].indice) {
	        				horario_v[k].estado = false;
	        			}
        			}
        		}
        	}

        	for (var i = 0; i < horario_v.length; i++) {
        		if (horario_v[i].estado == true && dia == horario_v[i].dia) {
        			var horas = {
        				dia: horario_v[i].dia,
						dian: horario_v[i].dian,
						indice: horario_v[i].indice,
						rango_hora: horario_v[i].rango_hora,
						estado: horario_v[i].estado
        			}
        			horario_l.push(horas);
        		}
        	}
        	res.json({error: false, message: 'Horarios disponibles.', horario: horario_l});
        } else {
        	var horario_l = [];
        	Sala.findById(req.query.sala, function(err, sala) {
        		if (err) {
		            res.json({error:true, message:'Oops, Ocurrió un error.', err: err});
		        }

		        if (!sala) {
                    res.json({error: true, message: 'Sala no encontrada.', horario: horario_l});	        		
        		} else {
        			for (var i = 0; i < sala.horario.length; i++) {
                        if (sala.horario[i].estado == true && sala.horario[i].dia == dia) {
                            var horas = {
                                dia: sala.horario[i].dia,
                                dian: sala.horario[i].dian,
                                indice: sala.horario[i].indice,
                                rango_hora: sala.horario[i].rango_hora,
                                estado: sala.horario[i].estado
                            }
                            horario_l.push(horas);
                        }
                    }
                    res.json({error: false, message: 'Horarios disponibles.', horario: horario_l});
        		}
        	});
        }        
    })
    .populate('usuario')
    .populate('sala')
    .populate('dependencia')
    .populate('actividad');
})

//POST - Agregar reservaciones
router.post('/reservacion', middleware.ensureAuthorized, function(req, res, next) {
	
console.log(req.body)


    var mensaje = {};
    var search = {
		fecha_reservacion: req.body.reservacion.requestdata.fecha,
		sala: req.body.reservacion.requestdata.sala,
		horario: {$in: req.body.reservacion.requestdata.horarios}
	};

    Reservacion.find(search, function(err, reservacion) {
        if (err) {
            res.json({error: true, message:"No se pudo guardar "})
        }

        //validar que el usuario puede registrar
        Usuario.findById({_id : req.body.usuario}, function(err, usuario){
            if(err){
                res.json({error : true});
            }
             //Si no le quedan reservaciones
            if (usuario.max_res_pend == 0) {
                res.json({error : true, message : "Llegastes a tu limite de reservaciones, no puedes crear una nueva reservación."});
                return;
            }

        })

        if (reservacion.length > 0) {
        	res.json({error: true, message:'El horario seleccionado no se encuentra disponible.', reservacion: reservacion});
        } else {
        	var reservacion = new Reservacion();

        	reservacion.fecha_reservacion = req.body.reservacion.requestdata.fecha;
        	reservacion.usuario = req.body.usuario;
			reservacion.sala = req.body.reservacion.requestdata.sala;
			reservacion.horario = req.body.reservacion.requestdata.horarios;
			reservacion.dependencia = req.body.reservacion.actividad.dependencia;
			reservacion.cantidad_asistentes = req.body.reservacion.actividad.asistentes;
			reservacion.numero_equipos = req.body.reservacion.actividad.equipos;
			reservacion.actividad = req.body.reservacion.actividad.actividad;
			reservacion.descripcion = req.body.reservacion.actividad.descripcion;

			reservacion.save(function(err, reservacion) {
				if (err) {
					res.json({error: true, message:"No se pudo guardar "})
				}

                Usuario.findById(reservacion.usuario, function(err, usuario) { 
                    usuario.fecha_act_registro = new Date();

                    //Si el usuario le quedan reservaciones por hacer-
                    if (usuario.max_res_pend > 0)  {
                        usuario.max_res_pend--;
                    }

                   

                    //Enviar correo electrónico
                    mensaje.tipo = 'registrarReserva';
                    mensaje.nombre = usuario.nombre_usuario;
                    mensaje.apellido = usuario.apellido_usuario;
                    mensaje.to = '"' + mensaje.nombre + ' ' + mensaje.apellido + '" <' + usuario.correo_usuario + '>';
                    mensaje.asunto = 'Reservación creada, SISGRAE - Cieducar';
                    mensaje.cuerpo = 'Usted ha realizado una reservación en el Sistema de Gestión y Reservación de Ambientes Educativos de Cieducar. <br><br>'
                                    + '<h3>Solicitud préstamo de salas</h3>'
                                    + 'Cartagena ' + usuario.fecha_act_registro + '<br>'
                                    + 'Sres. Cieducar' + '<br><br>'
                                    + 'Yo ' + usuario.nombre_usuario + ' ' + usuario.apellido_usuario + ', solicito el préstamo de un ambiente de aprendizaje <br>'
                                    + 'para realizar la actividad de ' + reservacion.actividad + ', que realizaré el ' + reservacion.fecha_reservacion + ' en el(los) horario(s) de: <br><br>'
                                    + reservacion.horario + '<br><br>'
                                    + 'Descripción<br>'
                                    + reservacion.descripcion + '<br><br>'
                                    + 'He declarado que acepto las condiciones, restricciones y políticas del Cieducar y la Universidad de Cartagena.'

                    serv.enviarMensaje(mensaje);

                    usuario.save(function(err) {
                        if (err) {
                            res.json({error : true, message : "Error actualizando la información del usuario."})
                        }
                    })

                    //Notificar PUSH al cliente
                    serv.sendPush("Reservación realizada con éxito. Le quedan " + usuario.max_res_pend + " reservación(es) pendiente(s).", usuario.pb_token, function (){});
                   // res.json({error:false, message:'Reservación registrada con éxito.', reservacion: reservacion});
                });

		    //	
		    });
        }        
    })
})

//PUT - Actualizar reservaciones
router.put('/reservacion/:id', middleware.ensureAuthorized, function(req, res) {

console.log('reservacion/:id');

    var mensaje = {};

    Reservacion.findById(req.params.id, function(err, reservacion) {
        reservacion.fecha_reservacion = req.body.reservacion.requestdata.fecha;
    	reservacion.usuario = req.body.usuario;
		reservacion.sala = req.body.reservacion.requestdata.sala;
		reservacion.horario = req.body.reservacion.requestdata.horarios;
		reservacion.dependencia = req.body.reservacion.actividad.dependencia;
		reservacion.cantidad_asistentes = req.body.reservacion.actividad.asistentes;
		reservacion.numero_equipos = req.body.reservacion.actividad.equipos;
		reservacion.actividad = req.body.reservacion.actividad.actividad;
		reservacion.descripcion = req.body.reservacion.actividad.descripcion;
		reservacion.estado = req.body.reservacion.actividad.estado;
		reservacion.fecha_act_registro = new Date();

        reservacion.save(function(err) {
            if (err) {
                res.json({error: true, message:"Error interno. No se pudieron actualizar los datos de usuario."});
            }
            
            res.json({error: false, message: 'La reservación se ha actualizado.', reservacion: reservacion});
        });
    })
})

//PUT - Actualizar estado
router.put('/reservacion/:id/estado', middleware.ensureAuthorized, function(req, res, next) {

    console.log('/reservacion/:id/estado');

    var mensaje = {};

    Reservacion.findById(req.params.id, function(err, reservacion) {
        reservacion.estado = req.body.estado;
        reservacion.entregable = req.body.entregable;
        reservacion.observacion = req.body.observacion;
        reservacion.fecha_act_registro = new Date();

        reservacion.save(function(err) {
            if (err) {
                res.json({err:true, message: "Error interno. No se pudo actualizar el estado"});
            }

            //Si la reservación es incunplida
            if (reservacion.estado == 'Incumplida') {
                Usuario.findById(reservacion.usuario, function(err, usuario) { 
                    usuario.fecha_act_registro = new Date();

                    if (usuario.max_reservaciones > 0)  {
                        usuario.max_reservaciones--;
                        usuario.max_res_pend--;
                    }

                    usuario.save(function(err) {
                        if (err) {
                            res.json({error: true, message:"Error interno. No se pudieron actualizar los datos de usuario."});
                        }
                    })

                    var sancion = new Sancion();
                    sancion.administrador = req.body.administrador;
                    sancion.sancionado = usuario._id;
                    sancion.asunto = 'Incumplimiento de la regla número 22.';
                    sancion.descripcion = 'Es obligación del responsable o solicitante asistir a las reservaciones realizadas.'
                    
                    sancion.save(function(err) {
                        if (err) {
                            res.json({error: true, message:"Error interno. No se pudo generar sanción al usuario."});
                        }

                        mensaje.tipo = 'registrarSancion';
                        mensaje.nombre = usuario.nombre_usuario;
                        mensaje.apellido = usuario.apellido_usuario;
                        mensaje.to = '"' + mensaje.nombre + ' ' + mensaje.apellido + '" <' + usuario.correo_usuario + '>';
                        mensaje.asunto = sancion.asunto;
                        mensaje.cuerpo = 'Usted ha sido sancionado por el Sistema de Gestión y Reservación de Ambientes Educativos de Cieducar. <br><br>'
                                        + '<b>Motivo:<b> ' + mensaje.asunto + '<br>'
                                        + '<b>Descripción: </b>' + sancion.descripcion + '<br><br>';

                        if (usuario.max_reservaciones == 0) {
                            mensaje.cuerpo += 'De ahora en adelante no podrá realizar reservaciones durante 15 días hábiles y deberá <br>estar al día con los entregables.';
                            //Notificar PUSH al cliente
                            serv.sendPush("Usted ha sido sancionado durante 15 días hábiles. Revisar las políticas del Cieducar.", req.client.pushToken, function(){});
                        } else {
                            mensaje.cuerpo += 'De ahora en adelante solo podrá realizar máximo ' + usuario.max_reservaciones + ' reservación(es).';
                            //Notificar PUSH al cliente
                            serv.sendPush("Solo podrá realizar máximo " + usuario.max_reservaciones + " reservación(es).", req.client.pushToken,  function(){});
                        }

                        serv.enviarMensaje(mensaje);
                    })
                });
            } else if (reservacion.estado == 'Cumplida' || reservacion.estado == 'Cancelada') {
                Usuario.findById(reservacion.usuario, function(err, usuario) { 
                    usuario.fecha_act_registro = new Date();

                    if (usuario.max_reservaciones < usuario.reservas)  {
                        usuario.max_res_pend++;
                    }

                    //Noticación PUSH al cliente
                    serv.sendPush("Le quedan " + usuario.max_res_pend + " reservación(es) pendiente(s).", usuario.pb_token, function (){});
                   
                    usuario.save(function(err) {
                        if (err) {
                            res.json({error: true, message:"Error interno. No se pudieron actualizar los datos de usuario."})
                        }
                    })
                });
            }

            res.json({error: false, message: 'La reservación se ha actualizado.', reservacion: reservacion});
        });
    })
})

//DELETE - Eliminar reservación
router.delete('/reservacion/:id', middleware.ensureAuthorized, function(req, res){
    Reservacion.findByIdAndRemove(req.params.id, function(err){
        if (err) {
            res.json({error: true, message:"No se puede eliminar la resevación"})
        }
        
        res.json({message: 'La reservación se ha eliminado.'});
    })
})

module.exports = router;