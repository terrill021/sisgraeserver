var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UsuarioSchema = new mongoose.Schema({
	cc_usuario: Number,
	nombre_usuario: String,
	apellido_usuario: String,
	correo_usuario: String,
	tel_usuario: String,
	dependencia: { type: Schema.ObjectId, ref: 'Dependencia' },
	dir_usuario: String,
	clave_usuario: String,
	tipo: String,
	estado: { type: Boolean, default: true }, //Habilitado, Deshabilitado, Sancionado
	pb_token: String,
	max_reservaciones: { type: Number, default: 3 }, //Maximo de reservaciones
	max_res_pend: { type: Number, default: 0 }, //Reservaciones disponibles
	fecha_registro_user: { type: Date, default: Date.now },
	fecha_act_registro: { type: Date, default: Date.now }
});

mongoose.model('Usuario', UsuarioSchema);