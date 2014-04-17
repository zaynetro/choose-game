/**
 * Get game data from it's page
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

module.exports = function (url, cb) {
  if(!url || !url.length) {
    cb(new Error('Wrong Url'));
    return false;
  }

  getContent(url, function (err, w) {
    if(err) return cb(err);

    var game = {
      name : '',
      categories : [],
      data : ''
    };

    game.name = w.$('#firstHeading').text().trim();

    var data = w.$('#wpTextbox1').val();

    var sidebar    = data.match(/^\{\{([^])*\}\}/);
        categories = data.match(/\[\[([\w\s]+)\:([\w\s]+)\]\]/g);

    sidebar = (sidebar && sidebar.length) ? sidebar[0] : '';
    categories = (categories && categories.length) ? categories : [data.length];

    var rules = data.substring(sidebar.length, data.indexOf(categories[0]));
    rules = rules.trim();

    var cats = [];

    categories.forEach(function (el) {
      var tmp = el.match(/\[\[Category:([\w\s]+)\]\]/i);

      if(tmp && tmp.length) cats.push(tmp[1].toLowerCase());
    });

    var morecats = sidebar.match(/Type =(.*)/i);

    if(morecats && morecats.length) {
      var types = morecats[0].match(/\{\{([^{]+)\}\}/g);
      if(types) {
        types.forEach(function (el) {
          cats.push(el.substring(2, el.length - 2).toLowerCase());
        });
      }
    }

    game.data = rules;
    game.categories = cats;

    cb(null, game);

    /*

    Match sidebar ->  ^\{\{([^])*\}\}
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
};
