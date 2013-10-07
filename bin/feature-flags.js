var jade = require('jade');
var fs = require('fs');
var mongoskin = require('mongoskin').db('localhost:27017/ff');

var helpers = require('../lib/helpers');
var config = require('../features');

var CLIENT = __dirname.replace('bin', 'client') + '/';

exports.router = function(req, res, next) {
	var url = req.url
		, userAuth = helpers.getUserAuth(req);
		console.log(userAuth);
		userAuth = 'admin';
	if (/\/feature_flags.*/.test(url) && userAuth === 'admin') {
		// it's a request for us!
		if (url === '/feature_flags') {
			console.log(req);
			mongoskin.collection('urlRules').find().toArray(function(err, rules) {
				var data = jade.renderFile(CLIENT + 'ff.jade', {
					rules: rules,
					levels: config.levels,
					host: req.get('host')
				});
				res.writeHead(200, {'Content-Type': 'text/html', 'Content-Length': data.length});
				res.write(data);
				res.end();
			});
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
					mongoskin.collection('urlRules').update({url: req.body.url}, {$set: {level: req.body.level}}, function(err) {
						if (err) return res.end(err);

						res.end();
					});
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
		return mongoskin.collection('urlRules').findOne({ url: req.url }, function(err, rule) {
			if (err) return next(err);
			if (!rule) return next();

			if (helpers.isAuthed(userAuth, rule.level)) {
				return mongoskin.collection('locals').findOne({}, function(err, locals) {
					if (err) return next(err);

					res.locals._ff = locals;
					return next();
				});
			}
			return next(new Error('Not authorized to view this URL'));
		});
	}
};

exports.requireLevel = function requireLevel(level, path) {
	// We need the url here
	helpers.insertRule(level, path);
	return path;
};

exports.init = function(app) {/*
	console.log(app.routes.get[0]);
	console.log('hya');
	app.routes.get.forEach(function(route) {
		route.callbacks.forEach(function(callback) {
			console.log(callback.toString());
		});
	});*/
};