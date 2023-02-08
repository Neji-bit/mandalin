#!/bin/bash

export PATH="$HOME/.rbenv/bin:$PATH"
eval "$(rbenv init -)"

cd ${_RAILS_DIR}
bin/dev >> log/foreman.log 2>> log/foreman.error.log &

exit
