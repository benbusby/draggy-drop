from flask import session, current_app
from flask_socketio import emit, join_room, leave_room
from .. import socketio
import os
import json


@socketio.on('join', namespace='/chat')
def join(message):
    """
    Allows clients to join a specified "room" in the Draggy Drop app,
    and broadcasts a status message to the room.
    """
    room = session.get('room')
    join_room(room)
    emit('status', {'msg': session.get('name') + ' has joined the chat!'}, room=room)


@socketio.on('chat', namespace='/chat')
def chat(message):
    """
    Sends a message from a user to all active members of a room.
    """
    if 'msg' not in message or 'raw_msg' not in message or not verify_message(message):
        emit('status', {'msg': session.get('name') + ' is trying to be sneaky...'}, room=room)
        return

    room = session.get('room')
    emit('message', {'username': session.get('name'), 'msg': message['msg']}, room=room)


@socketio.on('leave', namespace='/chat')
def leave(message):
    """
    Sent by clients when they leave a room.
    A status message is broadcast to all people in the room.
    """
    room = session.get('room')
    leave_room(room)
    emit('status', {'msg': session.get('name') + ' has left the room.'}, room=room)


def verify_message(message):
    """
    Verifies the words contained in the chat message against their values in
    the words json file.
    """
    msg_list = message['msg'].split()
    words_path = os.path.join(current_app.static_folder, 'words.json')
    with open(words_path) as words_json:
        raw_msg = json.loads(message['raw_msg'])
        words_data = json.load(words_json)
        index = 0
        for key, value in raw_msg.items():
            if value not in words_data[key]:
                return False

    return True
