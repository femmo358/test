#!/usr/bin/env bash
# MMPOS agent stats script. This file is used to fetch stats from custom miners or miners without natively added API.
# Only this file is relevant for agent. If you have additional scripts, include them here.
# MMPOS agent will call that script regularly when collecting stats. 
# credit to: dojo76, ddobreff
cd dirname $0
. h-manifest.conf
stats_raw=$(nc -w 1 localhost 60666)

get_miner_stats() {

    HASH=$(echo {$stats_raw} | jq -r '.hs')
    ACCEPTED=$(echo {$stats_raw} | jq -r '.ar' | cut -d ',' -f1 | sed 's/[][]//g')
    REJECTED=$(echo {$stats_raw} | jq -r '.ar' | cut -d ',' -f2 | sed 's/[][]//g')
    UNITS=$(echo {$stats_raw} | jq -r '.hs_units' | sed 's/[][]//g')
    VERSION=$(echo {$stats_raw} | jq -r '.ver' | sed 's/[][]//g')
    stats=$(jq -nc \
            --arg busid "cpu" \
            --argjson hash "$HASH" \
            --arg units "$UNITS" \
            --arg ac "$ACCEPTED" \
            --arg rj "$REJECTED" \
            --arg miner_version "$VERSION" \
            --arg miner_name "$CUSTOM_NAME" \
        '{busid: [$busid], $hash, $units, ar: [$ac, $rj], $miner_version, $miner_name}')
    echo $stats
}

get_miner_stats