#!/bin/sh
##############################################################
#
# starts a development cluster for the node to try to join
#
##############################################################
rm -rf /tmp/home/hortinstein/riak_dev/*
rm -rf /tmp/home/hortinstein/riak
cp -r /home/hortinstein/riak_install/riak-1.4.0/dev/ /home/hortinstein/riak_dev/
cp -r /home/hortinstein/riak_install/riak-1.4.0/rel/riak/ /home/hortinstein/
/home/hortinstein/riak_dev/dev/dev1/bin/riak start
/home/hortinstein/riak_dev/dev/dev2/bin/riak start
/home/hortinstein/riak_dev/dev/dev2/bin/riak-admin cluster join dev1@127.0.0.1
/home/hortinstein/riak_dev/dev/dev2/bin/riak-admin cluster plan
/home/hortinstein/riak_dev/dev/dev2/bin/riak-admin cluster commit