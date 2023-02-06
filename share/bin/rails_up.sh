#!/bin/bash

export PATH="$HOME/.rbenv/bin:$PATH"
eval "$(rbenv init -)"

cd ${_RAILS_DIR}
bundle exec rails s -d -b "0.0.0.0"

exit
