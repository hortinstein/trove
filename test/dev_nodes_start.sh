#!/bin/sh
##############################################################
#
# starts a development cluster for the node to try to join
#
##############################################################
rm -rf /tmp/home/hortinstein/riak_dev/*
rm -rf /home/hortinstein/riak_dev/dev/dev2/data/ring/*
rm -rf /home/hortinstein/riak_dev/dev/dev3/riak_dev/dev/dev3/data/ring/*
/home/hortinstein/riak_dev/dev/dev4/bin/riak start
/home/hortinstein/riak_dev/dev/dev3/bin/riak start
ps aux | grep beam
/home/hortinstein/riak_dev/dev/dev3/bin/riak-admin cluster join dev4@127.0.0.1
/home/hortinstein/riak_dev/dev/dev3/bin/riak-admin cluster plan
/home/hortinstein/riak_dev/dev/dev3/bin/riak-admin cluster commit