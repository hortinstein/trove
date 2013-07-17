#!/bin/sh
##############################################################
#
# starts a development cluster for the node to try to join
#
##############################################################
rm -rf /home/hortinstein/riak_dev/dev/dev2/riak_dev/dev/dev2/data/ring/*
rm -rf /home/hortinstein/riak_dev/dev/dev3/riak_dev/dev/dev2/data/ring/*
/home/hortinstein/riak_dev/dev/dev2/bin/riak start
/home/hortinstein/riak_dev/dev/dev3/bin/riak start
ps aux | grep beam
/home/hortinstein/riak_dev/dev/dev3/bin/riak-admin cluster join dev2@127.0.0.1
/home/hortinstein/riak_dev/dev/dev3/bin/riak-admin cluster plan
/home/hortinstein/riak_dev/dev/dev3/bin/riak-admin cluster commit