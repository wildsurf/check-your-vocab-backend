'use strict';

var express = require('express');
var router = express.Router();
var Word = require('../models/words').Word;
var _ = require('lodash');

/* GET words listing. */
router.get('/', function(req, res) {

  if (req.query) {
    delete req.query.v;
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
router.post('/', function(req, res) {

  var wordData = req.body;
  wordData.score = 0;

  Word.findOne({

        translation1: wordData.translation1,
        translation2: wordData.translation2

    }, function(err, doc) {

    if(!err && !doc) {

      var newWord = new Word(wordData);

      newWord.save(function(err) {

        if(!err) {

          res.status(201).json(newWord);

        } else {

          res.status(500).json({message: 'message.error.wordCreation'});

        }

      });

    } else if (!err) {

      res.status(403).json({ message: 'message.error.wordExists'});

    } else {

      res.status(500).json({ message: 'message.error.wordCreation'});

    }
  });
});

router.get('/:id', function(req, res) {

  var id = req.params.id;

  Word.findById(id, function(err, doc) {

    if(!err && doc) {

      res.status(200).json(doc);

    } else if(err) {

      res.status(500).json({ message: 'message.error.wordOne' + err});

    } else {

      res.status(404).json({ message: 'message.error.wordOne'});

    }
  });

});

router.put('/:id', function(req, res) {

  var _id = req.params.id;
  var wordData = req.body;

  Word.findById(_id, function(err, doc) {

      if(!err && doc) {

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

router.delete('/:id', function(req, res) {

  var _id = req.params.id;

  Word.findById(_id, function(err, doc) {

    if(!err && doc) {

      doc.remove();
      res.status(200).json({});

    } else if(!err) {

      res.status(404).json({ message: 'message.error.wordOne'});

    } else {

      res.status(403).json({message: 'message.error.wordDelete' + err });

    }
  });

});

module.exports = router;
