#!/bin/bash

SECRET_STR=`cat <<EOF
from base64 import b64encode
from os import urandom

random_bytes = urandom(64)
token = b64encode(random_bytes).decode('utf-8')
print(token)
EOF`

export SECRET_KEY=`python -c "$SECRET_STR"`

python chat.py
