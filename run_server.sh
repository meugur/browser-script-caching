#!/bin/bash

set -e

docker build -t static_server .
docker run -v $(pwd):/usr/src/ -p 5000:5000 -d --network host static_server
