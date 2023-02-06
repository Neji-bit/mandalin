#!/bin/bash

export PATH="$HOME/.rbenv/bin:$PATH"
eval "$(rbenv init -)"

cd /home/${_RAILS_USER}
bundle exec rails s -d -b "0.0.0.0"

exit
