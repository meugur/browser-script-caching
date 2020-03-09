#!/bin/bash

set -e

export FLASK_APP=server.py
export FLASK_ENV=development

python -m flask run
