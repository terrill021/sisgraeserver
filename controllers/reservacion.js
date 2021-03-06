var mongoose = require('mongoose');
var Reservacion = mongoose.model('Reservacion');
var Usuario = mongoose.model('Usuario');
var Sala = mongoose.model('Sala');
var Horario = mongoose.model('Horario');
var Sancion = mongoose.model('Sancion');
var serv = require('../settings/service');
var config = require('../settings/config');

exports.obtenerReservaciones = function(req, res, next) {
    Reservacion.find({}, null, {sort: {fecha_reservacion: -1}}, function(err, reservacion) {
        if (err) {
            res.json({error : true, message : "No se pudieron recuperar las reservaciones."});
        }
        res.json(reservacion);
    })
    .populate('usuario')
    .populate('sala')
    .populate('dependencia')
    .populate('actividad');
}

exports.obtenerReservacionesUsuario = function(req, res, next) {


    Reservacion.find({usuario : req.params.id}, function(err, reservacion) {
        if (err) {
            res.json({error : true, message : "No se pudieron recuperar las reservaciones."});
        }
        res.json(reservacion);
    })
    .populate('usuario')
    .populate('sala')
    .populate('dependencia')
    .populate('actividad');
}

exports.obtenerHorariosDisponibles = function(req, res, next) {
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

        else if (reservacion.length > 0) {
        	horario_v = reservacion[0].sala.horario;
        	horario_l = [];

        	for (var i = 0; i < reservacion.length; i++) { //Recorrer reservaciones
				if (reservacion[i].estado == "Cancelada") {
                    continue;
                }
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
}


exports.agregarReservacion = function (req, res, next) {
	
        var usuario;

		Usuario.findById({_id : req.body.usuario}, function(err, usuarioFound) {
	        if(err){
	            res.json({error : true, message : "Error buscando usuario."});
	        }else{
                usuario = usuarioFound;
                //si el usuario existe
                if(usuario){
                    //Si no le quedan reservaciones        
                    if (usuario.max_res_pend >= usuario.max_reservaciones) {
                        res.json({error : true, message : "Has alcanzado el numero máximo de reservaciones que puedes realizar."})
                    }
                    // Si le quedan reservaciones
                    else {
                        //
                        var mensaje = {};
                        var search = {
                            fecha_reservacion: req.body.reservacion.requestdata.fecha,
                            sala: req.body.reservacion.requestdata.sala,
                            horario: {$in: req.body.reservacion.requestdata.horarios}
                        };

                        // Buscar reservaciones con horarios iguales
                        Reservacion.find(search, function(err, reservacion) {

                            if(err){
                                res.json({error : true, message : "Error buscando reservaciones."});
                            }
                            //Validar que no haya bloque de horarios
                            else if (reservacion && reservacion.length > 0) {
                                res.json({error: true, message:'El horario seleccionado no se encuentra disponible.', reservacion: reservacion});
                            }
                            // Guardar la reservacion
                            else {
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

                                    if(err){
                                        res.json({error : true, message : "Error guardando reservación."});
                                    }
                                    // Notificar al usuario

                                    usuario.fecha_act_registro = new Date();

                                    //Aumentar el numero de reservaciones activas
                                    usuario.max_res_pend++;
                                 
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

                                    // Enviar correo electronico                
                                    serv.enviarMensaje(mensaje);

                                    //Notificar PUSH al usuario
                                    serv.sendPush("Reservación realizada con éxito. Le quedan " + usuario.max_res_pend + " reservación(es) pendiente(s).", usuario.pb_token, function (){});

                                    usuario.save(function(err) {
                                        if (err) {
                                            res.json({error : true, message : "Error actualizando la información del usuario."});
                                        }
                                    })

                                    // REsponder a la peticion
                                    res.json({error : false, message:"Reservación registrada con exito"});


                                })
                            }                            
                        });
                    }
                } //si no existe el usuario
                else {
                    // REsponder a la peticion
                    res.json({error : false, message:"Usuario no encontradO"});
                }
            }
    });   
}


exports.actualizarReservacion = function(req, res) {

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
}

exports.actualizarEstado = function(req, res, next) {

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
            
                    //Se le quita una reservacion
                    if (usuario.max_reservaciones > 0) {
                        usuario.max_reservaciones--;    
                    }
                    
                    //Se le resta una reservación activa
                    if (usuario.max_res_pend > 0) {
                        usuario.max_res_pend --;
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
            } else if (reservacion.estado == 'Realizada' || reservacion.estado == 'Cancelada') {
                
                Usuario.findById(reservacion.usuario, function(err, usuario) { 
                    usuario.fecha_act_registro = new Date();
                   
                    //Se le cancela para que pueda hacer otra
                    if (usuario.max_res_pend > 0) {
                        usuario.max_res_pend --;
                    }                  
                    if(reservacion.estado == 'Cancelada'){
                        
                        //enviar correo si cancela
                        mensaje.tipo = 'NotificarCancelación';
                        mensaje.nombre = usuario.nombre_usuario;
                        mensaje.apellido = usuario.apellido_usuario;
                        mensaje.to = '"' + mensaje.nombre + ' ' + mensaje.apellido + '" <' + usuario.correo_usuario + '>';
                        mensaje.asunto = "Cancelación de reserva en SISGRAE";
                        mensaje.cuerpo = 'Su reservación en el sistema de gestión y administración de ambientes educativos de CIeducar (SISGRAE) ha sido cancelada. Consulte la aplicación para verificar el estado de sus reservaciones. <br><br>'
                            + '<b>Motivo:<b> ' + mensaje.asunto + '<br>'
                            + '<b>Descripción: </b>' + "Te invitamos a usar responsablemente nuestros servicios, para que asi todos podamos tener acceso oportuno a ellos. Si tienes dudas puedes consultar nuestro reglamento desde SISGRAE" + '<br><br>';

                        //Notificar correo electronico 
                        serv.enviarMensaje(mensaje);
                    }   
                    //Noticación PUSH al cliente
                    serv.sendPush("Le quedan " + usuario.max_res_pend + " reservación(es) disponibles(s).", usuario.pb_token, function (){});
                   
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
}

exports.eliminarReservacion =  function(req, res){
    Reservacion.findByIdAndRemove(req.params.id, function(err){
        if (err) {
            res.json({error: true, message:"No se puede eliminar la resevación"})
        }
        
        res.json({message: 'La reservación se ha eliminado.'});
    })
}; 