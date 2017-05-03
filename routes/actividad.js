var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Actividad = mongoose.model('Actividad');
var middleware = require('../settings/middleware');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

//GET - Listar actividades
router.get('/actividades', middleware.ensureAuthorized, function(req, res, next) {
    Actividad.find(function(err, actividad) {
        if (err) {
        	return next(err);
        }

        res.json(actividad);
    });
})

//POST - Agregar actividad
router.post('/actividad', middleware.ensureAuthorized, function(req, res, next) {
    var actividad = new Actividad(req.body);

    actividad.save(function(err, actividad) {
		if (err) {
			return next(err);
		}

    	res.json(actividad);
    });
})

//PUT - Actualizar actividad
router.put('/actividad/:id', middleware.ensureAuthorized, function(req, res) {
    Actividad.findById(req.params.id, function(err, actividad) {
	    actividad.nombre_act = req.body.nombre_act;

        actividad.save(function(err) {
            if (err) {
            	res.send(err);
            }
            
            res.json(actividad);
        });
    })
})

//DELETE - Eliminar actividad
router.delete('/actividad/:id', middleware.ensureAuthorized, function(req, res){
    Actividad.findByIdAndRemove(req.params.id, function(err) {
        if (err) {
        	res.send(err)
        }
        
        res.json({error: false, message: 'La actividad se ha eliminado.'});
    })
})

module.exports = router;