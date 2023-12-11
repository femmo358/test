#!/usr/bin/env bash

echo "Cleaning up previous astrominer instance..."
killall -9 astrominer > /dev/null 2>&1
echo "Done... Starting astrominer, it may take a while to show the log, please be patience..."
. h-manifest.conf

./astrominer $(< $CUSTOM_CONFIG_FILENAME) $@ 2>&1 | tee $CUSTOM_LOG_BASENAME.log