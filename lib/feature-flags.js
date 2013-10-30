'use strict';

var mongoskin = require('mongoskin').db('localhost:27017/ff')
	, jade = require('jade')
	, fs = require('fs');

var CLIENT = __dirname.replace('lib', 'client') + '/';

var helpers = require('./helpers')
  , config = require('./defaultConfig');

var ruleCache = []
  , locals = {};

var router = function(req, res, next) {
	var url = req.path
		, userAuth = helpers.getUserAuth(req)
		, authLevelRequired;
		// TODO: customize the admin url
	if (/\/feature_flags.*/.test(url) && userAuth === 'admin') {
		// it's a request for us!
		if (url === '/feature_flags') {
			var data = jade.renderFile(CLIENT + 'ff.jade', {
				rules: ruleCache,
				levels: config.levels,
				locals: locals,
				host: req.get('host')
			});
			// Not using express here for future adaptability
			res.writeHead(200, {
				'Content-Type': 'text/html',
				'Content-Length': data.length
			});
			res.write(data);
			res.end();
		} else if (!req.xhr) {
			// External resources for the feature_flags page
			var filename = url.replace('/feature_flags/', '');
			var contentType = filename.userAuth.slice(filename.lastIndexOf('.') + 1);
			if (contentType === 'js') {
				contentType = 'JavaScript';
			}
			fs.readFile(CLIENT + filename, function(err, data) {
				if (err) {
					return next(err);
				}
				res.writeHead(200, {'Content-Type': 'text/' + contentType, 'Content-Length': data.length});
				res.write(data);
				res.end();
			});
		} else {
			// User has flipped a switch
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
			} else {
				// They're not allowed here, naughty naughty!
				if (authLevelRequired === 'admin') {
					return res.send(config.settings.adminRespCode, 'File not found');
				} else if (userAuth === 'anon' || userAuth === undefined) {
					return res.redirect('/login');
				} else {
					return res.send(config.settings.respCode, 'Not authorized');
				}
			}
		} else {
			return next();
		}
	}
};

exports.requireLevel = function(level, path) {
	path = '^' + path.replace(/:.*\//, '.*') + '$';
	ruleCache.push({
		url: path,
		level: level
	});
	mongoskin.collection('urlRules').update({url: path}, {$set: { url: path, level: level }}, {upsert: true});
	return path;
};

exports.init = function() {
	// Pull the defaults from the database
	return router;
};