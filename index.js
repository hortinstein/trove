var async = require('async');
var fs = require('fs');

var trove = {};
module.exports = trove;

trove.config = function(config, m_callback) {
	var rust = require('rust')({
		config: './riak_configs/app.config',
		args: './riak_configs/vm.args'
	});
	async.series([
		function(callback) {
			rust.setHostName(config.host, callback);
		},
		function(callback) {
			rust.setHandoffPort(config.port + 1, callback);
		},
		function(callback) {
			rust.backend.setType(config.storage_backend, callback);
		},
		function(callback) {
			rust.setNodeName(config.name + '@' + config.host, callback);
		},
		function(callback) {
			rust.setHTTPPort(config.port, callback);
		}
	], function(err, results) {
		m_callback(err, results);
	});
};

trove.start_node = function(config, callback) {
	var util = require('util'),
		spawn = require('child_process').spawn

	if (config.master === (config.name + '@' + config.host)) {
		console.log('master');
		var cmd = spawn('riak', ['start']); // the second arg is the command options
	} else {
		console.log('joiner');
		var cmd = spawn('riak', ['join', config.master]); // the second arg is the command options
	};

	cmd.stdout.on('data', function(data) { // register one or more handlers
		console.log('stdout: ' + data);
	});

	cmd.stderr.on('data', function(data) {
		console.log('stderr: ' + data);
	});

	cmd.on('exit', function(code) {
		console.log('child process exited with code ' + code);
		callback();
	});
}