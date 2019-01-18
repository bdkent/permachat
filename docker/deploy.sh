#!/bin/sh

# docker build --no-cache --tag=indexer-service .
# docker login
# docker tag indexer-service bkent/permachat-indexer-service
# docker push bkent/permachat-indexer-service

# docker stack rm pc
# docker stack deploy -c docker-compose.yml pc

# env vars???    -e x=y
# docker-compose up -d --force-recreate --remove-orphans 


docker build --no-cache --tag=indexer-service:v0.? ${HOME}/git/permachat/
docker tag indexer-service:v0.? bkent/permachat-indexer-service:v0.?
docker login
docker push bkent/permachat-indexer-service:v0.?

docker build --no-cache --tag=identity-service:v0.? ${HOME}/go/src/github.com/bdkent/permachat-services/internal/app/identity
docker tag identity-service:v0.? bkent/permachat-identity-service:v0.?
docker login
docker push bkent/permachat-identity-service:v0.?

docker-compose up -d --force-recreate --remove-orphans    #-e GETH_NETWORK=--rinkeby
  
docker stack rm permachat
docker stack deploy -c docker-compose.yml permachat
