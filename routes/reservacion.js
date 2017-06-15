var express = require('express');
var router = express.Router();
var middleware = require('../settings/middleware');
var reservaciones = require('../controllers/reservacion');


//GET - Listar reservaciones
router.get('/reservaciones', middleware.ensureAuthorized, reservaciones.obtenerReservaciones);

//GET - Listar reservaciones por usuario
router.get('/reservaciones/:id', middleware.ensureAuthorized, reservaciones.obtenerReservacionesUsuario);

//GET - Listar horarios no reservados
router.get('/horarios/disponibles', middleware.ensureAuthorized, reservaciones.obtenerHorariosDisponibles);

//POST - Agregar reservaciones
router.post('/reservacion', middleware.ensureAuthorized, reservaciones.agregarReservacion);



//PUT - Actualizar reservaciones
router.put('/reservacion/:id', middleware.ensureAuthorized, reservaciones.actualizarReservacion);

//PUT - Actualizar estado
router.put('/reservacion/:id/estado', middleware.ensureAuthorized, reservaciones.actualizarEstado);

//DELETE - Eliminar reservación
router.delete('/reservacion/:id', middleware.ensureAuthorized, reservaciones.eliminarReservacion);

module.exports = router;