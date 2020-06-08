'use strict'

//Modulos
var fs = require('fs');
var path = require('path');

//Modelos
var User = require('../models/user')
var Animal = require('../models/animal')

function pruebas(req, res) {
    res.status(200).send({message: 'Pruebaaaa'});
}

function saveAnimal(req, res) {
    var animal = new Animal();
    var params = req.body;

    if (params.name) {
        animal.name = params.name;
        animal.description = params.description;
        animal.year = params.year;
        animal.image = null;
        animal.user = req.user.sub;

        animal.save((err, animalStored) => {
            if (err) {
                res.status(500).send({message: 'Error en el servidor'});
            }
            else {
                if (!animalStored) {
                    res.status(404).send({message: 'No se ha guardado el animal'});
                }
                else {
                    res.status(200).send({animal: animalStored});
                }
            }
        });
    } 
    else {
        res.status(200).send({message: 'El nombre del animal es obligatorio'});
    }
}

function getAnimals(req, res) {
    Animal.find({}).populate({path: 'user'}).exec((err, animals) => {

        if(err) {
            res.status(500).send({message: 'Error en la petición'});
        }
        else {
            if(!animals){
                res.status(404).send({message: 'No hay animales'});    
            }
            else {
                res.status(200).send({animals});
            }
        }
    });
}

function getAnimal(req, res) {
    var animalId = req.params.id;

    Animal.findById(animalId).populate({path: 'user'}).exec((err, animal) => {
        if(err) {
            res.status(500).send({message: 'Error en la petición'});
        }
        else {
            if(!animal){
                res.status(404).send({message: 'El animal no existe'});    
            }
            else {
                res.status(200).send({animal});
            }
        }
    });

}

function updateAnimal(req, res) {
    var animalId = req.params.id;
    var update = req.body;

    Animal.findByIdAndUpdate(animalId, update, {new: true}, (err, animalUpdated) => {
        if (err) {
            res.status(500).send({message: 'Error en la petición'});    
        }
        else {
            if (!animalUpdated) {
                res.status(404).send({message: 'No se ha actualizado el animal'});    
            }
            else {
                res.status(200).send({animal: animalUpdated});
            }
        }
    });
}

function uploadImage(req, res) {

    var animalId = req.params.id;
    var filename = 'No subido...';

    if (req.files) {
        var filePath = req.files.image.path;
        var fileSplit = filePath.split('\\');
        var filename = fileSplit[2];

        var extSplit = filename.split('\.');
        var fileExt = extSplit[1];

        if (fileExt == 'png' || fileExt == 'jpg' || fileExt == 'jpeg' || fileExt == 'gif') {

            Animal.findByIdAndUpdate(animalId, {image: filename}, {new:true}, (err, animalUpdated) => {
                if (err) {
                    res.status(500).send({
                        message: 'Error al actualizar animal'
                    });
                }
                else {
                    if (!animalUpdated) {
                        res.status(404).send({message: 'No se ha podido actualizar el animal'});
                    }
                    else {
                        res.status(200).send({animal: animalUpdated, image: filename});
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
    var filePath = './uploads/animals/' + imageFile;

    fs.exists(filePath, function(exists) {
        if (exists) {
            res.sendFile(path.resolve(filePath));
        }
        else {
            res.status(404).send({message: 'La imagen no existe'});
        }
    });
}

function deleteAnimal(req, res) {
    var animalId = req.params.id;

    Animal.findByIdAndRemove(animalId, (err, animalRemove) => {
        if (err) {
            res.status(500).send({
                message: 'Error en la petición'
            });
        }
        else {
            if (!animalRemove) {
                res.status(404).send({message: 'No se ha podido borrar el animal'});
            }
            else {
                res.status(200).send({animal: animalRemove});
            }
        }
    });
}

module.exports = {
    pruebas,
    saveAnimal,
    getAnimals,
    getAnimal,
    updateAnimal,
    uploadImage,
    getImageFile,
    deleteAnimal
};