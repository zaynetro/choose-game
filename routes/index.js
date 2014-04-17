/**
 * Pages
 */

var gamePage    = require('../helpers/parsers/gamepage'),
    syntaxParse = require('../helpers/parsers/syntax'),
    mongoose    = require('mongoose');

exports.index = function (req, res) {

  var Game = mongoose.model('Game');

  Game.random(function (err, game) {
    if(err) console.log(err);

    if(game) {
      return res.redirect('/game/'+game.name.replace(/ /g, '_'));
    }

    res.render('404', {
      title : 'Not found'
    });
  });
};

exports.game = function (req, res) {

  var Game = mongoose.model('Game'),
      name = req.params.name;

  Game.findOne({ name : new RegExp(name.replace(/_/g, ' '), 'i') })
      .populate('categories', 'name')
      .exec(function (err, game) {
        if(err) console.log(err);

        if(game) {
          var g = game;
          g.data = syntaxParse(game.data);

          return res.render('game', {
            title : g.name,
            game  : g
          });
        }

        res.render('404', {
          title : 'Not found'
        });
      });
};

exports.addform = function (req, res) {
  res.render('addform', {
    title : 'Adding form'
  });
};

exports.addData = function (req, res) {

  var info     = req.body,
      Game     = mongoose.model('Game'),
      Category = mongoose.model('Category');

  gamePage(info.url, function (err, found) {
    if(err) {
      console.log(err);
      return res.redirect('/add?false');
    }

    var cats = [],
        data = {};
    found.categories.forEach(function (el) {
      cats.push({
        name : el
      });
    });

    Category.create(cats, function (err) {
      if(err && err.code != 11000) console.log(err);

      Category.getIDs(found.categories, function (err, ids) {
        if(err) console.log(err);

        data.name = found.name;
        data.data = found.data;
        data.categories = ids;

        var game = new Game(data);
        game.save(function (err) {
          if(err && err.code != 11000) {
            console.log(err);
            return res.redirect('/add?false');
          }

          res.redirect('/add?true');
        });

      });

    });

  });
};
