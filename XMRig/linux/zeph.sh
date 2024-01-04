#!/bin/bash
THREADS=14
WORKER_NAME=$(cat /proc/sys/kernel/hostname)
`pwd`/XMRig/linux/xmrig/build/xmrig -o zephyr.miningocean.org:5332 -u ZEPHsCQK7HxEuRP8pwNNQ4DhnGCJEyo9RKgtcrRAdGFNHCUhfP1Kpfxj2oTJkFkerY1cVoTeCnscEhcy9exD5oZUbXSmGSJe9nq.$WORKER_NAME --randomx-1gb-pages -a rx/0 -p x -k -t $THREADS