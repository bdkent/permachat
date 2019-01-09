# indexer service
# bdkent/permachat-indexer

FROM node:11.3.0

RUN git clone https://github.com/bdkent/permachat.git
WORKDIR /permachat/client
RUN chown -R node:node .
USER node

RUN npm install

CMD npm run indexer -- --network rinkeby
# CMD ls
