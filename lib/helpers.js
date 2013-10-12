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
		// TODO: When depending on user cookies, this is insecure
		return req.session.auth || 'anon';
	}
	throw new Error('No auth found');
};

exports.matchUrl = function(url, paths) {
	console.log(paths[url]);
	Object.keys(paths).forEach(function(path) {
		if (new RegExp(path).test(url)) return paths[path];
	});
	return false;
};