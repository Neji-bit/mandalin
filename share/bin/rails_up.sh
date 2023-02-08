#!/bin/bash

export PATH="$HOME/.rbenv/bin:$PATH"
eval "$(rbenv init -)"

cd ${_RAILS_DIR}
bundle install
bundle exec rails s -d -b "0.0.0.0" -p 4000

exit
