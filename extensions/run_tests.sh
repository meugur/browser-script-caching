#!/bin/bash

set -e

docker build -t tests .
docker run -it -v /dev/shm:/dev/shm --rm tests

