var mongoose = require('mongoose');
var Dependencia = mongoose.model('Dependencia');

exports.obtenerDependencias = function(req, res, next) {

    Dependencia.find(function(err, dependencia) {
        if (err) {
        	return next(err);
        }

        res.json(dependencia);
    });
}

exports.agregarDependencia = function(req, res, next) {
    var dependencia = new Dependencia(req.body);

    dependencia.save(function(err, dependencia) {
		if (err) {
			return next(err);
		}

    	res.json(dependencia);
    });
}

exports.actualizarDependencia = function(req, res) {
    Dependencia.findById(req.params.id, function(err, dependencia) {
	    dependencia.nombre_dep = req.body.nombre_dep;

        dependencia.save(function(err) {
            if (err) {
            	res.send(err);
            }
            
            res.json(dependencia);
        });
    })
}

exports.eliminarDependencia = function(req, res){
    Dependencia.findByIdAndRemove(req.params.id, function(err) {
        if (err) {
        	res.send(err)
        }
        
        res.json({message: 'La dependencia se ha eliminado.'});
    })
}