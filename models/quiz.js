'use strict';

var mongoose = require('mongoose'), Schema = mongoose.Schema;

var wordListSchema = new Schema({
    _id: false,
    wordId: { type: String },
    status: { type: String, enum: ['correct', 'incorrect', 'unanswered'] }
});

var quizSchema = new Schema({
    wordList: [ wordListSchema ],
    visibleLanguage: { type: String, enum: ['language1', 'language2', 'mixed'], default: 'mixed' },
    language1: { type: String, required: true },
    language2: { type: String, required: true },
    category: { type: String },
    date_completed: { type: Date },
    date_created  : { type: Date, required: true, default: Date.now }
});

var quiz = mongoose.model('quiz', quizSchema);

module.exports = {
  Quiz: quiz
};