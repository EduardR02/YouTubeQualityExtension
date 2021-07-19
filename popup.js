
run_on_init();


function run_on_init() {
	let buttons = document.querySelectorAll("button");
	for (let i = 0; i < buttons.length; i++) {
		switch (buttons[i].id) {
			case "buttonON":
				buttons[i].addEventListener("click", function() {
					turn_on_off(true);
				});
				break;
			case "buttonOFF":
				buttons[i].addEventListener("click", function() {
					turn_on_off(false);
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


function turn_on_off (isOn) {
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
		chrome.runtime.sendMessage({message: "play_sound"})
	});
}

