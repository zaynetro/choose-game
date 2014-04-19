/**
 * API
 *
 */

var mongoose    = require('mongoose'),
    syntaxParse = require('../helpers/parsers/syntax');

exports.getRandom = function (req, res) {
  var Game = mongoose.model('Game'),
      type = req.query.t;

  if(type === 'random') {
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

      res.json(500, { error : 'Internal error' });
    });

    return;
  }

  if(type === 'randomName') {
    var Game = mongoose.model('Game');

    Game.random(function (err, game) {
      if(err) console.log(err);

      if(game) {
        return res.json(game);
      }

      res.json(500, { error : 'Internal error' });
    });

    return;
  }

  return res.json(500, { error : 'Wrong request' });
};

exports.getGame = function (req, res) {
  var Game = mongoose.model('Game'),
      name = req.params.name;

  if(!name || !name.length) {
    return res.json(500, { error : 'Wrong request' });
  }

  name = decodeURIComponent(name).replace(/_/g, ' ');

  Game.findOne({ name : new RegExp(name, 'i') }, { random : 0, ref : 0 })
      .populate('categories', 'name')
      .exec(function (err, game) {
        if(err) console.log(err);

        if(game) {
          var g = game;
          g.data = syntaxParse(g.data);
          return res.json(g);
        }

        res.json(404, { error : 'Not found' });
      });
};
