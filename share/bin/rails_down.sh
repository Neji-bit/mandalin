#!/bin/bash

cd /home/${_RAILS_USER}
PID=`cat tmp/pids/server.pid 2>/dev/null`
[[ -n "$PID" ]] && kill $PID

exit
