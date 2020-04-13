#!/bin/bash

set -e

docker build -t chrome_tests .
docker run -it -v /dev/shm:/dev/shm --rm chrome_tests

