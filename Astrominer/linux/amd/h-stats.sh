#!/usr/bin/env bash

. /hive/miners/custom/$CUSTOM_MINER/h-manifest.conf
stats_raw=`nc -w 1 localhost 60666`

if [[ $? -ne 0 || -z $stats_raw ]]; then
    echo -e "${YELLOW}Failed to read $miner from localhost:44000${NOCOLOR}"
else
    local temp=`/hive/sbin/cpu-temp`
    if [[ $temp == "null" ]]; then
        temp=0      
    fi
    local khs=`echo \{$stats_raw\} | jq -r '.hs' | sed 's/[][]//g'`    
    stats=`echo \{$stats_raw,\"temp\":[$temp]\}`
fi

[[ -z $khs ]] && khs=0
[[ -z $stats ]] && stats="null"