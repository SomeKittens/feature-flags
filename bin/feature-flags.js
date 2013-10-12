mongoskin = require('mongoskin').db('localhost:27017/ff');
var jade = require('jade');
var fs = require('fs');

var CLIENT = __dirname.replace('bin', 'client') + '/';

var helpers = require('../lib/helpers');
var config = require('../features');

var ruleCache = {};
var locals = {};

var router = function(req, res, next) {
	var url = req.url
		, userAuth = helpers.getUserAuth(req)
		, authLevelRequired;
		console.log(userAuth);
		userAuth = 'admin';
	if (/\/feature_flags.*/.test(url) && userAuth === 'admin') {
		// it's a request for us!
		if (url === '/feature_flags') {
			var data = jade.renderFile(CLIENT + 'ff.jade', {
				rules: ruleCache,
				levels: config.levels,
				host: req.get('host')
			});
			res.writeHead(200, {'Content-Type': 'text/html', 'Content-Length': data.length});
			res.write(data);
			res.end();
		} else if (!req.xhr) {
			// External resources for the feature_flags page
			var filename = url.replace('/feature_flags/', '');
			var contentType = filename.slice(filename.lastIndexOf('.') + 1);
			if (contentType === 'js') {
				contentType = 'JavaScript';
			}
			fs.readFile(CLIENT + filename, function(err, data) {
				if (err) return next(err);
				res.writeHead(200, {'Content-Type': 'text/' + contentType, 'Content-Length': data.length});
				res.write(data);
				res.end();
			});
		} else {
			// User has flipped a switch
			console.log(req.body);
			switch(req.body.section) {
				case 'rule':
					ruleCache[req.body.url] = {
						url: req.body.url,
						level: req.body.level
					};
					res.end();
					break;
				case 'locals':
				case 'user':
				default:
					console.log('hurrrrg');
					res.json(400, {status: 'Wrong section'});
			}
		}
	} else {
		// Check if the user's authorized to view this page
		authLevelRequired = helpers.matchUrl(url, ruleCache);
		if (authLevelRequired) {
			if (helpers.isAuthed(userAuth, authLevelRequired)) {
				res.locals._ff = locals;
				return next();
			}
			return next(new Error('Not authorized to view this URL'));
		} else {
			return next();
		}
	}
};

exports.requireLevel = function requireLevel(level, path) {
	// TODO: replace express syntax with Regex
	ruleCache[path] = {
		url: path,
		level: level
	};
	console.log(ruleCache);
	mongoskin.collection('urlRules').update({url: path}, {$set: { url: path, level: level }}, {upsert: true});
	return path;
};

exports.init = function() {
	// Pull the defaults from the database?
	return router;
};