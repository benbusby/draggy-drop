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

const outgoingMessage = (message, id) => {
    return `
    <li class="chat-message">
        <span id="${id}" class="message outgoing sending">${message}</span>
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

const newOnlineUser = (username) => {
    return `
    <span data-val="user" class="draggable-span">${username}</span>
    `
}

const updateOnlineUsers = (users) => {
    let onlineUsers = $("#online-users");
    onlineUsers.html("");

    for (var i in users) {
        onlineUsers.html(onlineUsers.html() + newOnlineUser(users[i]));
    }

    setDraggable();
}

// Key value mapping of chat words
// to their respective categories in the
// words json file
const rawMessage = [];

// ----------------------
// User chat interaction
// ----------------------
const sendChat = () => {
    let message = $('#chat-input').val();

    if (message.length == 0) {
        alert("Hi there! Looks like you just tried sending an " +
            "empty message.\n\nHere at DraggyDrop, we like to do " +
            "things a little differently. Instead of sending an " +
            "empty message, why don't you try dragging words into " +
            "the box and sending some of that!");
        return;
    }

    let currentChat = $("#chat-input").val();
    let uuid = getUUID();
    $('#chat-input').val('');
    $('#chat-list').append(outgoingMessage(currentChat, uuid));
    socket.emit('chat', { raw_msg: JSON.stringify(rawMessage), id: uuid });
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
        $("#online-header").text(data.users.length + " online:");
        updateOnlineUsers(data.users);
        scrollChat();
    });
    socket.on('message', function(data) {
        if (data.username == currentUsername) {
            let outgoingMsg = $('#' + data.id);
            outgoingMsg.removeClass('sending');
            outgoingMsg.text(data.msg);
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
        window.location.href = "/";
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

const getUUID = () => {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }

    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}
