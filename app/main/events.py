from flask import session
from flask_socketio import emit, join_room, leave_room
from .. import socketio


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
    print("msg: " + str(message))
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

