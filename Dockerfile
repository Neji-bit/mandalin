FROM ubuntu
ADD ./docker_init/base_setup.sh /docker_init/
ADD ./docker_init/rails_setup.sh /docker_init/
ADD ./docker_init/Gemfile.enable_rails /docker_init/
ENV _RAILS_DIR /rails_app
ENV PATH /share/bin:$PATH
RUN /docker_init/base_setup.sh
