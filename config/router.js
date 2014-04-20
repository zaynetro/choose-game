/**
 * Router setup
 *
 */

var express = require('express'),
    routes  = require('../routes/'),
    api     = require('../routes/api');


var router = express.Router();

/**
 * Basic functionality
 */
router.get('/',    routes.index);

router.get('/about', routes.about);

router.get('/game/:name',     routes.game);
router.get('/category/:name', routes.category);

// Remove
router.get( '/add', routes.addform);
router.post('/add', routes.addData);

/**
 * API + XHR requests
 */
router.all('/api*', function (req, res, next) {
  //if(!req.xhr) return res.send('Only xhr requests');

  next();
});
router.get('/api/game',       api.getRandom);
router.get('/api/game/:name', api.getGame);

module.exports = router;
