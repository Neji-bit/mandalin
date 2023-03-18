#!/bin/sh

# コンテナ新規作成時の一連の作業

eval "$(rbenv init -)"

# reactインストール
yarn add react react-dom html-react-parser react-markdown remark-gfm rehype-raw rehype-sanitize

# Bundler経由でのrailsインストール
cd $_RAILS_DIR
bundle init
bundle install --path vendor/bundle
bundle exec rails new -f .
rm ./Gemfile.lock
bundle install --path vendor/bundle
bundle lock --add-platform x86_64-linux
# bundle exec bin/rails importmap:install # 二度目以降は不要な作業のためコメントアウト

# DB作成
bundle exec rails db:create

exit 0
