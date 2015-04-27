'use strict';

var mongoose = require('mongoose'), Schema = mongoose.Schema;

var wordsSchema = new Schema({
    language1: { type: String, required: true },
    language2: { type: String, required: true },
    score: { type: Number },
    translation1: { type: String, required: true },
    translation2: { type: String, required: true },
    category: { type: String },
    date_created  : { type: Date, required: true, default: Date.now }
});

var word = mongoose.model('word', wordsSchema);

module.exports = {
  Word: word
};