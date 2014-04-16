/**
 * App.js
 * Server setup
 */

var express  = require('express'),
    app      = express(),
    path     = require('path'),
    mongoose = require('mongoose'),
    router   = require(path.join(__dirname, 'config/router')),
    config   = require(path.join(__dirname, 'config/config')),
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
app.disable('x-powered-by');
app.set('port', port);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(express.static(path.join(__dirname, 'public')));
//app.use(express.favicon(__dirname + '/public/design/favicon.ico'));
app.use(require('body-parser')());

// development only
if ('development' == app.get('env')) {
  //app.use(express.errorHandler());
}

// Register routes
app.use('/', router);

// Start the server
app.listen(port);
console.log('Running on :' + port);
