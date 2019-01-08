#https://github.com/michielbdejong/geth-rinkeby-docker/blob/master/Dockerfile


FROM ubuntu:18.04

RUN apt-get update
RUN apt-get install -y software-properties-common
RUN add-apt-repository -y ppa:ethereum/ethereum
RUN apt-get update
RUN apt-get install -y wget 
RUN apt-get install -y vim
RUN apt-get install -y wget
RUN apt-get install -y ethereum

# this cannot be right, but the installs fail otherwise
EXPOSE 80

RUN wget https://www.rinkeby.io/rinkeby.json
RUN geth --datadir=$HOME/.rinkeby init rinkeby.json


EXPOSE 8545
EXPOSE 30303
EXPOSE 30303/udp

CMD geth  --rinkeby \
          --rpc \
          --rpcapi db,eth,net,web3,personal \
          --rpcport 8545 \
          --rpccorsdomain "*" \
          --ws \
          --wsapi db,eth,net,web3,personal \
          --wsorigins="*" \
          --syncmode=light \
          console  
