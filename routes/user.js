'use strict'

var express = require('express');
var userController = require('../controllers/user');

var api = express.Router();
var md_auth = require('../middlewares/authenticated');

var multipart = require('connect-multiparty');
var md_upload = multipart({uploadDir: './uploads/users'});

api.post('/register', userController.saveUser);
api.post('/login', userController.login);
api.put('/update-user/:id', md_auth.ensureAuth, userController.updateUser);
api.post('/upload-image-user/:id', [md_auth.ensureAuth, md_upload], userController.uploadImage);
api.get('/get-image-file/:imageFile', userController.getImageFile);
api.get('/keepers', userController.getKeepers);


module.exports = api;


