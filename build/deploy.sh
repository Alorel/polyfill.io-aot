#!/usr/bin/env bash

yarn run tsc
yarn run doctoc

if [ $CI ];
  then openssl aes-256-cbc -K $encrypted_38a76308a702_key -iv $encrypted_38a76308a702_iv -in .npmrc.enc -out .npmrc -d
fi;

dirs=($(ls packages))
for dir in "${dirs[@]}"; do
  echo "Publishing $dir..."
  npm publish ./packages/$dir
  echo ""
done;

wait;
