var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SancionSchema = new mongoose.Schema({
	administrador: { type: Schema.ObjectId, ref: 'Usuario' },
	sancionado: { type: Schema.ObjectId, ref: 'Usuario' },
	asunto: { type: String },
	descripcion: String,
	fecha_registro: { type: Date, default: Date.now }
});

mongoose.model('Sancion', SancionSchema);