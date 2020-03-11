# ✨ Invoy Infrastructure
## _Your money, on your time._

### About this Repository
This repository houses the logic for the GraphQL server and API that backs Invoy.

---
### Getting Started

**Development Environment**

To ensure that developing within this repository is as seamless as possible across all of our developers' workstations, we are using Docker and Docker Compose.

Ensure that Docker is installed on your machine and that your Docker Daemon is running. 

**Development**
##### DATABASE
To **start** your development Postgres database (this will create your database the first time it prepares resources):
```bash
# If you need to see trace-logs
docker-compose up
# If you only need the environment to run
docker-compose up -d
```

To **stop** your Postgres database:
```bash
docker-compose stop
```

To **destroy** your Postgres database:
```bash
docker-compose down
```
##### GRAPHQL SERVER
```bash
yarn dev
```
---
### FAQs

_How do I check that my `docker-compose.yml` file has the correct configuration (i.e. my environmental variables are coming in correctly)?_
```bash
docker-compose config
```

_How do I check if my Docker container is currently running?_
```bash
docker-compose ps
```

_Will we be able to run our GrpahQL Server and our Database in the one big Docker-Compose container so that I don't have to open two windows and run stuff concurrently?_

At the moment, this isn't looking like a viable option. The reason for this is that the `bcrypt` module has a lot off issues when built in a MacOS environment but then run in a Linux environment. It is necessary to build the node_modules therefore on the Linux machine every time we want to add packages, which would continutally mean we would have to run `docker-compose down; docker-compose up` every time we wanted to update our `package.json` file, which does not make for a happy development environment experience.