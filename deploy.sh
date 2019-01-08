#!/bin/sh

export ipfs_staging=/tmp/ipfs/staging
export ipfs_data=/tmp/ipfs/data

docker container stop ipfs_host
docker container rm ipfs_host
docker run -d --name ipfs_host -v $ipfs_staging:/export -v $ipfs_data:/data/ipfs \
           -p 4001:4001 -p 127.0.0.1:8080:8080 -p 127.0.0.1:5001:5001 ipfs/go-ipfs:v0.4.18

docker container stop ethereum-node
docker container rm ethereum-node
docker run -it                    \
           --name ethereum-node   \
           -v /tmp/ethereum:/root \
           -p 8545:8545           \
           -p 30303:30303         \
           ethereum/client-go --rinkeby                         \
                              --rpc                             \
                              --rpcapi db,eth,net,web3,personal \
                              --rpcport 8545                    \
                              --rpccorsdomain "*"               \
                              --ws                              \
                              --wsapi db,eth,net,web3,personal  \
                              --wsorigins="*"                   \
                              --syncmode=light
