#!/bin/sh

docker container stop ganache-local
docker container rm ganache-local
docker run -d                    \
           --name ganache-local  \
           -p 7545:7545          \
           trufflesuite/ganache-cli:v6.2.5  -p 7545 \
                                            -m stumble scissors finger melt market master spray intact audit notable excuse elephant
