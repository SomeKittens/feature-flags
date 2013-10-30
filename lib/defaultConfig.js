/**
 * Default config for Feature Flags
 * If not provided, values from here will be used
 */

exports = module.exports = {
	// Anything given to a user at level X will
	// be implicitly granted to users at level > X
	// You can disable this by TODO
	// Possibly add 'all' and 'anon' levels?
	levels: {
		anon: 0,
		login: 1,
		paid: 2,
		admin: 999
	},
	// TODO: A way to say 'only at this level'
	locals: {
		anon: {},
		login: {
			userSettings: true,
			upgradePitch: true
		},
		paid: {
			upgradePitch: false
		},
		admin: {
			adminPanel: true
		},
		// Also can add locals by level
		1: {
			addComment: true
		}
	},
	// Routes configured here will be overwritten by requireLevel calls
	routes: {
		'/': {
			anon: true
		},
		'/login': {
			anon: true,
			login: false
		}
	},
	// These are the defaults
	// Only include these if you want something different
	settings: {
		// The HTTP error code to respond with when
		//   the user requests a page they don't have access to
		respCode: 403,
		// For security reasons, it may be a better idea to 404 admin urls
		adminRespCode: 404,
		// requireLevel calls don't overwrite the config above.
		configRoutesPriority: false
	}
};