/**
 * Router setup
 *
 */

var express = require('express'),
    routes  = require('../routes/'),
    api     = require('../routes/api'),
    manage  = require('../routes/manage');

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
    .get('/category/:name', routes.category);

  var manageRouter = express.Router();

  manageRouter
    // Manage
    .get('/',     manage.page)
    .post('/add', manage.addLink);

  var apiRouter = express.Router();

  apiRouter
    /**
     * API + XHR requests
     */
    .all('/*', function (req, res, next) {
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
