FROM jenkins/jenkins:lts-jdk21

USER root

RUN apt-get update \
    && apt-get install -y --no-install-recommends docker-cli git \
    && command -v docker \
    && docker --version \
    && rm -rf /var/lib/apt/lists/*

USER jenkins
