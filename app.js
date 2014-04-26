/**
 * App.js
 * Server setup
 */

var express  = require('express'),
    app      = express(),
    path     = require('path'),
    mongoose = require('mongoose');


var config   = require(path.join(__dirname, 'config/config')),
    port     = process.env.PORT || 3000;

// DB connection
var connect = function () {
  mongoose.connect(config.db);
};

connect();

mongoose.connection.on('error', function (err) {
  console.log(err);
});

mongoose.connection.on('disconnected', function (err) {
  connect();
});

require(path.join(__dirname, 'helpers/models/db'));

// settings
app
  .disable('x-powered-by')
  .set('port', port)
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'jade')

  .use(express.static(path.join(__dirname, 'public')))
//app.use(express.favicon(__dirname + '/public/design/favicon.ico'));
  .use(require('body-parser')())
  .use(require('cookie-parser')())
  .use(require('express-session')({ secret : config.app.name }));

// development only
if ('development' == app.get('env')) {
  //app.use(express.errorHandler());
}

// Register routes
require('./config/router')(app);

// Start the server
app.listen(port);
console.log('Server is running on port ' + port);
