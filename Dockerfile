FROM ubuntu

# tzinfo インストール時にタイムゾーン入力を求められないようにする設定
ENV DEBIAN_FRONTEND=noninteractive

# apt系パッケージのインストール
RUN apt update -y
RUN apt upgrade -y
RUN apt install -y libssl-dev libreadline-dev libpq-dev postgresql zlib1g-dev build-essential git vim curl wget ruby-build libyaml-dev language-pack-ja tzdata

# タイムゾーンの設定
ENV TZ Asia/Tokyo
RUN echo "Asia/Tokyo" > /etc/timezone

# rbenv経由でruby3.2のインストール
RUN git clone https://github.com/sstephenson/rbenv.git ~/.rbenv && echo 'export PATH="$HOME/.rbenv/bin:$PATH"' >> ~/.bashrc && echo 'eval "$(rbenv init -)"' >> ~/.bashrc

# Rubyのインストール
RUN . ~/.bashrc && git clone https://github.com/sstephenson/ruby-build.git ~/.rbenv/plugins/ruby-build && rbenv install 3.2.0 && rbenv global 3.2.0

# 環境変数の設定
ENV _RAILS_DIR /rails_app
ENV PATH /share/bin:$PATH
ENV LANG ja_JP.UTF-8

# npmのセットアップ
RUN apt install -y npm nodejs
RUN npm install n -g && n stable && apt purge -y nodejs npm 
RUN npm install yarn -g

# bashログイン用の.bashrc読み込み設定を追加する
RUN echo "" >> /etc/bash.bashrc && echo "[[ -e /share/dotfiles/.bashrc ]] && . /share/dotfiles/.bashrc" >> /etc/bash.bashrc && echo "" >> /etc/bash.bashrc

