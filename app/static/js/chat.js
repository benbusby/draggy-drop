var socket;

// ----------------------
// Chat message templates
// ----------------------
const incomingMessage = (sender, message) => {
    return `
    <li class="chat-message">
        <span class="sender">${sender}</span>
        <span class="message incoming">${message}</span>
    </li>
    `
}

const outgoingMessage = (message) => {
    return `
    <li class="chat-message">
        <span class="message outgoing">${message}</span>
    </li>
    `
}

const newUserMessage = (message) => {
    return `
    <li class="chat-message">
        <span class="new-user">${message}</span>
    </li>
    `
}


// ----------------------
//
// ----------------------
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

// Scroll animation for incoming messages
const scrollChat = () => {
    $("#chat-div").animate({ scrollTop: $('#chat-div').prop("scrollHeight")}, 1000);
}

$(document).ready(function(){
    socket = io.connect('http://' + document.domain + ':' + location.port + '/chat');
    socket.on('connect', function() {
        socket.emit('join', {});
    });
    socket.on('status', function(data) {
        $('#chat-list').append(newUserMessage(data.msg));
        scrollChat();
    });
    socket.on('message', function(data) {
        if (data.username == currentUsername) {
            $('#chat-list').append(outgoingMessage(data.msg));
        } else {
            $('#chat-list').append(incomingMessage(data.username, data.msg));
        }

        scrollChat();
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

