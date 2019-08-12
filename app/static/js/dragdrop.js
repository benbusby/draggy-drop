const loadWords = () => {
    $.getJSON("/static/words.json", function(words) {
        for (let key in words) {
            if (words.hasOwnProperty(key)) {
                $("#chat-options").append("<span>" + key + "</span>");
                console.log(key + " -> " + words[key]);
            }
        }

        $("span").each(function() {
            $(this).draggable({
                stop: function(event, ui) {
                    // reset position of dragged element
                    $(this).css({"top":"", "left":""});
                }
            });
        });
    });
}

$(document).ready(function() {
    // load the draggable words into the view
    loadWords();

    $("#chat-input").droppable({
        drop: function(event, ui) {
            console.log('heyheyhey');
        }
    });

    $("input").droppable({
        hoverClass: "highlight",
        drop: function(event, ui) {
            $(this).val($(this).val() + ui.draggable.text());
        }
    });
});
