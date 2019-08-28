#!/bin/bash

SECRET_STR=`cat <<EOF
from base64 import b64encode
from os import urandom

random_bytes = urandom(64)
token = b64encode(random_bytes).decode('utf-8')
print(token)
EOF`

export FLASK_APP=chat.py

export SECRET_KEY=`python -c "$SECRET_STR"`

rm -rf app/chat.db migrations/
flask db init
flask db migrate
flask db upgrade

python chat.py
