FROM ubuntu
ADD ./docker_init/rails_setup.sh /docker_init/
ADD ./docker_init/Gemfile.enable_rails /docker_init/
RUN /docker_init/rails_setup.sh
