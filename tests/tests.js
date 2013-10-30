'use strict';

/* global describe */
/* global it */
/* global beforeEach */


var request = require('supertest')
	, Browser = require('zombie')
	, expect = require('chai').expect
	, app = require('./app');

var browser;

// Load basic users
// Basic level - No addtional configuration
describe('route limitations', function() {
	// Use supertest here, only need to check response codes and/or redirect
	describe('anon', function() {
		it('allows homepage', function(done) {
			request(app)
				.get('/')
				.expect(200, done);
		});
		it('allows /login', function(done) {
			request(app)
				.get('/login')
				.expect(200, done);
		});
		it('redirects anon to login for existing urls', function(done) {
			request(app)
				.get('/profile')
				.expect(302, done);
		});
		it('sends a 404 for admin-only urls', function(done) {
			request(app)
				.get('/admin')
				.expect(404, done);
		});
		it('even blocks wildcards', function(done) {
			request(app)
				.get('/posts/a-basic-post/addComment')
				.expect(302, done);
		});
		it('ignores requests for /feature_flags', function(done) {
			request(app)
				.get('/feature_flags')
				.expect(404, done);
		});
		it('works with GET parameters', function(done) {
			request(app)
				.get('/profile?a=b')
				.expect(302, done);
		});
	});
	describe('login', function() {
		beforeEach(function(done) {
			browser = new Browser({ silent: true });
			browser.visit('http://localhost:3871/setLevel?level=login', done);
		});
		it('allows visiting homepage', function(done) {
			browser.visit('http://localhost:3871', function() {
				expect(browser.statusCode).to.equal(200);
				done();
			});
		});
		it('allows visiting profile', function(done) {
			browser.visit('http://localhost:3871/profile', function() {
				expect(browser.statusCode).to.equal(200);
				done();
			});
		});
		it('sends a 404 when restricted', function(done) {
			browser.visit('http://localhost:3871/admin', function() {
				expect(browser.statusCode).to.equal(404);
				done();
			});
		});
	});
	describe('admin', function() {
		beforeEach(function(done) {
			browser = new Browser({ silent: true });
			browser.visit('http://localhost:3871/setLevel?level=admin', done);
		});
		it('allows visiting homepage', function(done) {
			browser.visit('http://localhost:3871', function() {
				expect(browser.statusCode).to.equal(200);
				done();
			});
		});
		it('allows visiting admin page', function(done) {
			browser.visit('http://localhost:3871/admin', function() {
				expect(browser.statusCode).to.equal(200);
				done();
			});
		});
		it('allows visiting feature_flags', function(done) {
			browser.visit('http://localhost:3871/feature_flags', function() {
				expect(browser.statusCode).to.equal(200);
				done();
			});
		});
	});
});

describe('locals', function() {
	describe('login', function() {
		it.skip('shows user settings', function(done) {

		});
		it.skip('shows the pitch to upgrade', function(done) {

		});
	});
	describe('paid', function() {
		it.skip('shows user settings', function(done) {

		});
		it.skip('does not show upgrade pitch', function(done) {

		});
	});
	describe('admin', function() {
		it.skip('shows admin panel', function(done) {

		});
	});
});