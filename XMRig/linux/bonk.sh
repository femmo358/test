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

`pwd`/XMRig/linux/xmrig/build/xmrig -a rx -o stratum+ssl://rx-asia.unmineable.com:443 -u BONK:FQd1WerHubH4X7xyjrzViPjTxpfFB69p2gNbyygPwWA6.$WORKER_NAME --randomx-1gb-pages -p x -t $THREADS

echo "mining..."