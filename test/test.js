var config = require('./test_config/trove.json');
var trove = require('../index.js');
var should = require('should')
var os = require('os');
var spawn = require('child_process').spawn

it('should alter config for local testing of node', function(done) {
	config.host = os.networkInterfaces().eth0[0].address; //should check here to ensure ip4
	config.master = config.host;
	console.log("Node IP: " + config.host);
	done();
	
});

describe('shelled commands for mx',function () {
	it('should set ulimit to 4096', function(done) {
		trove.set_ulimit(4096,function(e, r) {
			e.should.equal(0);
			done();
		})
	});
	
	it('should remove old ring data', function(done) {
		trove.remove_ring_data(function(e, r) {
			e.should.equal(0);
			done();
		})
	});
});

describe('riak command processes', function() {
	this.timeout(500 * 1000);
	it('should start a trove', function(done) {
		trove.start_trove(config, function(e, r) {
			e.should.equal(0);
			done();
		})
	});
	it('should fail to start a riak process since one is running', function(done) {
		trove.start_node(config, function(e, r) {
			e.should.not.equal(0);
			done();
		})
	});
	it('should ping a riak process', function(done) {
		trove.ping(function(e, r) {
			e.should.equal(0);
			done();
		})
	});
	it('should provide riak processes stats', function(done) {
		trove.status(function(e, r) {
			done();
		})
	});

	it('should stop a riak process and emit the event', function (done) {
		trove.on('error',function (error) {
			done();
		})
		trove.stop_node(function(e, r) {
			e.should.equal(0);
		})
	});
	it('should fail at pinging stopped riak process', function (done) {
		trove.ping(function(e, r) {
			e.should.equal(1);
			done();
		})
	});

	it('should fail at killing raw erlang processes representing riak nodes', function (done) {
		trove.killall_nodes(function(e, r) {
			e.should.equal(1);
			done();
		})
	});
});