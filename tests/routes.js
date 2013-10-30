
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

exports.pants = function(req, res) {
	res.end('you are pants');
};

exports.login = function(req, res) {
	res.end('this is login');
};

exports.profile = function(req, res) {
	res.end('this is profile');
};

exports.addComment = function(req, res) {
	res.end('comment');
};

exports.admin = function(req, res) {
	res.end('you are admin');
};

exports.setLevel = function(req, res) {
	req.session.auth = req.params.level;
	res.end('you are now ' + req.params.level);
};