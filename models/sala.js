var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SalaSchema = new mongoose.Schema({
	num_sala: Number,
	nombre_sala: String,
	planta: String,
	especificaciones: String,
	capacidad: Number,
	asistencia_min: Number,
	num_pcs: Number,
	actividad: [{ type: Schema.ObjectId, ref: 'Actividad' }],
	horario: [{ 
		dia: Number,
		dian: String,
		indice: Number,//Almacena el indice del rango de la hora.
		rango_hora: String, //Alamacena el rango de la hora Ej: 7:00 a.m. - 8:00 a.m.
		estado: { type: Boolean, default: false }//Permite habilitar una hora específiica.
	}],//Validar horas
	estado: String,
	fecha_registro_sala: { type: Date, default: Date.now }
});

mongoose.model('Sala', SalaSchema);