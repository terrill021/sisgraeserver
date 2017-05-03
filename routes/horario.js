var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Horario = mongoose.model('Horario');
var middleware = require('../settings/middleware');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

//GET - Listar horarios
router.get('/horarios', middleware.ensureAuthorized, function(req, res, next) {
    Horario.find(function(err, horario) {
        if (err) {
        	return next(err);
        }

        res.json(horario);
    });
})

//POST - Agregar horario
router.post('/horario', middleware.ensureAuthorized, function(req, res, next) {
    var horario = new Horario(req.body);

    horario.save(function(err, horario) {
		if (err) {
			return next(err);
		}

    	res.json(horario);
    });
})

//PUT - Actualizar horario
router.put('/horario/:id', middleware.ensureAuthorized, function(req, res) {
    Horario.findById(req.params.id, function(err, horario) {
	    horario.rango_hora = req.body.rango_hora;

        horario.save(function(err) {
            if (err) {
            	res.send(err);
            }
            
            res.json(horario);
        });
    })
})

//DELETE - Eliminar horario
router.delete('/horario/:id', middleware.ensureAuthorized, function(req, res){
    Horario.findByIdAndRemove(req.params.id, function(err) {
        if (err) {
        	res.send(err)
        }
        
        res.json({message: 'La horario se ha eliminado.'});
    })
})

module.exports = router;