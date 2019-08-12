var socket;

const sendChat = () => {
    let text = $('#chat-input').val();

    if (text.length == 0) {
        alert("Hi there! Looks like you just tried sending an " +
        "empty message.\n\nHere at DraggyDrop, we like to do " +
        "things a little differently. Instead of sending an " +
        "empty message, why don't you try dragging words into " +
        "the box and sending some of that!");
        return;
    }

    $('#chat-input').val('');
    socket.emit('chat', { msg: text });
}

$(document).ready(function(){
    socket = io.connect('http://' + document.domain + ':' + location.port + '/chat');
    socket.on('connect', function() {
        socket.emit('join', {});
    });
    socket.on('status', function(data) {
        $('#chat').val($('#chat').val() + '<' + data.msg + '>\n');
        $('#chat').scrollTop($('#chat')[0].scrollHeight);
    });
    socket.on('message', function(data) {
        $('#chat').val($('#chat').val() + data.msg + '\n');
        $('#chat').scrollTop($('#chat')[0].scrollHeight);
    });

    $('#chat-input').keypress(function(e) {
        var code = e.keyCode || e.which;
        if (code == 13) {
            text = $('#chat-input').val();
            $('#chat-input').val('');
            socket.emit('chat', {msg: text});
        }
    });
});

const leaveRoom = () => {
    socket.emit('left', {}, function() {
        socket.disconnect();

        // go back to the login page
        window.location.href = "{{ url_for('main.index') }}";
    });
}

const userTyping = (event) => {
    event.preventDefault();
    alert("Woah there! Looks like you might be new here.\n\n" +
        "Here at DraggyDrop, we like to do things a little differently. " +
        "To send messages, you'll need to use our intuitive drag and drop " +
        "messaging interface. Just select a category using the dropdown menu, " +
        "and start dragging words over to this input box.");
}
