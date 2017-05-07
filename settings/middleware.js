var jwt = require('jsonwebtoken');
var config = require('./config');

// Middleware para validar el token
exports.ensureAuthorized = function (req, res, next) {

    console.log('ensureAuthorized');

    // obtener token por get, post o como header
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    if (token) {
        jwt.verify(token, config.phrase, function(err, decoded){
            if (err) {
                res.json({error:true, message:'Token no válido o no existe.'});
            }
            
            req.decoded = decoded; // establecemos el token en el request
            next();
        });
    } else {
        res.json({error:true, message:'Token no válido o no existe.'});
    }
};

// Middleware para validar el token
exports.validatePassToken = function (req, res, next) {

    console.log('validatePassToken');

    // obtener token por get, post o como header
    var token = req.body.token || req.query.token || req.headers['x-access-token'] || req.params.token;

    if (token) {
        jwt.verify(token, config.SECURITY, function(err, decoded){
            if (err) {
                res.json({error:true, message:'Acceso no válido o no existe.'});
            }
            
            req.decoded = decoded; // establecemos el token en el request
            next();
        });
    } else {
        res.json({error:true, message:'Token no válido o no existe.'});
    }
};

exports.dominiosCruzados = function(req, res, next) {
    
    console.log('dominiosCruzados');

    var responseSettings = {
        "AccessControlAllowOrigin": req.headers.origin,
        "AccessControlAllowHeaders": "Content-Type,X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5,  Date, X-Api-Version, X-File-Name",
        "AccessControlAllowMethods": "POST, GET, PUT, DELETE, OPTIONS",
        "AccessControlAllowCredentials": true
    };

    /**
     * Headers
     */
    res.header("Access-Control-Allow-Credentials", responseSettings.AccessControlAllowCredentials);
    res.header("Access-Control-Allow-Origin",  responseSettings.AccessControlAllowOrigin);
    res.header("Access-Control-Allow-Headers", (req.headers['access-control-request-headers']) ? req.headers['access-control-request-headers'] : "x-requested-with");
    res.header("Access-Control-Allow-Methods", (req.headers['access-control-request-method']) ? req.headers['access-control-request-method'] : responseSettings.AccessControlAllowMethods);

    if ('OPTIONS' == req.method) {
        res.sendStatus(200);
    } else {
        next();
    }
};