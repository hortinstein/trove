var async = require('async');
var fs = require('fs');
var util = require('util')
var spawn = require('child_process').spawn
var events = require('events');
var request = require('request');
//this is the default for the swarmigin build script
var riak_dir = '/home/swarmlicant/riak/';
	
var riak_path = riak_dir+'bin/riak';
var riak_admin_path = riak_dir+'bin/riak-admin';
var riak_configs = riak_dir+'etc/';
var riak_ring = riak_dir+'data/ring';
var trove_config = '';
//var trove = {};
var trove = new events.EventEmitter();
module.exports = trove;



var execute_command = function(cmd, callback) {
	var stdout = '';
	var stderr = '';
	var data = ''
	cmd.stdout.on('data', function(data) {
		stdout = stdout + data;
	});

	cmd.stderr.on('data', function(data) {
		stderr = stderr + data;
	});

	cmd.on('exit', function(code) {
		if (code !== 0) {
			callback(code, stderr);
		} else {
			callback(code, stdout);
		}

	});
};

//this may be called from a function or executed on require with set interval 
// emits; 'error', 'log' 
var maintain = function(callback){
	trove.ping(function (e,r) {
		if (e){
			console.log(e,r);
			trove.emit('error', 'node is node responding to pings')
		}
	});

}
trove.start_trove = function(config, callback) {
	trove_config = config;
	trove.config(config,function (e,r) {
		if (e){
			callback('ERROR',e);
		} else{
			trove.start_node(config,function (e,r) {
				//needs to check and see if it is already part or can join the node
				callback(e,r);
			});
			setInterval(maintain,5000);
		}
	});
	
}

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

trove.set_ulimit = function(ulimit,callback) {
	var cmd = spawn('bash', ['-c', 'ulimit', '-n', ulimit]); // the second arg is the command options
	execute_command(cmd, callback);
};

trove.start_node = function(config, callback) {
	var cmd = spawn(riak_path, ['start']); // the second arg is the command options
	execute_command(cmd, callback);
};

trove.join_swarm = function(config, callback) {
	var cmd = spawn(riak_admin_path, ['cluster', 'join', config.master_name +'@' + config.master_host]); // the second arg is the command options
	execute_command(cmd, callback);
};
trove.cluster_plan = function(config, callback) {
	var cmd = spawn(riak_admin_path, ['cluster', 'plan']); // the second arg is the command options
	execute_command(cmd, callback);
};
trove.cluster_commit = function(config, callback) {
	var cmd = spawn(riak_admin_path, ['cluster', 'cluster_commit']); // the second arg is the command options
	execute_command(cmd, callback);
};

trove.ping = function(callback) {
	var cmd = spawn(riak_path, ['ping']); // the second arg is the command options
	execute_command(cmd, callback);
};


trove.status = function(callback){
    request.get({
		uri: 'http://'+trove_config.host+':'+trove_config.port+'/stats',
		json:true
	},function  (e,r,o) {
		callback(e,o);
	});
};

trove.stop_node = function(callback) {
	var cmd = spawn(riak_path, ['stop']); // the second arg is the command options
	execute_command(cmd, callback);
};

trove.remove_ring_data = function(callback) {
	var cmd = spawn('rm', ['-rf', riak_dir+'data/ring']); // the second arg is the command options
	execute_command(cmd, callback);
}
;
trove.killall_nodes = function(callback) {
	var cmd = spawn('killall', ['beam.smp']); // the second arg is the command options
	execute_command(cmd, callback);
};
