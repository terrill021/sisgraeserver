var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//Almacena una coordenada de un horario.
var HorarioSchema = new mongoose.Schema({
	dia: Number,
	dian: String,
	indice: Number,//Almacena el indice del rango de la hora.
	rango_hora: String, //Alamacena el rango de la hora Ej: 7:00 a.m. - 8:00 a.m.
	estado: { type: Boolean, default: false }//Permite habilitar una hora específiica.
});

mongoose.model('Horario', HorarioSchema);