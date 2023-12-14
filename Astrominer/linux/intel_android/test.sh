#!/bin/bash
echo "-------> Start mining"
while :; do
    ./astrominer -w deroi1qyzlxxgq2weyqlxg5u4tkng2lf5rktwanqhse2hwm577ps22zv2x2q9pvfz92x6tzanys7zd34yqa08t93 -m 7 -r community-pools.mysrv.cloud:10300 -r1 dero.rabidmining.com:10300 -r2 dero.friendspool.club:10300 -p rpc;
    sleep 5;
done
