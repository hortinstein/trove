var config = require('./test_config/trove.json');
var trove = require('../index.js');

var should = require('should')

describe('trove configure',function () {
	this.timeout(500 * 1000);
	it('should configure a node',function (done) {
		trove.config(config,function (e,r) {
			console.log(e,r);
			done();
		});
	});
	it('should start a riak process',function (done) {
		trove.start_node(config,function (e,r) {
			console.log(e,r);
			done();
		})
	});
	it('should ping a riak process',function (done) {
		trove.ping(function (e,r) {
			console.log(e,r);
			done();
		})
	});

	it('should stop a riak process',function (done) {
		trove.stop_node(function (e,r) {
			done();
		})
	});
})