/**
 * Pages
 */

var mongoose = require('mongoose');

function render404(res) {
  res.render('404', {
    title : 'Not found'
  });
}

function alphaList(list) {
  if(!list || !list.length) return false;

  var res    = [],
      letter = '',
      i      = -1;

  res = res || [];

  list.forEach(function (el) {
    if((el.name[0].toLowerCase() !== letter)) {
      res.push({
        letter   : el.name[0].toLowerCase(),
        elements : []
      });
      i += 1;
    }
    letter = el.name[0].toLowerCase();
    res[i].elements.push(el);
  });

  return res;
}

// Get home page -> redirect to random game
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

// About page
exports.about = function (req, res) {

  res.render('about' , {
    title : 'About'
  });
};

// Game page (game will be loaded from the page)
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

// List of all categories page
exports.categories = function (req, res) {
  var Category = mongoose.model('Category');

  Category.find({},
            { name : 1 })
          .sort('name')
          .exec(function (err, cats) {
            if(err) console.log(err);

            var list;
            if(cats) {
              list = alphaList(cats);
            }

            if(!list.length) list = null;

            return res.render('category', {
              title   : 'Categories',
              baseurl : '/about',
              itemurl : '/category/',
              list    : list
            });

          });
};

// List of all games in category page
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

            var list;
            if(games) {
              list = alphaList(games);
            }

            if(!list.length) list = null;

            return res.render('category', {
              title   : category.name,
              baseurl : '/category',
              itemurl : '/game/',
              list    : list
            });
          });

        return;
      }

      return render404(res);
    }
  );
};

exports.loginPage = function (req, res) {
  res.render('login', {
    title : 'Login'
  });
};

exports.login = function (req, res) {

  var Pass = mongoose.model('Pass'),
      name = req.body.name,
      code = req.body.code;

  if(!code || !code.length || !name || !name.length) {
    return res.render('login', {
      title : 'Login'
    });
  }

  Pass.findOne({ name : name }, function (err, pass) {
    if(err) console.log(err);

    if(pass && pass.authenticate(code)) {
      req.session.user = pass._id;
      return res.redirect('/1');
    }

    res.render('login', {
      title : 'Login'
    });
  });
};
