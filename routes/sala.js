var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Sala = mongoose.model('Sala');
var middleware = require('../settings/middleware');
var config = require('../settings/config');

/* GET salas listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

//GET - Listar salas
router.get('/salas', middleware.ensureAuthorized, function(req, res, next) {
    Sala.find(function(err, sala) {
        if (err) {
            return next(err);
        }

        res.json(sala);
    })
    .populate('actividad');
})

//GET - Listar salas por actividad, equipos y asistentes
router.get('/salas/q', middleware.ensureAuthorized, function(req, res, next) {
    var activity = JSON.parse(req.query.actividad);
    if (req.query.capacidad < req.query.equipos) {
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
})

//POST - Agregar salas
router.post('/sala', middleware.ensureAuthorized, function(req, res, next) {
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
})

//PUT - Actualizar salas
router.put('/sala/:id', middleware.ensureAuthorized, function(req, res) {
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
                res.send(err);
            }
            
            res.json(sala);
        });
    })
})

//DELETE - Eliminar sala
router.delete('/sala/:id', middleware.ensureAuthorized, function(req, res){
    Sala.findByIdAndRemove(req.params.id, function(err){
        if (err) {
            res.send(err)
        }
        
        res.json({message: 'La sala se ha eliminado.'});
    })
})

module.exports = router;