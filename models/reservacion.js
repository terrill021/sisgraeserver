var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ReservacionSchema = new mongoose.Schema({
	fecha_reservacion: Date,
	usuario: { type: Schema.ObjectId, ref: 'Usuario' },
	sala: { type: Schema.ObjectId, ref: 'Sala' },
	horario: [{ 
		dia: Number,
		dian: String,
		indice: Number,//Almacena el indice del rango de la hora.
		rango_hora: String, //Alamacena el rango de la hora Ej: 7:00 a.m. - 8:00 a.m.
		estado: { type: Boolean }//Permite habilitar una hora específiica.
	}],
	dependencia: { type: Schema.ObjectId, ref: 'Dependencia' },
	cantidad_asistentes: Number,
	numero_equipos: Number,
	actividad: { type: Schema.ObjectId, ref: 'Actividad' },
	descripcion: String,
	estado: { type: String, default: 'Pendiente' }, //Pendiente, Cancelada, Cumplida, Incumplida
	observacion: String,
	entregable: { type: Boolean, default: false },
	calificacion: {
		valor: Number,
		observacion: String
	},
	fecha_registro: { type: Date, default: Date.now },
	fecha_act_registro: { type: Date, default: Date.now }
});

mongoose.model('Reservacion', ReservacionSchema);