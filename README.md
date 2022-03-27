# Vitec Interview Task

## Prequisites
- On Windows: Docker Desktop
- On Linux: Docker + Docker-Compose

<br />

## Usage (Windows & Docker Desktop)
- Download zip and unzip
- Run ``docker-compose up --build`` in project root
- Go to ``http://localhost:3050`` in your browser and you should be on the main page (pgadmin4 - a frontend for postgres - can be found at ``http://localhost:9090``)
- IMPORTANT: During testing it was found that the ``docker-compose.yml`` file that exists in the project root might have connection troubles on Windows hosts. If you are having trouble with reaching the front page then replace that ``docker-compose.yml`` file with the one in ``windows-dockercompose-file``-directory. The main endpoints for it are ``http://localhost:80`` and ``http://localhost:9090``.

<br />

## Usage (Linux, e.g. Ubuntu 20.04 LTS)
- Guaranteed to work: Extensively tested and can be run easily on a VM; with port-forwarding to the host if you want
- Install Docker (https://docs.docker.com/engine/install/ubuntu/) and Docker-Compose (https://docs.docker.com/compose/install/)
- Optional: Install Git (https://git-scm.com/download/linux)
- Clone with Git or download zip from [the repo](https://github.com/mikaele90/Vitec-InterviewTask2)
- Run ``docker-compose up --build`` in project root (may require ``sudo``)
- Go to ``http://localhost:3050`` in your browser and you should be on the main page (pgadmin4 - a frontend for postgres - can be found at ``http://localhost:9090``)

<br />
