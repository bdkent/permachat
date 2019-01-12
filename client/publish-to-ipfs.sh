#!/bin/sh

#curl -F file=@build "https://ipfs.infura.io:5001/api/v0/add?recursive=true"

npm run build

curl "https://ipfs.infura.io:5001/api/v0/add?recursive=true" \
    --verbose \
    -X POST \
    -o ipfs.out \
    -H "Content-Type: multipart/form-data" \
    -F 'file=@"build"'
