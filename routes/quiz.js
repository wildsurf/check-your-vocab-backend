'use strict';

var express = require('express');
var router = express.Router();
var Quiz = require('../models/quiz').Quiz;
var Word = require('../models/words').Word;
var _ = require('lodash');

/* GET words listing. */
router.get('/', function(req, res) {

  Quiz.find({}, function(err, docs) {

    if(!err) {

      res.status(200).json(docs);

    } else {

      res.status(500).json({ message: 'message.error.quizList' });

    }

  });

});

/* Create a newly generated quiz */
router.post('/', function(req, res) {

  var quizData = req.body || {};
  var maximumWords = quizData.limit || 100;
  var visibleLanguage = quizData.visibleLanguage || 'mixed';
  var category = quizData.category || new RegExp('.*');
  var selectedWords = [];
  var wordIds = [];
  var wordList = [];

  var quiz = new Quiz({
    visibleLanguage: visibleLanguage,
    language1: quizData.language1,
    language2: quizData.language2,
    category: category
  });

  Word.find({
    category: category,
    language1: quizData.language1,
    language2: quizData.language2 }, function(err, docs) {

    if (!err && docs.length) {

        selectedWords = _.sample(docs, maximumWords);

        wordIds = _.pluck(selectedWords, '_id');

        _.each(wordIds, function(wordId) {
          wordList.push({
            wordId: wordId ,
            status: 'unanswered'
          });
        });

        quiz.wordList = wordList;

        quiz.save(function(err) {

            if(!err) {

                res.status(201).json(quiz);

            } else {

                res.status(500).json({message: 'message.error.quizGenerate'});
            }

        });

    } else {

        res.status(500).json({message: 'message.error.quizGenerate'});

    }


  });

});

router.get('/:id', function(req, res) {

  var id = req.params.id;

  Quiz.findById(id, function(err, doc) {

    if(!err && doc) {

      res.status(200).json(doc);

    } else if(err) {

      res.status(500).json({ message: 'message.error.quizOne' + err});

    } else {

      res.status(404).json({ message: 'message.error.quizOne'});

    }
  });

});

router.put('/:id', function(req, res) {

  var _id = req.params.id;
  var quizData = req.body;

  Quiz.findById(_id, function(err, doc) {

      if(!err && doc) {

        var updatedQuiz = _.merge(doc, quizData);

        updatedQuiz.save(function(err) {

          if(!err) {

            res.status(200).json(updatedQuiz);

          } else {

            res.status(500).json({message: 'message.error.quizUpdate' + err});

          }
        });

      } else if(!err) {

        res.status(404).json({ message: 'message.error.quizOne'});

      } else {

        res.status(500).json({ message: 'message.error.quizUpdate'});

      }
    });
});

router.put('/:id/updateWord', function(req, res) {

  var _id = req.params.id;
  var wordId = req.body.wordId;
  var wordStatus = req.body.wordStatus;

  Quiz.update(
    { _id: _id, 'wordList.wordId': wordId },
    { $set: { 'wordList.$.status' : wordStatus } }, function(err, doc) {

      if(!err && doc) {

        res.status(200).json({});

      } else if(!err) {

        res.status(404).json({ message: 'message.error.updateWordInQuiz'});

      } else {

        res.status(403).json({message: 'message.error.updateWordInQuiz' + err });

      }
  });

});

router.delete('/:id', function(req, res) {

  var _id = req.params.id;

  Quiz.findById(_id, function(err, doc) {

    if(!err && doc) {

      doc.remove();
      res.status(200).json({});

    } else if(!err) {

      res.status(404).json({ message: 'message.error.quizOne'});

    } else {

      res.status(403).json({message: 'message.error.quizDelete' + err });

    }
  });

});

module.exports = router;
