var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DependenciaSchema = new mongoose.Schema({
	nombre_dep: String,
});

mongoose.model('Dependencia', DependenciaSchema);