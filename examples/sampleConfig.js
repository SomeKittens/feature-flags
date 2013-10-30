/**
 * Example config for Feature Flags
 */

exports = module.exports = {
	levels: {
		anon: 0,
		login: 1,
		paid: 2,
		admin: 999
	},
	config: {
		respCode: 403,
		// For security reasons, it may be a better idea to 404 admin urls
		adminRespCode: 404,
		// requireLevel calls don't overwrite the config above.
		configRoutesPriority: false
	}
};