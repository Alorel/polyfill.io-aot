#!/usr/bin/env bash

dirs=($(ls packages))
for dir in "${dirs[@]}"; do
  mv $(npm pack ./packages/$dir) $dir.tgz &
done;

wait;
