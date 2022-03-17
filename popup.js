let sound_urls = ["sounds/fart_meme_1.mp3", "sounds/knock_sound.mp3", "sounds/reverb_fart_1.mp3", "sounds/vine_boom.mp3"];
run_on_init();


function run_on_init() {
	let buttons = document.querySelectorAll("button");
	for (let i = 0; i < buttons.length; i++) {
		switch (buttons[i].id) {
			case "buttonON":
				buttons[i].addEventListener("click", function() {
					set_on_off(true);
					return true;
				});
				break;
			case "buttonOFF":
				buttons[i].addEventListener("click", function() {
					set_on_off(false);
					return true;
					});
				break;
			case "buttonQ":
				buttons[i].addEventListener("click", set_quality);
				break;
			case "buttonSUR":
				buttons[i].addEventListener("click", surprise);
				break;
			default:
		}
	}
	
	get_on_off(function(isOn) {update_colors(isOn)});
}


function update_colors(isOn) {
	const arr = document.getElementsByClassName('button');
	if (isOn) {
		Array.prototype.forEach.call(arr, el => {
			el.style.setProperty("--check-primary", "#61afef");
			el.style.setProperty("--check-secondary", "#ef596f");
		});
	}
	else {
		Array.prototype.forEach.call(arr, el => {
			el.style.setProperty("--check-primary", "#ef596f");
			el.style.setProperty("--check-secondary", "#61afef");
		});
	}
}


function set_on_off (isOn) {
	if (isOn) {
		chrome.runtime.sendMessage({message: "turned_on"});
	}
	update_colors(isOn);
	chrome.storage.sync.set({OnOffToggle: isOn }, function() {
		console.log('OnOff is set to ' + isOn);
	});
}

function set_quality () {
	get_on_off(function(isOn) {
		if (!isOn) return;
		setTimeout(function() {window.location.href="popup_new.html";}, 200);
	});
	return true;
}

function get_on_off(callback) {
	chrome.storage.sync.get('OnOffToggle', function(res) {
		update_colors(res.OnOffToggle);
		console.log('Value of OnOffToggle is ' + res.OnOffToggle);
		callback(res.OnOffToggle);
	});
}

function surprise () {
	get_on_off(function(isOn) {
		if (!isOn) return;
		surprise_receive();
	});
	return true;
}

function surprise_receive() {
    // url = chrome.runtime.getURL("path_to_file");
    let url = chrome.runtime.getURL(sound_urls[Math.floor(Math.random() * sound_urls.length)]);
    if (url) {
        let myAudio = new Audio(url);
        myAudio.play();
        console.log("hehe");
    }
    else {
        console.log("Failed to play sound");
    }
}

