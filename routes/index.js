/**
 * Pages
 */

var gamePage = require('../helpers/parsers/gamepage'),
    mongoose = require('mongoose');

exports.index = function (req, res) {

  var Game     = mongoose.model('Game');

  Game.random(function (err, game) {
    if(err) console.log(err);

    if(game) {
      return res.render('index', {
        title : game.name,
        game  : game
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
