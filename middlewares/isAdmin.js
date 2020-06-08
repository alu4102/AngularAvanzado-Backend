'use strict'

exports.isAdmin = function(req, res, next) {
    console.log("ROL " + req.user.role);
    if(req.user.role != 'ROLE_ADMIN') {
        return res.status(200).send({message: 'No tienes accesos a esta zona'});
    }

    next();
};