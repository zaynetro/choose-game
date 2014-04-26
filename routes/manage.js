/**
 * Manage
 */

var pagesParse  = require('../helpers/parsers/pages'),
    syntaxParse = require('../helpers/parsers/syntax'),
    mongoose    = require('mongoose');


function countCollection (name, cb) {
  if(!name || !name.length) return cb(new Error('Wrong model name'));

  try {
    var Model = mongoose.model(name);
    if(!Model) return cb(new Error('Model does not exit'));

    Model.count({}, function (err, num) {
      if(err) return cb(err);

      cb(null, num);
    });
  } catch(e) {
    cb(e);
  }
}

exports.page = function (req, res) {

  function renderPage(res, models) {
    res.render('manage', {
      title  : 'Manage',
      models : models
    });
  }

  var models     = [],
      modelslist = Object.keys(mongoose.connection.base.models),
      l = modelslist.length,
      i = 0;

  modelslist.forEach(function (el) {
    countCollection(el, function (err, num) {
      if(err) {
        console.log(err);
        num = 0;
      }
      models.push({
        name  : el,
        count : num
      });
      i += 1;
      if(i >= l) renderPage(res, models);
    });
  });
};

exports.addLink = function (req, res) {

  var data = req.body;

  if(typeof data !== 'object') return res.json(500, { error : 'Wrong data' });

  var handle = {
    '1' : function (url) {
      pagesParse.categories(url, function (err, data) {
        if(err) console.log(err);

        res.json(data);
      });
    },
    '2' : function (url) {
      pagesParse.category(url, function (err, data) {
        if(err) console.log(err);

        res.json(data);
      });
    },
    '3' : null
  };

  try {
    handle[data.type](data.url);
  } catch(e) {
    res.json(500, { error : 'Wrong type attribute' });
  }
};


exports.addData = function (req, res) {

  var info     = req.body,
      Game     = mongoose.model('Game'),
      Category = mongoose.model('Category');

  pagesParse.game(info.url, function (err, found) {
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
