var async = require('async');
var fs = require('fs');

var util = require('util')
var spawn = require('child_process').spawn

//this is the default for the swarmigin build script
riak_dir = '/home/swarmlicant/riak/';
	
riak_path = riak_dir+'bin/riak'
riak_admin_path = riak_dir+'bin/riak-admin'
riak_configs = riak_dir+'etc/'
riak_ring = riak_dir+'data/ring'

var trove = {};
module.exports = trove;


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
		if (code !== 0) {
			callback(code, stderr);
		} else {
			callback(code, stdout);
		}

	});
};


trove.config = function(config, m_callback) {
	var rust = require('rust')({
		config: './riak_configs/app.config',
		args: './riak_configs/vm.args'
	});
	//http://docs.basho.com/riak/latest/cookbooks/Basic-Cluster-Setup/
	async.series([
		function(callback) {
			rust.backend.setType(config.storage_backend, callback);
		},
		function(callback) {
			rust.setNodeName(config.master_name +'@' + config.host, callback);
		},
		function(callback) {
			rust.setPBIP(config.host, callback);
		},
		function(callback) {
			rust.setHostName(config.host, callback);
		}//,
		// function(callback) {
		// 	rust.setHTTPPort(config.port, callback);
		// }
	], function(err, results) {
		if (err) {
			m_callback('ERROR', 'error editing configuration:' + results);
		} else {
			var cmd = spawn('cp', ['./riak_configs/app.config', './riak_configs/vm.args', riak_configs]); // the second arg is the command options
			execute_command(cmd, m_callback);
		}

	});
};


trove.start_node = function(config, callback) {
	var cmd = spawn(riak_path, ['start']); // the second arg is the command options
	execute_command(cmd, callback);
}

trove.join_swarm = function(config, callback) {
	var cmd = spawn(riak_admin_path, ['cluster', 'join', config.master_name +'@' + config.master_host]); // the second arg is the command options
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

trove.remove_ring_data = function(callback) {
	var cmd = spawn('rm', ['-rf', riak_dir+'data/ring']); // the second arg is the command options
	execute_command(cmd, callback);
}

trove.killall_nodes = function(callback) {
	var cmd = spawn('killall', ['beam.smp']); // the second arg is the command options
	execute_command(cmd, callback);
}
