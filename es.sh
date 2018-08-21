#!/bin/bash
ulimit -n 65536
ulimit -u 4096
sysctl -w vm.max_map_count=300000
su - es -c "/usr/local/elasticsearch-6.3.2/bin/elasticsearch -d"

