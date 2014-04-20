/**
 * Pages
 */

var gamePage    = require('../helpers/parsers/gamepage'),
    syntaxParse = require('../helpers/parsers/syntax'),
    mongoose    = require('mongoose');

function render404(res) {
  res.render('404', {
    title : 'Not found'
  });
}

exports.index = function (req, res) {

  var Game = mongoose.model('Game');

  Game.random(function (err, game) {
    if(err) console.log(err);

    if(game) {
      return res.redirect('/game/'+game.name.replace(/ /g, '_'));
    }

    return render404(res);
  });
};

exports.about = function (req, res) {

  res.render('about' , {
    title : 'About'
  });
};

exports.game = function (req, res) {

  var Game = mongoose.model('Game'),
      name = req.params.name;

  if(!name || !name.length) {
    return render404(res);
  }

  name = name.replace(/_/g, ' ');

  return res.render('game', {
    title : name
  });
};

exports.category = function (req, res) {

  var Category = mongoose.model('Category'),
      Game     = mongoose.model('Game'),
      name     = req.params.name;

  if(!name || !name.length) {
    return render404(res);
  }

  name = name.replace(/_/g, ' ');

  Category.findOne({
      name : new RegExp(name, 'i')
    },
    {
      'name' : 1
    },
    function (err, category) {
      if(err) console.log(err);

      if(category) {
        Game.find({
            'categories' : category._id
          },
          {
            'name' : 1
          })
          .sort('name')
          .exec(function (err, games) {
            if(err) console.log(err);

            if(games) {
              var list   = [],
                  letter = '',
                  block  = [],
                  i      = -1;

              games.forEach(function (el) {
                if((el.name[0].toLowerCase() !== letter)) {
                  list.push({
                    letter   : el.name[0].toLowerCase(),
                    elements : []
                  });
                  i += 1;
                }
                letter = el.name[0].toLowerCase();
                list[i].elements.push(el);
              });
            }

            if(!list.length) list = null;

            return res.render('category', {
              title : category.name,
              list : list
            });
          });

        return;
      }

      return render404(res);
    }
  );
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
