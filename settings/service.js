var jwt = require('jsonwebtoken');
var config = require('./config');
var nodemailer = require('nodemailer');
var mongoose = require('mongoose');
const crypto = require('crypto');
var Usuario = mongoose.model('Usuario');
var gcm = require('node-gcm');
var senderId ='AIzaSyAEQEwBSxWYlFtIEzn3ycET5_xzxURF_Jo';

exports.crearToken = function(user) {
	return jwt.sign(user, config.phrase, {
    			expiresIn: 31536000 // tiempo de expiración, checar documentación
    		});    
}

exports.passwordToken = function(user) {
	return jwt.sign(user, config.SECURITY, {
    			expiresIn: 900 // tiempo de expiración, checar documentación
    		});    
}

exports.invalidarToken = function(req, res) {
	var token = req.headers.authorization;
	// console.log(' >>> ', token)
	jwt.verify(token, 'hola mundo', function(err, decoded) {
		if (err) {
			res.send({error: true, message:'Token no válido o no existe.'});
		} 
	});
}

exports.encriptar = function (user, pass) {
	const secret = user;
	const hash = crypto.createHmac(config.algorithm, secret)
	.update(pass)
	.digest('hex');

	return hash;
}

exports.validarMail = function (mail) {
	return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,4})+$/.test(mail);
}

exports.enviarMensaje = function(mensaje) {
	var admins = [];
	if (mensaje.tipo != 'recuperarPass' || mensaje.tipo != 'registrarUsuario') {
		Usuario.find({tipo: 'Administrador'}, { tipo: 1, _id: 0 }, function(err, user) {
			if (err) {
				res.send({error:true, message:'Oops, Ocurrió un error.'});
			}

			admins = user;
		});
	}

	// create reusable transporter object using the default SMTP transport
	var transporter = nodemailer.createTransport(config.smtpConfig);

	// setup e-mail data with unicode symbols
	var mailOptions = {
	    from: '"Soporte técnico 👥" <tech@udc.edu.co>', // sender address
	    to: mensaje.to, // list of receivers, separados por coma
	    cc: admins,
	    subject: mensaje.asunto, // Subject line
	    //text: 'Hello world 🐴', // plaintext body
	    html: '<h1>' + mensaje.asunto + '</h1>'
	    + '<b>¡Hola ' + mensaje.nombre + ' ' + mensaje.apellido + '!</b><br>'
	    + '<p style="text-align: justify;">' + mensaje.cuerpo + '</p><br>'
	    + '<blockquote style="margin:0px 0px 0px 0.8ex;border-left:1px solid rgb(204,204,204);padding-left:1ex"><span style="font-family:arial,sans-serif;line-height:13.3333px;text-align:justify"><font size="1"><b>CONFIDENCIALIDAD:</b> Este mensaje y cualquier archivo anexo son confidenciales y para uso exclusivo del destinatario. Esta comunicación puede contener información protegida por derechos de autor. Si usted ha recibido este mensaje por error, equivocación u omisión queda estrictamente prohibida la utilización, copia, reimpresión y/o reenvío del mismo. En tal caso, por favor notificar, de forma inmediata al remitente y borrar el mensaje original y cualquier archivo anexo. Gracias.</font></span></blockquote>'
	};

	// send mail with defined transport object
	transporter.sendMail(mailOptions, function(error, res){
		if(error){
			return console.log(error);
		}
		console.log('Message sent: ' + res);
	});
}

//Notificaciones PUSH
exports.sendPush = function(message, registrationId, callback) {
	
	var message = new gcm.Message({data: {tittle: "SISGRAE", message: message}});
	var regTokens = [registrationId];
	var sender = new gcm.Sender(senderId);

	if (registrationId) {
		sender.send(message, { registrationTokens: regTokens }, function (err, response) {
			if (err){
				console.error(err);
			} else 	{
				console.log(response);
			}
			callback();
		});
	}
}

