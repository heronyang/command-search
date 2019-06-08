var suggestions = null;

// TODO: We store all commands as a quick hack.
var all_commands = null;

function load_zero_state_suggestions() {
    send_http_get_async("/suggestion", (response_text) => {
        const response = JSON.parse(response_text);
        all_commands = response;
        console.log(response);
    });
}

function send_http_get_async(url, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = () => { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
            callback(xmlHttp.responseText);
        }
    }
    xmlHttp.open("GET", url, true); // Set true for asynchronous 
    xmlHttp.send(null);
}

const search_box = document.getElementById("search-box");

search_box.addEventListener("keyup", () => {
    console.log(search_box.value);
    update_suggestion(search_box.value.toLowerCase());
});

function update_suggestion(query) {
    unsorted_suggestions = [];
    for (let row of all_commands) {
        if (row.command.toLowerCase().includes(query)) {
            unsorted_suggestions.push(row);
        }
    }
    suggestions = unsorted_suggestions.sort((first, second) => {
        return second.frequency - first.frequency;
    });
    console.log(suggestions);
    show_suggestion();
};

const suggestion_container = document.getElementById("suggestion-container");

function show_suggestion() {
    // Clear previous contents before showing new content.
    suggestion_container.innerHTML = "";
    // Display each suggestion.
    for (let suggestion of suggestions) {
        suggestion_element = document.createElement("p");
        suggestion_content = document.createTextNode(
            "[" + suggestion.frequency + "] " + suggestion.command);
        suggestion_element.appendChild(suggestion_content);
        suggestion_container.appendChild(suggestion_element);
    }
}

load_zero_state_suggestions();
