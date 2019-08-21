from app import db
from flask_login import UserMixin


def load_user(username):
    return User.query.get(str(username))


class User(UserMixin, db.Model):
    username = db.Column(db.String(64), primary_key=True, unique=True)

    def __repr__(self):
        return '<User {}>'.format(self.username)

