/**
 * Router setup
 *
 */

var express = require('express'),
    routes  = require('../routes/');


var router = express.Router();

router.get('/',    routes.index);

router.get( '/add', routes.addform);
router.post('/add', routes.addData);

module.exports = router;
