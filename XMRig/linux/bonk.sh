#!/bin/bash
THREADS=6
WORKER_NAME=$(cat /proc/sys/kernel/hostname)
`pwd`/XMRig/linux/xmrig/build/xmrig -a rx -o stratum+ssl://rx-asia.unmineable.com:443 -u BONK:FQd1WerHubH4X7xyjrzViPjTxpfFB69p2gNbyygPwWA6.$WORKER_NAME --randomx-1gb-pages -p x -t $THREADS
