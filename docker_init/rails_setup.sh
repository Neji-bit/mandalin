#!/bin/sh

eval "$(rbenv init -)"

# Bundler経由でのrailsインストール
cd $_RAILS_DIR
bundle init
cp /docker_init/Gemfile.enable_rails ./Gemfile
bundle install --path vendor/bundle
bundle exec rails new -f .
cp /docker_init/Gemfile.enable_rails ./Gemfile
rm ./Gemfile.lock
bundle install --path vendor/bundle
bundle exec bin/rails importmap:install

# 全て完了後、以下の手順を辿れば Railsページ が確認可能
# 1. コンテナを起動する
# 2. コンテナにbashでログインする
# 3. /home/rails_dev に移動
# 4. rails サーバーを起動
 
exit 0
