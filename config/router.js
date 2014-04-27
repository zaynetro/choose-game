/**
 * Router setup
 *
 */

var express  = require('express'),
    routes   = require('../routes/'),
    api      = require('../routes/api'),
    manage   = require('../routes/manage'),
    mongoose = require('mongoose');

function ensureAuthenticated(req, res, next) {
  if(req.session.user) {
    mongoose.model('Pass').findById(req.session.user, function (err, pass) {
      if(err) console.log(err);

      if(pass) {
        next();
      } else {
        res.redirect('/0');
      }
    });
  } else {
    res.redirect('/0');
  }
}

module.exports = function (app) {

  var pageRouter = express.Router();

  pageRouter
    // Basic functionality
    .get('/',      routes.index)
    .get('/about', routes.about)

    // Games
    .get('/game/:name',     routes.game)

    // Categories
    .get('/category',       routes.categories)
    .get('/category/:name', routes.category)

    // Login
    .get( '/0', routes.loginPage)
    .post('/0', routes.login);

  var manageRouter = express.Router();

  manageRouter
    // Manage
    .use(ensureAuthenticated)
    .get('/',     manage.page)
    .post('/add', manage.addLink);

  var apiRouter = express.Router();

  apiRouter
    /**
     * API + XHR requests
     */
    .use(function (req, res, next) {
      //if(!req.xhr) return res.send('Only xhr requests');

      next();
    })
    .get( '/game',       api.getRandom)
    .get( '/game/:name', api.getGame)
    .post('/add/all',    api.addAll);

  app
    .use('/',   pageRouter)
    .use('/1',  manageRouter)
    .use('/api', apiRouter);

};
