// Key value mapping of chat words
// to their respective categories in the
// words json file
const rawMessage = [];
const wordCategories = [];

// Prevent user from typing in any input boxes
const userTyping = (event) => {
    event.preventDefault();
    alert("Woah there! Looks like you might be new here.\n\n" +
        "Here at DraggyDrop, we like to do things a little differently. " +
        "To send messages, you'll need to use our intuitive drag and drop " +
        "messaging interface. Just select a category using the dropdown menu, " +
        "and start dragging words over to this input box.");
}

const loadWords = (file) => {
	$.getJSON(file, function(words) {
		let firstVisible = false;
		for (let key in words) {
			let lineBreakNum = (key == "questions") ? 4 : 8;
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

				$("#" + key + "-words").append(
					"<span data-val='" +
					key +
					"' class='draggable-span'>" +
					word +
					"</span>"
				);

				numWords++;
				if (numWords >= lineBreakNum) {
					$("#" + key + "-words").append("<br/><br/>");
					numWords = 0;
				}
			}
		}

		setDraggable();
	});
}

const setDraggable = () => {
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
}

$(document).ready(function() {
	$("#actions").droppable({
		hoverClass: "highlight",
		drop: function(event, ui) {
			if (ui.draggable.text() === "SEND") {
				sendChat();
			} else if (ui.draggable.text() === "CLEAR") {
				$("input").val("");
			} else if (ui.draggable.text() === "ENTER") {
				$("#login-form").submit();
			} else if (ui.draggable.text() === "RANDOM") {
				$.ajax({
					url: 'https://randomuser.me/api/',
					dataType: 'json',
					success: function(data) {
						let randomUser = data['results'][0];
						if (!randomUser) {
							alert('Error retrieving random username');
							return;
						}

						if (confirm("Your username will be: " + randomUser['login']['username'] +
							"\n\nIs that chill with you brah?")) {
                            $("#form-input").val(randomUser['login']['username']);
                            $("#login-form").submit();
						}
					}
				});
			} else {
				return
			}

            rawMessage.length = 0;
		}
	});

	$("input").droppable({
		hoverClass: "highlight",
		drop: function(event, ui) {
            let inputBox = $(this);
			let word = ui.draggable.text();
			let wordVal = ui.draggable[0].dataset.val;

			if (wordVal.indexOf("suffix") >= 0 || wordVal.indexOf("punctuation") >= 0) {
			    inputBox.val(inputBox.val().slice(0, -1) + word + " ");
			} else if (wordVal.indexOf("prefix") >= 0) {
				inputBox.val(inputBox.val() + word);
			} else {
				inputBox.val(inputBox.val() + word);
				if (!noSpace) {
                    inputBox.val(inputBox.val() + ' ');
				}
			}

			rawMessage.push({ [wordVal]: word });
		}
	});

	$("#category-selector").change(function() {
		for (let key in wordCategories) {
			let category = wordCategories[key];
			$("#" + category + "-words").css("display", category == this.value ? "initial" : "none");
		}
	});
});
