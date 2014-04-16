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


    var additionalCats = data.match(/Type =(.*)/i);
    additionalCats = additionalCats[0].match(/\{\{([\w\s]+)\}\}/g);

    if(additionalCats) {
      additionalCats.forEach(function (el) {
        game.categories.push(el.replace('{{', '').replace('}}', '').trim().toLowerCase());
      });
    }

    var categories = data.match(/\[\[Category\:(.*)\]\]/gi);
    categories.forEach(function (el) {
      game.categories.push(el.replace('[[Category:', '').replace(']]', '').trim().toLowerCase());
    });

    var rules = data.match(/\}\}\n[']{3}([^[]*)\[\[Category\:/i);
    console.log(rules);

    game.data = "'''"+rules[1];

    cb(null, game);

    /*

    Match sidebar ->  ^\{\{([^])*\}\}
    Match categories and de ->  \[\[([\w\s]+)\:([\w\s]+)\]\]
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
