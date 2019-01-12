#!/bin/sh

#curl -F file=@build "https://ipfs.infura.io:5001/api/v0/add?recursive=true"

cd ${HOME}/git/permachat/client

npm run build

curl "https://ipfs.infura.io:5001/api/v0/add?recursive=true" \
    -H "Content-Type: multipart/form-data" \
    -F 'file=@"build"'
