'use strict';

var Quiz = require('../models/quiz').Quiz;
var Word = require('../models/words').Word;
var _ = require('lodash');

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated()) {

        return next();

    } else {

      res.status(401).json({ message: 'message.error.unauthorised' });

    }

}

module.exports = function(app) {

  /* GET words listing. */
  app.get('/quiz', isLoggedIn, function(req, res) {

    var user = req.user;

    Quiz.find({userId: user._id}, function(err, docs) {

      if(!err) {

        res.status(200).json(docs);

      } else {

        res.status(500).json({ message: 'message.error.quizList' });

      }

    });

  });

  /* Create a newly generated quiz */
  app.post('/quiz', isLoggedIn, function(req, res) {

    var user = req.user;
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
      category: category,
      userId: user._id
    });

    Word.find({
      userId: user._id,
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

  app.get('/quiz/:id', isLoggedIn, function(req, res) {

    var id = req.params.id;
    var user = req.user;

    Quiz.findById(id, function(err, doc) {

      if(!err && doc) {

        if (user._id === doc.userId) {

          res.status(200).json(doc);

        } else {

          res.status(401).json({ message: 'message.error.unauthorised' });

        }


      } else if(err) {

        res.status(500).json({ message: 'message.error.quizOne' + err});

      } else {

        res.status(404).json({ message: 'message.error.quizOne'});

      }
    });

  });

  app.put('/quiz/:id', isLoggedIn, function(req, res) {

    var _id = req.params.id;
    var quizData = req.body;
    var user = req.user;

    Quiz.findById(_id, function(err, doc) {

        if(!err && doc) {

          if (user._id !== doc._id) {

            res.status(401).json({ message: 'message.error.unauthorised' });

          }

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

  app.put('/quiz/:id/updateWord', isLoggedIn, function(req, res) {

    var _id = req.params.id;
    var wordId = req.body.wordId;
    var wordStatus = req.body.wordStatus;
    var user = req.user;

    Quiz.update(
      { _id: _id, 'wordList.wordId': wordId },
      { $set: { 'wordList.$.status' : wordStatus } }, function(err, doc) {

        if(!err && doc) {

          if (user._id !== doc._id) {

            res.status(401).json({ message: 'message.error.unauthorised' });

          }

          res.status(200).json({});

        } else if(!err) {

          res.status(404).json({ message: 'message.error.updateWordInQuiz'});

        } else {

          res.status(403).json({message: 'message.error.updateWordInQuiz' + err });

        }
    });

  });

  app.delete('/quiz/:id', isLoggedIn, function(req, res) {

    var _id = req.params.id;
    var user = req.user;

    Quiz.findById(_id, function(err, doc) {

      if(!err && doc) {

        if (user._id !== doc._id) {

          res.status(401).json({ message: 'message.error.unauthorised' });

        }

        doc.remove();
        res.status(200).json({});

      } else if(!err) {

        res.status(404).json({ message: 'message.error.quizOne'});

      } else {

        res.status(403).json({message: 'message.error.quizDelete' + err });

      }
    });

  });

};

