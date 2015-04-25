'use strict';

var express = require('express');
var router = express.Router();
var Word = require('../models/words').Word;
var _ = require('lodash');

/* GET words listing. */
router.get('/', function(req, res) {

  Word.find({}, function(err, docs) {

    if(!err) {

      res.json(200, docs);

    } else {

      res.json(500, { message: 'message.error.wordList' });

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

          res.json(201, {message: 'message.success.wordCreation'});

        } else {

          res.json(500, {message: 'message.error.wordCreation'});

        }

      });

    } else if (!err) {

      res.json(403, { message: 'message.error.wordExists'});

    } else {

      res.json(500, { message: 'message.error.wordCreation'});

    }
  });
});

router.get('/:id', function(req, res) {

  var id = req.params.id;

  Word.findById(id, function(err, doc) {

    if(!err && doc) {

      res.json(200, doc);

    } else if(err) {

      res.json(500, { message: 'message.error.wordOne' + err});

    } else {

      res.json(404, { message: 'message.error.wordOne'});

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

            res.status(200).json({message: 'message.success.wordUpdate'});

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
      res.status(200).json({ message: 'message.success.wordDelete'});

    } else if(!err) {

      res.status(404).json({ message: 'message.error.wordOne'});

    } else {

      res.status(403).json({message: 'message.error.wordDelete' + err });

    }
  });

});

module.exports = router;
