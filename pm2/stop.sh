#!/bin/bash
echo "**** Runing stop.sh"
pm2 stop $1
pm2 save --force