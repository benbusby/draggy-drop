const wordCategories = [];

const loadWords = () => {
    $.getJSON("/static/words.json", function(words) {
        let firstVisible = false;
        for (let key in words) {
            let categoryTitle = key.charAt(0).toUpperCase() + key.slice(1);
            wordCategories.push(key);
            $("#category-section").append("<div class='chat-options' id='" + key + "-words'></div>");
            $("#category-selector").append("<option value='" + key + "'>" + categoryTitle + "</option>");
            for (let word in words[key]) {
                if (!firstVisible) {
                    $("#" + key + "-words").css("display", "initial");
                    firstVisible = true;
                }

                $("#" + key + "-words").append("<span class='draggable-span'>" + word + "</span>");
                console.log(word + " -> " + key);
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

    $("#category-selector").change(function() {
        for (let key in wordCategories) {
            let category = wordCategories[key];
            $("#" + category + "-words").css("display", category == this.value ? "initial" : "none");
        }
    });
});
