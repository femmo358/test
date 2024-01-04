#!/bin/bash
THREADS=14
WORKER_NAME=$(cat /proc/sys/kernel/hostname)
`pwd`/XMRig/linux/xmrig/build/xmrig -a ghostrider --url stratum-asia.rplant.xyz:17054 --tls --user RisZ9viLY8jsULoB9a1xxdxAZAV5LLyboj.$WORKER_NAME --randomx-1gb-pages -p x -t $THREADS