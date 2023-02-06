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

exit 0
