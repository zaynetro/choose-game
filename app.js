
/**
 * App.js
 * Server setup
 */

var express    = require('express'),
    app        = express(),
    path       = require('path'),
    bodyParser = require('body-parser'),
    router     = require(path.join(__dirname, 'config/router'));

//app.use(bodyParser);

var port = process.env.PORT || 3000;


// settings
app.disable('x-powered-by');
//app.set('port', port);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(express.static(path.join(__dirname, 'public')));

//app.use(express.favicon(__dirname + '/public/design/favicon.ico'));

// development only
if ('development' == app.get('env')) {
  //app.use(express.errorHandler());
}

// Register routes
app.use('/', router);

// Start the server
app.listen(port);
console.log('Running on :' + port);
