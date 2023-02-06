FROM ubuntu
ADD ./docker_init/rails_setup.sh /docker_init/
ADD ./docker_init/Gemfile.enable_rails /docker_init/
ENV _RAILS_USER rails_dev
ENV PATH /share/bin:$PATH
RUN /docker_init/rails_setup.sh
