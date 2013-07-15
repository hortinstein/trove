#!/bin/sh
##############################################################
#
# starts a development cluster for the node to try to join
#
##############################################################

cd ~/riak_dev/dev/;ls
dev1/bin/riak start
dev2/bin/riak start
dev3/bin/riak start
dev4/bin/riak start
ps aux | grep beam
dev2/bin/riak-admin cluster join dev1@127.0.0.1
dev3/bin/riak-admin cluster join dev1@127.0.0.1
dev4/bin/riak-admin cluster join dev1@127.0.0.1
dev2/bin/riak-admin cluster plan
dev2/bin/riak-admin cluster commit