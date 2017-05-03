var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Dependencia = mongoose.model('Dependencia');
var middleware = require('../settings/middleware');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

//GET - Listar dependencia
router.get('/dependencias', function(req, res, next) {
    Dependencia.find(function(err, dependencia) {
        if (err) {
        	return next(err);
        }

        res.json(dependencia);
    });
})

//POST - Agregar dependencia
router.post('/dependencia', middleware.ensureAuthorized, function(req, res, next) {
    var dependencia = new Dependencia(req.body);

    dependencia.save(function(err, dependencia) {
		if (err) {
			return next(err);
		}

    	res.json(dependencia);
    });
})

//PUT - Actualizar dependencia
router.put('/dependencia/:id', middleware.ensureAuthorized, function(req, res) {
    Dependencia.findById(req.params.id, function(err, dependencia) {
	    dependencia.nombre_dep = req.body.nombre_dep;

        dependencia.save(function(err) {
            if (err) {
            	res.send(err);
            }
            
            res.json(dependencia);
        });
    })
})

//DELETE - Eliminar dependencia
router.delete('/dependencia/:id', middleware.ensureAuthorized, function(req, res){
    Dependencia.findByIdAndRemove(req.params.id, function(err) {
        if (err) {
        	res.send(err)
        }
        
        res.json({message: 'La dependencia se ha eliminado.'});
    })
})

module.exports = router;