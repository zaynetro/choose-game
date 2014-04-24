/**
 * Get game data from it's editing page
 *
 */

var jsdom  = require('jsdom'),
    fs     = require('fs'),
    path   = require('path'),
    jquery = fs.readFileSync(path.join(path.dirname(require.main.filename), "public/javascripts/jquery-2.1.0.min.js"), "utf-8");

function getContent(url, cb) {
  jsdom.env({
    url : url,
    src : [jquery],
    done : cb
  });
}

/**
 * Run functions is array synchronously
 */
function syncChain(arr, func, saver, cb) {
  if(!arr || !arr.length) return cb(new Error('Wrong array'));
  if(typeof func !== 'function') return cb(new Error('Wrong function'));

  var elems  = arr,
      res    = [];

  if(!cb || typeof cb !== 'function') {
    cb = saver;
    saver = null;
  }

  var loop = function loop(a) {
    if(!a.length) return cb(null, res);

    var e = a.shift();
    func(e, saver, function (err, result) {
      if(result) res = res.concat(result);
      loop(a);
    });
  };

  loop(elems);
}

var pages = {

  /**
   * From categories page get all categories and pass them to category function synchronously
   * Pass games to game parser
   *
   * @url is categories location
   * @saver is function to save games
   * @cb is callback function
   */
  categories : function (url, saver, cb) {
    if(!url || !url.length) {
      return cb(new Error('Wrong Url'));
    }
    if(typeof cb !== 'function') {
      cb = saver;
      saver = function (data, next) {
        next();
      };
    }

    getContent(url, function (err, w) {
      if(err) return cb(err);

      var cats = [],
          root = w.document._documentRoot;

      root = root.substring(0, root.lastIndexOf('/'));

      w.$('#mw-subcategories').find('a').each(function () {
        cats.push(root + w.$(this).attr('href'));
      });

      syncChain(cats, pages.category, function (err, games) {
        if(err) return cb(err);

        syncChain(games, pages.game, saver, cb);
      });
    });

  },

  /**
   * Go through all games in category and return edit game links array
   */
  category : function (url, saver, cb) {
    if(!url || !url.length) {
      return cb(new Error('Wrong url'));
    }

    getContent(url, function (err, w) {
      if(err) return cb(err);

      var games = [],
          root  = w.document._documentRoot;

      root = root.substring(0, root.lastIndexOf('/'));
      root += '/w/index.php?title=';

      w.$('#mw-pages').find('a').each(function () {
        games.push(root + w.$(this).text().replace(/ /g, '_') + '&action=edit');
      });

      if(saver) {
        saver(games, function (data) {
          cb(null, data);
        });
      } else {
        cb(null, games);
      }
    });
  },

  /**
   * Get game's data from it's editing page
   */
  game : function (url, saver, cb) {
    if(!url || !url.length) {
      return cb(new Error('Wrong Url'));
    }

    getContent(url, function (err, w) {
      if(err) return cb(err);

      var game = {
        name : '',
        categories : [],
        data : ''
      };

      game.name = w.$('#firstHeading').text().trim();
      game.ref  = url;

      var data = w.$('#wpTextbox1').val();

      if(!data || !data.length) {
        return cb(new Error('Cannot get data'));
      }

      var sidebar    = data.match(/^\{\{([^])*\n\}\}/),
          categories = data.match(/\[\[([\w\s]+)\:([\w\s]+)\]\]/g);

      sidebar = (sidebar && sidebar[0]) ? sidebar[0] : sidebar;
      categories = (categories && categories.length) ? categories : [];

      var start = sidebar ? sidebar.length : 0,
          end   = (categories.length) ? data.indexOf(categories[0]) : data.length,
          rules = data.substring(start, end);

      rules = rules.trim();

      var cats = [];

      categories.forEach(function (el) {
        if(!el || !el.length) return;
        var tmp = el.match(/\[\[Category:([\w\s]+)\]\]/i);

        if(tmp && tmp.length) cats.push(tmp[1].toLowerCase());
      });

      if(sidebar) {
        var morecats = sidebar.match(/Type =(.*)/i);

        if(morecats && morecats.length) {
          var types = morecats[0].match(/\{\{([^{]+)\}\}/g);
          if(types) {
            types.forEach(function (el) {
              cats.push(el.substring(2, el.length - 2).toLowerCase());
            });
          }
        }
      }

      game.data = rules;
      game.categories = cats;

      if(saver) {
        saver(game, function (data) {
          cb(null, data);
        });
      } else {
        cb(null, game);
      }

      /*

      Match sidebar ->  ^\{\{([^])*\n\}\}
      Match categories and de ->  \[\[([\w\s]+)\:([\w\s]+)\]\] g
      Rest is data

      For sidebar:
        Get Type line ->  Type =(.*) i
        For type:
          Get types ->  \{\{([^{]+)\}\} g

      For categories:
        Get cats -> \[\[Category:([\w\s]+)\]\] gi

      */

    });
  }

};

module.exports = pages;
