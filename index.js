'use strict'

var mongoose = require('mongoose');
var app = require('./app');
var port = process.env.PORT || 3789;

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/zoo', {useNewUrlParser: true, useUnifiedTopology: true}) 
    .then(() => {
        console.log('The conecction to the database was succesfull')

        app.listen(port, () => {
            console.log("The local server with Node and Express is running")
        })
    })
    .catch(err => console.log(err)); 

