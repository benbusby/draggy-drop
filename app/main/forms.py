from flask_wtf import FlaskForm
from wtforms.fields import StringField, SubmitField
from wtforms.validators import Required, ValidationError


def validate_name(form, field):
    if len(field.data) > 50 or len(field.data) < 3:
        raise ValidationError('Name must be more than 2 and less than 50 characters')


class LoginForm(FlaskForm):
    """Accepts a nickname and a room."""
    name = StringField('Username', validators=[Required(), validate_name])
    submit = SubmitField('Enter Chatroom')

