var mongoose = require('mongoose');
var Actividad = mongoose.model('Actividad');

exports.obtenerActividades = function(req, res, next) {
    Actividad.find(function(err, actividad) {
        if (err) {
        	return next(err);
        }

        res.json(actividad);
    });
};

exports.agregarActividad = function(req, res, next) {
    var actividad = new Actividad(req.body);

    actividad.save(function(err, actividad) {
		if (err) {
			return next(err);
		}

    	res.json({error: false, message : 'Actividad Agregada.', actividad : actividad});
    });
}

exports.actualizarActividad = function(req, res) {
    Actividad.findById(req.params.id, function(err, actividad) {
	    actividad.nombre_act = req.body.nombre_act;

        actividad.save(function(err) {
            if (err) {
            	res.send(err);
            }
            
            res.json(actividad);
        });
    })
}

exports.eliminarActividad = function(req, res){
    Actividad.findByIdAndRemove(req.params.id, function(err) {
        if (err) {
        	res.send(err)
        }
        
        res.json({error: false, message: 'La actividad se ha eliminado.'});
    })
}