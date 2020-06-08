'use strict'

//Modulos
var bcrypt = require('bcrypt-nodejs');
var fs = require('fs');
var path = require('path');

//Modelos
var User = require('../models/user')

//Servicios
var jwt = require('../services/jwt')

function saveUser(req, res) {
    var user = new User();

    var params = req.body;

    if (params.password && params.name && params.surname && params.email) {
        user.name = params.name;
        user.surname = params.surname;
        user.email = params.email;
        user.role = 'ROLE_USER';
        user.image = null;

        User.findOne({email: user.email.toLowerCase()}, (err, issetUser) => {
            if (err) {
                res.status(500).send({message: 'Error al comprobar el usuario'});
            }
            else {
                if (!issetUser){
                    bcrypt.hash(params.password, null, null, function(err, hash){
                        user.password = hash;
                    
                        user.save((err, userStored) => {
                            if (err) {
                                res.status(500).send({message: 'Error al guardar el usuario'});
                            }
                            else {
                                if (!userStored) {
                                    res.status(404).send({message: 'No se ha registrado el usuario'});
                                }
                                else {
                                    res.status(200).send({user: userStored});
                                }
                            }
                        });
                    });
                }
                else {
                    res.status(200).send({
                        message: 'El usuario ya existe'
                    });
                }
            }
        });
    }
    else {
        res.status(200).send({
            message: 'Introduce los datos correctamente'
        });
    }
}

function login (req, res) {

    var params = req.body;
    var email = params.email;
    var password = params.password;

    User.findOne({email: email.toLowerCase()}, (err, user) => {
        if (err) {
            res.status(500).send({message: 'Error al comprobar el usuario'});
        }
        else {
            if (user){
                bcrypt.compare(password, user.password, (err, check) => {
                    if (check) {
                        if (params.gettoken) {
                            res.status(200).send({
                                token: jwt.createToken(user)
                            });
                        }
                        else {
                            res.status(200).send({user});
                        }
                    }
                    else {
                        res.status(404).send({message: 'El usuario no existe'});
                    }
                });    
            }
            else {
                res.status(404).send({message: 'El usuario no existe'});
            }
        }
    });
}

function updateUser(req, res) {

    var userId = req.params.id;
    var update = req.body;
    delete update.password;

    if (userId != req.user.sub) {
        return res.status(200).send({message: 'No tienes permisos para actualizar el usuario'})
    }
    User.findByIdAndUpdate(userId, update, {new:true}, (err, userUpdated) => {
        if (err) {
            res.status(500).send({
                message: 'Error al actualizar usuario'
            });
        }
        else {
            if (!userUpdated) {
                res.status(404).send({message: 'No se ha podido actualizar el usuario'});
            }
            else {
                res.status(200).send({user: userUpdated});
            }
        }
    });
}

function uploadImage(req, res) {

    var userId = req.params.id;
    var filename = 'No subido...';

    if (req.files) {
        var filePath = req.files.image.path;
        var fileSplit = filePath.split('\\');
        var filename = fileSplit[2];

        var extSplit = filename.split('\.');
        var fileExt = extSplit[1];

        if (fileExt == 'png' || fileExt == 'jpg' || fileExt == 'jpeg' || fileExt == 'gif') {

            if (userId != req.user.sub) {
                return res.status(200).send({message: 'No tienes permisos para actualizar el usuario'})
            }

            User.findByIdAndUpdate(userId, {image: filename}, {new:true}, (err, userUpdated) => {
                if (err) {
                    res.status(500).send({
                        message: 'Error al actualizar usuario'
                    });
                }
                else {
                    if (!userUpdated) {
                        res.status(404).send({message: 'No se ha podido actualizar el usuario'});
                    }
                    else {
                        res.status(200).send({user: userUpdated, image: filename});
                    }
                }
            });
        }
        else {
            fs.unlink(filePath, (err) => {
                if (err) {
                    res.status(200).send({message: 'Extensión no válida y fichero no borrado'});
                }
                else {
                    res.status(200).send({message: 'Extensión no válida'});
                }
            });
        }
    }
    else {
        res.status(200).send({message: 'No se han subido ficheros'});
    }
}

function getImageFile(req, res) {

    var imageFile = req.params.imageFile;
    var filePath = './uploads/users/' + imageFile;

    fs.exists(filePath, function(exists) {
        if (exists) {
            res.sendFile(path.resolve(filePath));
        }
        else {
            res.status(404).send({message: 'La imagen no existe'});
        }
    });
}

function getKeepers(req, res) {

    User.find({role: 'ROLE_ADMIN'}).exec((err, users) => {
        if (err) {
            res.status(500).send({message: 'Error en la petición'});
        }
        else {
            if (!users) {
                res.status(404).send({message: 'No hay cuaidadores'});
            }
            else {
                res.status(200).send({users});
            }
        }
    });

}

module.exports = {
    saveUser,
    login, 
    updateUser,
    uploadImage,
    getImageFile,
    getKeepers
};