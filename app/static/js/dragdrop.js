const loadWords = () => {
    $.getJSON("/static/words.json", function(words) {
        // TODO: Split out into separate categories
        for (let greeting in words.greetings) {
            if (words.greetings.hasOwnProperty(greeting)) {
                $("#chat-options").append("<span class='draggable-span'>" + greeting + "</span>");
                console.log(greeting + " -> " + words.greetings[greeting]);
            }
        }

        for (let action in words.actions) {
            if (words.actions.hasOwnProperty(action)) {
                $("#chat-options").append("<span class='draggable-span'>" + action + "</span>");
            }
        }

        $(".draggable-span").each(function() {
            $(this).draggable({
                start: function(event, ui) {
                    $(this).addClass("grabbed");
                },
                stop: function(event, ui) {
                    // reset position of dragged element
                    $(this).css({"top":"", "left":""});
                    $(this).removeClass("grabbed");
                }
            });
        });
    });
}

$(document).ready(function() {
    // load the draggable words into the view
    loadWords();

    $("#actions").droppable({
        hoverClass: "highlight",
        drop: function(event, ui) {
            if (ui.draggable.text() === "SEND") {
                sendChat();
            } else if (ui.draggable.text() === "CLEAR") {
                $("input").val("");
            }
        }
    });

    $("input").droppable({
        hoverClass: "highlight",
        drop: function(event, ui) {
            $(this).val($(this).val() + ui.draggable.text() + " ");
        }
    });
});
