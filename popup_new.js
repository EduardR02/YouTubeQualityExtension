
run_on_init_p_new();


function run_on_init_p_new() {
    let buttons = document.querySelectorAll("button");
    for (let i = 0; i < buttons.length; i++) {
        if (buttons[i].id == "button0") {
            buttons[i].addEventListener("click", go_back);
        }
        else {
            buttons[i].addEventListener("click", change_quality.bind(this, buttons[i].id));
        }
    }
}

function go_back() {
    setTimeout(function() {window.location.href="popup.html";}, 200);
    return true;
}

function change_quality(quality) {
    quality = quality.slice(quality.length - 1);
    const quality_arr = ["tiny", "small", "medium", "large", "hd720", "hd1080", "hd1440", "hd2160", "highres"];
    quality = quality_arr[parseInt(quality, 10) - 1];
    chrome.storage.sync.set({Quality: quality}, function() {
		console.log('Quality is set to ' + quality);
        chrome.runtime.sendMessage({message: "quality_changed"});
	});
    go_back();
    return true;
}