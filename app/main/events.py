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
    room = session.get('room')
    if 'raw_msg' not in message:
        emit('status', {'msg': session.get('name') + ' is trying to be sneaky...'}, room=room)
        return

    words_path = os.path.join(current_app.static_folder, 'words.json')
    with open(words_path) as words_json:
        words_data = json.load(words_json)
        raw_msg = json.loads(message['raw_msg'])
        chat_msg = ''
        for word in raw_msg:
            for key, value in word.items():
                if value not in words_data[key]:
                    emit('status', {'msg': session.get('name') + ' broke the rules'}, room=room)
                    return

                if 'prefix' in key:
                    chat_msg += value
                elif 'suffix' in key:
                    chat_msg = chat_msg[:-1] + value + ' '
                else:
                    chat_msg += value + ' '

        emit('message', {'username': session.get('name'), 'msg': chat_msg}, room=room)


@socketio.on('leave', namespace='/chat')
def leave(message):
    """
    Sent by clients when they leave a room.
    A status message is broadcast to all people in the room.
    """
    room = session.get('room')
    leave_room(room)
    emit('status', {'msg': session.get('name') + ' has left the room.'}, room=room)
