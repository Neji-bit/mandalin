FROM ubuntu
ADD ./docker_init/* /docker_init/
ENV _RAILS_DIR /rails_app
ENV PATH /share/bin:$PATH
RUN /docker_init/base_setup.sh
