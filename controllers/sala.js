var mongoose = require('mongoose');
var Sala = mongoose.model('Sala');
var config = require('../settings/config');


exports.obtenerSalas = function(req, res, next) {
    Sala.find(function(err, sala) {
        if (err) {
            return next(err);
        }

        res.json(sala);
    })
    .populate('actividad');
};

exports.obtenerSalasPorPropiedades = function(req, res, next) {
    var activity = JSON.parse(req.query.actividad);

    if (parseInt(req.query.capacidad) < parseInt(req.query.equipos)) {


        res.send({ 
            error: true, 
            message:'El número de equipos no puede ser superior al número de personas que asisten al evento.' 
        });
    } else {
        var search = {
            actividad: {$in: [activity._id]}, //Alternativa actividad: req.query.actividad
            num_pcs: {$gte: req.query.equipos}, 
            capacidad: { $gte: req.query.capacidad },
            estado: 'true'
        };
        
        Sala.find(search, function(err, sala) {
            if (err) {
                return next(err);
            }

            if (sala.length > 0) {
                res.json(sala);
            } else {
                res.json({error: true, message: 'No existen salas con esas propiedades.', sala: sala});
            }
        })
        .populate('actividad');
    }
}

exports.agregarSala = function(req, res, next) {
    Sala.findOne({num_sala: req.body.sala.num_sala}, function(err, sala) {
        if (err) {
            res.send({error:true, message:'Oops, Ocurrió un error.', err: err});
        }

        if (!sala) {
            sala = new Sala(req.body.sala);
            sala.horario = config.horario;

            sala.save(function(err) {
                if (err) {
                    res.send({error:true, message:'Ocurrió un error.', err: err});    
                }

                res.send({error:false, message:'Sala registrada con éxito.'});
            });
        } else {
            res.send({error:true, message:'Sala registrada anteriormente.'});
        }
    })
}

exports.actualizarSala = function(req, res) {
    Sala.findById(req.params.id, function(err, sala) {
        sala.num_sala = req.body.sala.num_sala;
        sala.nombre_sala = req.body.sala.nombre_sala;
        sala.planta = req.body.sala.planta;
        sala.especificaciones = req.body.sala.especificaciones;
        sala.capacidad = req.body.sala.capacidad;
        sala.num_pcs = req.body.sala.num_pcs;
        sala.actividad = req.body.sala.actividad;
        sala.estado = req.body.sala.estado;
        sala.horario = req.body.sala.horario;

        sala.save(function(err) {
            if (err) {
                res.json({error : true, message : "Error al intentar modificar la sala."});
            }
            
            res.json({error : false, message : "Sala modificada.", sala : sala});
        });
    })
}

exports.eliminarSala = function(req, res){
    Sala.findByIdAndRemove(req.params.id, function(err){
        if (err) {
            res.send(err)
        }
        
        res.json({message: 'La sala se ha eliminado.'});
    })
}