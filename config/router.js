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

router.get('/game/:name', routes.game);

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
router.get('/api/game/randomName', api.getRandomName);

module.exports = router;
