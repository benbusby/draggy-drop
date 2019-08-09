import os
from flask import Flask
from flask_socketio import SocketIO

socketio = SocketIO()


def init_app(debug=False):
    """Initializes the chat application."""
    app = Flask(__name__)
    app.debug = debug
    app.config['SECRET_KEY'] = os.environ['SECRET_KEY']

    from .main import main as main_blueprint
    app.register_blueprint(main_blueprint)

    socketio.init_app(app)
    return app
