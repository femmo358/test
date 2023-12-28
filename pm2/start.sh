#!/bin/bash
pm2 start $1
pm2 save --force