from flask import session, redirect, url_for, render_template, request, abort, jsonify
from . import main
from .forms import LoginForm
from .. import db
from app.main.models import User, load_user, Message


@main.route('/', methods=['GET', 'POST'])
def index():
    """
    Presents a "login" form to enter the thunderdome.
    """
    form = LoginForm()
    if form.validate_on_submit():
        form_name = form.name.data

        # Modify the requested username if already taken
        if load_user(form_name) is not None:
            mod = 1
            while load_user(form_name + '(' + str(mod) + ')') is not None:
                mod += 1

            form_name = form_name + '(' + str(mod) + ')'

        # Add username to sqlite db
        db.session.add(User(username=form_name))
        db.session.commit()

        session['name'] = form_name
        session['room'] = 'dnd-room'

        return redirect(url_for('.chat'))

    return render_template('index.html', form=form)


@main.route('/chat')
def chat():
    """
    The main chat room layout. Stores username and room
    name in session object.
    """
    name = session.get('name', '')
    room = session.get('room', '')
    if name == '' or room == '' or load_user(name) is None:
        return redirect(url_for('.index'))
    return render_template('chat.html', name=name, room=room)


@main.route('/history')
def history():
    """
    Fetches the chat history.
    """
    msg_arr = []
    messages = Message.query.all()
    for i in range(0, len(messages)):
        msg_arr.append({ 'msg': messages[i].message, 'username': messages[i].username})

    return jsonify(msg_arr)
