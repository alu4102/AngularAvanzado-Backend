'user strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var animalSchema = Schema({
    name: String,
    description: String,
    year: Number,
    image: String,
    user: { type: Schema.ObjectId, ref: 'User'}
});

module.exports = mongoose.model('Animal', animalSchema);
