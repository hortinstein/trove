var async = require('async');
var fs = require('fs');

var util = require('util')
var	spawn = require('child_process').spawn


var riak_path = '/home/riak-1.3.0/bin/riak'
var riak_vm_args = '/home/riak-1.3.0/etc/vm.args'
var riak_app_config = '/home/riak-1.3.0/etc/app.config'


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

var execute_command = function(cmd, callback) {
	var stdout = '';
	var stderr = '';
	cmd.stdout.on('data', function(data) {
		console.log('stdout: ' + data);
		stdout = stdout + data;
	});

	cmd.stderr.on('data', function(data) {
		console.log('stderr: ' + data);
		stderr = stderr + data;
	});

	cmd.on('exit', function(code) {
		console.log('child process exited with code ' + code);
		if (code !== 0){ 
			callback(code,stderr); 
		} else {
			callback(code,stdout);	
		}
		
	});
};

trove.start_node = function(config, callback) {
	if (config.master === (config.name + '@' + config.host)) {
		console.log('master');
		var cmd = spawn(riak_path, ['start']); // the second arg is the command options
	} else {
		console.log('joiner');
		var cmd = spawn(riak_path, ['join', config.master]); // the second arg is the command options
	};
	execute_command(cmd, callback);
}

trove.ping = function(callback) {
	var cmd = spawn(riak_path, ['ping']); // the second arg is the command options
	execute_command(cmd, callback);
}

trove.stop_node = function(callback) {
	var cmd = spawn(riak_path, ['stop']); // the second arg is the command options
	execute_command(cmd, callback);
}