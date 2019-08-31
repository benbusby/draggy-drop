from app import db
from flask_login import UserMixin
from datetime import datetime


def load_user(username):
    return User.query.get(str(username))


def new_message(username, message):
    msg_check = Message.query.filter_by(username=username, message=message)
    if msg_check.count() > 5:
        return False

    db.session.add(Message(username=username, message=message))
    row_count = Message.query.count()
    if row_count > 100:
        oldest_msg = Message.query.order_by(Message.timestamp.asc()).first()
        db.session.delete(oldest_msg)
    db.session.commit()
    return True


class User(UserMixin, db.Model):
    username = db.Column(db.String(64), primary_key=True, unique=True)

    def __repr__(self):
        return '<User {}>'.format(self.username)

class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True, unique=True)
    message = db.Column(db.String(140))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    username = db.Column(db.String(64))

    def __repr__(self):
        return '<Message {}>'.format(str(self.message))
