chrome.tabs.onUpdated.addListener(tab_updated);
chrome.runtime.onMessage.addListener(got_message_background);
chrome.runtime.onInstalled.addListener(when_installed);


const youtube_link = "youtube.com/watch";

function tab_updated(tabId, changeInfo, tab) {
    if (changeInfo.status === "loading" && changeInfo.url) {
        setCurrentUrl(changeInfo.url);
    }
    else if (changeInfo.status === "complete") {
        chrome.storage.local.get("current_url", function(res_dict) {
            current_url = res_dict.current_url;
            if (current_url && current_url.includes(youtube_link)) {
                change_quality(tabId);
            }
        });
    }
    return true;
}

function got_message_background(request, sender, sendResponse) {
    if (request.message === "quality_changed" || request.message === "turned_on") {
        // update quality on any button press except suprrise button
        chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
            if (!tabs || !tabs[0]) return;
            current_url = tabs[0].url;
            setCurrentUrl(current_url);
            let tabId = tabs[0].id;
            if (current_url.includes(youtube_link)) {
                change_quality(tabId);
            }
        });
    }
    return true;
}


function when_installed(details) {
    // set defaults
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
    if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
        let on_install_tab = "popup_new.html";
        chrome.tabs.create({ url: on_install_tab });
    }
    */
   return true;
}


function setCurrentUrl(url) {
    chrome.storage.local.set({"current_url": url });
}

function injectStuff_mv3(quality, tabId) {
    chrome.scripting.executeScript({
        target: {tabId: tabId},
        func: change_quality_help,
        args: [quality],
        world: "MAIN"
    },
    () => {});
}


function change_quality_help(quality) {
    let players = document.querySelectorAll('.html5-video-player');
    // youtbe has multiple players: video and preview
    if (players.length === 0) {
        console.log("No player found, quality could not be changed");
        return;
    }
    if (quality) {
        for (let player of players) {
            player.setPlaybackQualityRange(quality);
            if (player.getPlayerState() === 5) {
                let my_listener_func = function (data) {
                    // technically doesn't need to timeout, but if it doesn't then lower qualities
                    // have enough time to preload and will run on lower quality until buffer is played.
                    // This (probably) ensures immediate change, as this overrides the preload because it doesnt
                    // fire on exact time of loading.
                    setTimeout(function () {player.setPlaybackQualityRange(quality);}, 50);
                    console.log("Quality changed (after retrying) to: " + quality);
                    player.removeEventListener("onStateChange", my_listener_func);
                    my_listener_func = function () {};
                    return true;
                };
                player.addEventListener("onStateChange", my_listener_func);
            }
            else {
                //player.playVideo();
                console.log("Quality successfully changed to: " + quality);
            }
        }
    }
    else {
        console.log("Error: Could not set quality");
    }
}

function change_quality(tabId) {
    get_status_on_off(function(isOn) {
        if (isOn) {
            get_quality(function(quality) {
                injectStuff_mv3(quality, tabId);
            });
        }
        else {
            console.log("Extension is OFF");
        }
    });
}

function get_quality(callback) {
    chrome.storage.sync.get('Quality', function(res) {
        console.log('Value of Quality is ' + res.Quality);
        callback(res.Quality);
    });
}

function get_status_on_off(callback) {
    chrome.storage.sync.get('OnOffToggle', function(res) {
        console.log('Value of OnOffToggle is ' + res.OnOffToggle);
        callback(res.OnOffToggle);
    });
}