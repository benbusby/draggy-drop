from flask import session, redirect, url_for, render_template, request, abort
from . import main
from .forms import LoginForm
from .. import db
from app.main.models import User, load_user


@main.route('/', methods=['GET', 'POST'])
def index():
    """
    Presents a "login" form to enter the thunderdome.
    """
    form = LoginForm()
    if form.validate_on_submit():
        if load_user(form.name.data) is None:
            db.session.add(User(username=form.name.data))
            db.session.commit()

            session['name'] = form.name.data
            session['room'] = 'dnd-room' # form.room.data
            return redirect(url_for('.chat'))
        else:
            abort(400)
    elif request.method == 'GET':
        form.name.data = session.get('name', '')
    return render_template('index.html', form=form)


@main.route('/chat')
def chat():
    """
    The main chat room layout. Stores username and room
    name in session object.
    """
    name = session.get('name', '')
    room = session.get('room', '')
    if name == '' or room == '':
        return redirect(url_for('.index'))
    return render_template('chat.html', name=name, room=room)
