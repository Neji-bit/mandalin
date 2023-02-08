#!/bin/bash

PGID=`ps --no-headers -o pgid -C foreman`
[[ -n "$PGID" ]] && pkill -g $PGID

exit
