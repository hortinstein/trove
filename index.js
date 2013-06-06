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
		} ,
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
}