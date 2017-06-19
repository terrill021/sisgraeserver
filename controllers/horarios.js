
var mongoose = require('mongoose');
var Horario = mongoose.model('Horario');

exports.obtenerHorarios = function(req, res, next) {
    Horario.find(function(err, horario) {
        if (err) {
        	return next(err);
        }

        res.json(horario);
    });
}

exports.AgregarHorario = function(req, res, next) {
    var horario = new Horario(req.body);

    horario.save(function(err, horario) {
		if (err) {
			return next(err);
		}

    	res.json(horario);
    });
}

exports.actualizarHorario = function(req, res) {
    Horario.findById(req.params.id, function(err, horario) {
	    horario.rango_hora = req.body.rango_hora;

        horario.save(function(err) {
            if (err) {
            	res.send(err);
            }
            
            res.json(horario);
        });
    })
}

exports.elimininarHorario = function(req, res){
    Horario.findByIdAndRemove(req.params.id, function(err) {
        if (err) {
        	res.send(err)
        }        
        res.json({message: 'La horario se ha eliminado.'});
    })
}