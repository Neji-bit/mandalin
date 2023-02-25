FROM ubuntu
ADD ./docker_init/* /docker_init/
ENV _RAILS_DIR /rails_app
ENV PATH /share/bin:$PATH
ENV TZ Asia/Tokyo
ENV LANG ja_JP.UTF-8
# tzinfo インストール時にタイムゾーン入力を求められないようにする設定
ENV DEBIAN_FRONTEND=noninteractive
RUN /docker_init/base_setup.sh
