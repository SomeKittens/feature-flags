var mongoskin = require('mongoskin').db('localhost:27017/ff');
var config = require('../features');

exports.isAuthed = function(userAuth, authLevel) {
	if (authLevel === 'all') {
		return true;
	}
	return config.levels.indexOf(userAuth) >= config.levels.indexOf(authLevel);
};

exports.getUserAuth = function(req) {
	if (req.user) {
		return req.user.auth;
	} else if (req.session) {
		return req.session.auth || 'anon';
	}
	throw new Error('No auth found');
};

exports.insertRule = function(level, path) {
	// TODO: process wildcards here
	mongoskin.collection('urlRules').update({url: path}, {$set: { url: path, level: level }}, {upsert: true});
};