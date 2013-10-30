'use strict';

var config = require('./defaultConfig');

exports.isAuthed = function(userAuth, authLevel) {
	if (authLevel === 'all') {
		return true;
	}
	return config.levels[userAuth] >= config.levels[authLevel];
};

exports.getUserAuth = function(req) {
	if (req.user) {
		return req.user.auth;
	} else if (req.session) {
		// TODO: When depending on user cookies, this is insecure
		return req.session.auth || 'anon';
	}
	throw new Error('No auth found');
};

exports.matchUrl = function(url, paths) {
	// Boring for so we can return properly
	for ( var i = 0; i < paths.length; i++ ) {
		if (new RegExp(paths[i].url).test(url)) {
			return paths[i].level;
		}
	}
	return false;
};