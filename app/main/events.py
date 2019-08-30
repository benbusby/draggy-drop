from flask import session, current_app
from flask_socketio import emit, join_room, leave_room
from .. import socketio, db
from app.main.models import User, load_user, Message, new_message
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
    current_users = User.query.all()
    users = []
    for i in range(0, len(current_users)):
        users.append(current_users[i].username)

    emit('status', {'msg': session.get('name') + ' has joined the chat!', 'users': users}, room=room)


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
                if 'user' not in key and value not in words_data[key]:
                    emit('status', {'msg': session.get('name') + ' broke the rules'}, room=room)
                    return
                elif 'user' in key and load_user(value) is None and 'everyone' not in value:
                    emit('status', {'msg': session.get('name') + ' tried addressing a user, but they left!'}, room=room)
                    return

                if 'prefix' in key:
                    chat_msg += value
                elif 'suffix' in key or 'punctuation' in key:
                    chat_msg = chat_msg[:-1] + value + ' '
                else:
                    chat_msg += value + ' '

        emit('message', {'username': session.get('name'), 'msg': chat_msg, 'id': message['id']}, room=room)

        new_message(session.get('name'), chat_msg)


@socketio.on('leave', namespace='/chat')
def leave(message):
    """
    Sent by clients when they leave a room.
    A status message is broadcast to all people in the room.
    """
    leaving_user = User.query.filter_by(username=session.get('name')).first()
    leaving_username = session.get('name')

    # Remove the user from the chat room
    room = session.get('room')
    leave_room(room)

    # Remove the user from the db to free up the username
    if leaving_user is not None:
        db.session.delete(leaving_user)
        db.session.commit()

    # Clear session values
    session['name'] = ''
    session['room'] = ''

    # Downlink new online user list
    current_users = User.query.all()
    users = []
    for i in range(0, len(current_users)):
        users.append(current_users[i].username)
    emit('status', {'msg': leaving_username + ' has left the chat.', 'users': users}, room=room)
