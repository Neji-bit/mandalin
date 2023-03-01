#!/bin/bash

# このスクリプトはdocker-composeでコールされ、最後のbin/devが実行しっぱなしになる。

export PATH="$HOME/.rbenv/bin:$PATH"
eval "$(rbenv init -)"

# 
cd ${_RAILS_DIR}
rm tmp/pids/server.pid > /dev/null 2>&1
bin/dev >> log/foreman.log 2>> log/foreman.error.log

exit
