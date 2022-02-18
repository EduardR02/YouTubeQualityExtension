chrome.tabs.onUpdated.addListener(tab_updated);
chrome.runtime.onMessage.addListener(got_message_background);
chrome.runtime.onInstalled.addListener(when_installed);

var current_url = "";
var youtube_link = "youtube.com/watch";


function tab_updated(tabId, changeInfo, tab) {
    if (changeInfo.status === "loading" && changeInfo.url) {
        current_url = changeInfo.url;
    }
    else if (changeInfo.status === "complete") {
        if (current_url) {
            if (current_url.includes(youtube_link)) {
                chrome.tabs.sendMessage(tabId, {
                    message: 'change_needed',
                    url: current_url
                });
                console.log("message on new video sent");
            }
        }
    }
}

function got_message_background(request, sender, sendResponse) {
    if (request.message === "play_sound") {
        surprise_receive();
    }
    else {
        chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
            if (!tabs) return;
            current_url = tabs[0].url;
            let tabId = tabs[0].id;
            if ((request.message === "turned_on" || request.message === "quality_changed")
            && current_url.includes(youtube_link)) {
                chrome.tabs.sendMessage(tabId, {
                    message: 'change_needed',
                    url: current_url
                });
                console.log("message on button click sent");
            }
        });
    }
}

function when_installed(details) {
    let quality = "hd1080"
    chrome.storage.sync.get('Quality', function(res) {
        if (!res.Quality) {
            chrome.storage.sync.set({Quality: quality}, function() {
                console.log('Quality is set to ' + quality);
            });
        }
        else {
            console.log("Quality already exists");
        }
    });
    let isOn = true;
    chrome.storage.sync.get('OnOffToggle', function(res) {
        if (!res.OnOffToggle) {
            chrome.storage.sync.set({OnOffToggle: isOn }, function() {
                console.log('OnOff is initialized to ' + isOn);
            });
        }
        else {
            console.log("OnOff already exists");
        }
    });
    
    /*
    if (details.reason === "install") {
        let on_install_tab = "popup_new.html";
        chrome.tabs.create({ url: on_install_tab });
    }
    */
}

function surprise_receive() {
    let url;
    // sounds are not included, so set your url here like this:
    // url = chrome.runtime.getURL("path_to_file");
    switch (Math.floor(Math.random() * 4)) {
        case 0:
            url = chrome.runtime.getURL("sounds/fart_meme_1.mp3");
            break;
        case 1:
            url = chrome.runtime.getURL("sounds/knock_sound.mp3");
            break;
        case 2:
            url = chrome.runtime.getURL("sounds/reverb_fart_1.mp3");
            break;
        case 3:
            url = chrome.runtime.getURL("sounds/vine_boom.mp3");
            break;
        default:
            url = null;
    }
    if (url) {
        let myAudio = new Audio(url);
        myAudio.play();
        console.log("hehe");
    }
    else {
        console.log("Failed to play sound");
    }
}

