/**
 * API
 *
 */

var mongoose    = require('mongoose'),
    pagesParse  = require('../helpers/parsers/pages'),
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

exports.addAll = function (req, res) {

  var Game     = mongoose.model('Game'),
      Category = mongoose.model('Category'),
      url      = req.body.url;

  if(!url || !url.length) return res.json(500, { error : 'Wrong request' });

  pagesParse.categories(url, function (g, next) {
      if(g && typeof g === 'object' & g.categories) {
        var cats = [];
            data = {};

        g.categories.forEach(function (el) {
          cats.push({
            name : el
          });
        });

        Category.create(cats, function (err) {
          if(err && err.code != 11000) console.log(err);

          Category.getIDs(g.categories, function (err, ids) {
            if(err) console.log(err);

            data.name = g.name;
            data.data = g.data;
            data.categories = ids;

            var game = new Game(data);
            game.save(function (err) {
              if(err) {
                console.log(err);
                next(null);
              } else {
                next(game.name);
              }
            });

          });

        });
      } else {
        return next(null);
      }
    },
    function (err, games) {
      if(err) {
        console.log(err);
        return res.json(500, { error : err });
      }

      //console.log(games);

      var count = (games && games.length) ? games.length : 0;

      console.log('Added: ' + count + ' games');
      res.json('Added: ' + count + ' games');
    }
  );
};
