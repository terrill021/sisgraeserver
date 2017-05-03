var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ActividadSchema = new mongoose.Schema({
	nombre_act: String,
	salas: [{ type: Schema.ObjectId, ref: 'Sala' }]
});

mongoose.model('Actividad', ActividadSchema);