#!/bin/bash
which browser-sync || npm install -g browser-sync
cd $_RAILS_DIR
browser-sync start --config /share/bin/bs-config.js &
exit
