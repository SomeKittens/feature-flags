'use strict';

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , ff = require('../');
  // TODO: See if this works
  //, requireLevel = require('feature-flags').requireLevel;

var app = express();

app.configure(function() {
  app.set('port', 3871);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('psssssssst'));
  app.use(express.session());
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(ff.init());
  app.use(app.router);
  app.use(express.errorHandler());
});

app.get('*', function(req, res, next) {
  console.log('Accessing ' + req.url + ' with a level of ' + req.session.auth);
  next();
});

app.get(ff.requireLevel('anon', '/setLevel'), function(req, res) {
  req.session.auth = req.query.level;
  res.end('Level set to: ' + req.query.level);
});

app.get(ff.requireLevel('all', '/'), routes.index);
app.get(ff.requireLevel('all', '/login'), routes.login);
app.get(ff.requireLevel('login', '/profile'), routes.profile);
app.get(ff.requireLevel('login', '/posts/:postName/addComment'), routes.addComment);
app.get(ff.requireLevel('admin', '/admin'), routes.admin);

if (require.main === module) {
  http.createServer(app).listen(app.get('port'), function(){
    console.log('Feature Flags test server listening on port ' + app.get('port'));
  });
} else {
  module.exports = app;
}
