/**
 * API
 *
 */

var mongoose = require('mongoose');

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
