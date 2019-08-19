const wordCategories = [];

const loadWords = () => {
    $.getJSON("/static/words.json", function(words) {
        let firstVisible = false;
        for (let key in words) {
            let categoryTitle = key.charAt(0).toUpperCase() + key.slice(1);
            wordCategories.push(key);

            $("#category-section").append("<div class='chat-options' id='" + key + "-words'></div>");
            $("#category-selector").append("<option value='" + key + "'>" + categoryTitle + "</option>");

            let numWords = 0;
            for (let i in words[key]) {
                if (!firstVisible) {
                    $("#" + key + "-words").css("display", "initial");
                    firstVisible = true;
                }

                let word = words[key][i];

                $("#" + key + "-words").append("<span data-val='" + key + "' class='draggable-span'>" + word + "</span>");
                numWords++;
                if (numWords >= 10) {
                    $("#" + key + "-words").append("<br/><br/>");
                    numWords = 0;
                }
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
            } else {
                return;
            }

            rawMessage.length = 0;
        }
    });

    $("input").droppable({
        hoverClass: "highlight",
        drop: function(event, ui) {
            let word = ui.draggable.text();
            let wordVal = ui.draggable[0].dataset.val;

            if (wordVal.indexOf("suffix") >= 0) {
                $(this).val($(this).val().slice(0, -1) + ui.draggable.text() + " ");
            } else if (wordVal.indexOf("prefix") >= 0) {
                $(this).val($(this).val() + ui.draggable.text());
            } else {
                $(this).val($(this).val() + ui.draggable.text() + " ");
            }

            rawMessage.push({ [wordVal]: ui.draggable.text() });
            console.log(rawMessage);
        }
    });

    $("#category-selector").change(function() {
        for (let key in wordCategories) {
            let category = wordCategories[key];
            $("#" + category + "-words").css("display", category == this.value ? "initial" : "none");
        }
    });
});
