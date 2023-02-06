#!/bin/bash

cd ${_RAILS_DIR}
PID=`cat tmp/pids/server.pid 2>/dev/null`
[[ -n "$PID" ]] && kill $PID

exit
