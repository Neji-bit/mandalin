#!/bin/sh

# ubuntu上でrailsのセットアップ完了までを実行するスクリプト

# apt系パッケージのインストール
apt update -y
apt upgrade -y
apt install -y libssl-dev libreadline-dev zlib1g-dev build-essential git vim curl wget ruby-build libyaml-dev

# rbenv経由でruby3.2のインストール
git clone https://github.com/sstephenson/rbenv.git ~/.rbenv
echo 'export PATH="$HOME/.rbenv/bin:$PATH"' >> ~/.bashrc
echo 'eval "$(rbenv init -)"' >> ~/.bashrc
. ~/.bashrc
git clone https://github.com/sstephenson/ruby-build.git ~/.rbenv/plugins/ruby-build
rbenv install 3.2.0
rbenv global 3.2.0

# railsリソース置き場としてのユーザーを作成
adduser rails_dev --disabled-password --gecos ""
# echo rails_dev:'mypassword' | /usr/sbin/chpasswd

# npmのセットアップ
apt install -y npm nodejs
npm install n -g
n stable
apt purge -y nodejs npm
npm install yarn -g

# Bundler経由でのrailsインストール
cd /home/rails_dev/
bundle init
cp /docker_init/Gemfile.enable_rails ./Gemfile
bundle install --path vendor/bundle
bundle exec rails new -f .
cp /docker_init/Gemfile.enable_rails ./Gemfile
rm ./Gemfile.lock
bundle install --path vendor/bundle

# 全て完了後、以下の手順を辿れば Railsページ が確認可能
# 1. コンテナを起動する
# 2. コンテナにbashでログインする
# 3. /home/rails_dev に移動
# 4. rails サーバーを起動
 
exit 0
