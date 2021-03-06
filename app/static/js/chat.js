var socket;
let noSpace = false;

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

    onlineUsers.html(onlineUsers.html() + newOnlineUser("everyone"));

    setDraggable();
}


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


// Load history from the backend messages db
const loadHistory = () => {
    $.get('/history', function(messages) {
        for (var i in messages) {
            $("#chat-list").append(incomingMessage(messages[i].username, messages[i].msg));
        }

        scrollChat();
    });
}

$(document).ready(function() {
    // Load the draggable words for the chat
    loadWords('/static/words.json');
    loadHistory();

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
    socket.emit('leave', {}, function() {
        socket.disconnect();

        // go back to the login page
        window.location.href = window.location.href.replace("chat", "");;
    });
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

// Leave chat if closing the tab in order to free up
// the username
$(window).bind("beforeunload", function() {
    leaveRoom();
});
