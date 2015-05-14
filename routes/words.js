'use strict';

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
  app.get('/words', isLoggedIn, function(req, res) {

    var user = req.user;

    if (req.query) {
      delete req.query.v;
      req.query.userId = user._id;
    }

    Word.find(req.query, function(err, docs) {

      if(!err) {

        res.status(200).json(docs);

      } else {

        res.status(500).json({ message: 'message.error.wordList' });

      }

    });

  });

  /* POST words */
  app.post('/words', isLoggedIn, function(req, res) {

    var wordData = req.body;
    var user = req.user;
    wordData.score = 0;

    Word.findOne({

          userId: user._id,
          translation1: wordData.translation1,
          translation2: wordData.translation2

      }, function(err, doc) {

      if(!err && !doc) {

        var newWord = new Word(wordData);
        newWord.userId = user._id;

        newWord.save(function(err) {

          if(!err) {

            res.status(201).json(newWord);

          } else {

            res.status(500).json({message: 'message.error.wordCreation' + err});

          }

        });

      } else if (!err) {

        res.status(403).json({ message: 'message.error.wordExists'});

      } else {

        res.status(500).json({ message: 'message.error.wordCreation'});

      }
    });
  });

  app.get('/words/:id', isLoggedIn, function(req, res) {

    var id = req.params.id;
    var user = req.user;

    Word.findById(id, function(err, doc) {

      if(!err && doc) {

        if (user._id !== doc._id) {

          res.status(401).json({ message: 'message.error.unauthorised' });

        }

        res.status(200).json(doc);

      } else if(err) {

        res.status(500).json({ message: 'message.error.wordOne' + err});

      } else {

        res.status(404).json({ message: 'message.error.wordOne'});

      }
    });

  });

  app.put('/words/:id', isLoggedIn, function(req, res) {

    var _id = req.params.id;
    var wordData = req.body;
    var user = req.user;

    Word.findById(_id, function(err, doc) {

        if(!err && doc) {

          if (user._id !== doc._id) {

            res.status(401).json({ message: 'message.error.unauthorised' });

          }

          var newWord = _.merge(doc, wordData);

          newWord.save(function(err) {

            if(!err) {

              res.status(200).json(newWord);

            } else {

              res.status(500).json({message: 'message.error.wordUpdate' + err});

            }
          });

        } else if(!err) {

          res.status(404).json({ message: 'message.error.wordOne'});

        } else {

          res.status(500).json({ message: 'message.error.wordUpdate'});

        }
      });
  });

  app.delete('/words/:id', isLoggedIn, function(req, res) {

    var _id = req.params.id;
    var user = req.user;

    Word.findById(_id, function(err, doc) {

      if(!err && doc) {

        if (user._id !== doc._id) {

          res.status(401).json({ message: 'message.error.unauthorised' });

        }

        doc.remove();
        res.status(200).json({});

      } else if(!err) {

        res.status(404).json({ message: 'message.error.wordOne'});

      } else {

        res.status(403).json({message: 'message.error.wordDelete' + err });

      }
    });

  });
};
