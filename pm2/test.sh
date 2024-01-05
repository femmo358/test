#!/bin/bash
filename='../.env'
string='WORKER_NAME='
n=1
while read line; do
if [[ "$line" =~ .*"$string".* ]]; then
    IFS='='
    read -a strarr <<<"$line"
    WORKER_NAME=${strarr[1]}
fi
n=$((n+1))
done < $filename
