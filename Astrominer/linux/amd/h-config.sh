#!/usr/bin/env bash
# This code is included in /hive/bin/custom function

if [[ $CUSTOM_URL == wss* ]];
then
    WALLET=`echo $CUSTOM_TEMPLATE | cut -d . -f 1`
else
    WALLET=$CUSTOM_TEMPLATE
fi
echo -e "-r $CUSTOM_URL -w $WALLET $CUSTOM_USER_CONFIG" > $CUSTOM_CONFIG_FILENAME