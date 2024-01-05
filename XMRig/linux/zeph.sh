#!/bin/bash
filename='../.env'
worker='WORKER_NAME='
thread='THREADS='
n=1
while read line; do
if [[ "$line" =~ .*"$worker".* ]]; then
    IFS='='
    read -a strarr <<<"$line"
    WORKER_NAME=${strarr[1]}
fi
if [[ "$line" =~ .*"$thread".* ]]; then
    IFS='='
    read -a strarr <<<"$line"
    THREADS=${strarr[1]}
fi
n=$((n+1))
done < $filename

echo "*********** worker: ", $WORKER_NAME
echo "*********** threads: ", $THREADS

`pwd`/XMRig/linux/xmrig/build/xmrig -o zephyr.miningocean.org:5332 -u ZEPHsCQK7HxEuRP8pwNNQ4DhnGCJEyo9RKgtcrRAdGFNHCUhfP1Kpfxj2oTJkFkerY1cVoTeCnscEhcy9exD5oZUbXSmGSJe9nq.$WORKER_NAME --randomx-1gb-pages -a rx/0 -p x -k -t $THREADS

echo "mining..."