/**
 * API
 *
 */

var mongoose    = require('mongoose'),
    syntaxParse = require('../helpers/parsers/syntax');

exports.getRandomName = function (req, res) {

  var Game = mongoose.model('Game');

  Game.random(function (err, game) {
    if(err) console.log(err);

    if(game) {
      return res.json(game);
    }

    res.json({ error : 'Internal error' });
  });
};

exports.getRandom = function (req, res) {
  var Game = mongoose.model('Game');

  Game.random({
      fields : {
        random : 0
      },
      populate : {
        path   : 'categories',
        select : 'name'
      }
    },
    function (err, game) {
    if(err) console.log(err);

    if(game) {
      var g = game;
      g.data = syntaxParse(g.data);
      return res.json(g);
    }

    res.json({ error : 'Internal error' });
  });
};
