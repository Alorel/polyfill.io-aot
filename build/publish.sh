#!/usr/bin/env bash

dirs=($(ls packages))
for dir in "${dirs[@]}"; do
  echo "Publishing $dir"
  npm publish ./packages/$dir
  echo ""
done;

wait;
