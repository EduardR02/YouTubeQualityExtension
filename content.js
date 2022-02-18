
var youtube_link = "youtube.com/watch";

chrome.runtime.onMessage.addListener(gotMessage);


function gotMessage(request, sender, sendResponse) {
    console.log(request.message);
    if (request.message === "change_needed") {
        if (request.url.includes(youtube_link)) {
            change_quality();
        }
    }
    else if(request.message === "hello") {
        console.log("hi");
    }
}

function injectStuff(quality) {
    let actualCode = '(' + change_quality_help + ')(' + JSON.stringify(quality) + ')';
    let script = document.createElement('script');
    script.textContent = actualCode;
    (document.head||document.documentElement).appendChild(script);
    script.remove();
}



function change_quality_help(quality) {
    let player = document.querySelectorAll('.html5-video-player');
    // bug where there are multiple players,
    // but the first one is a preview player (when you hover over a video) and is very limited,
    // second one is the one that is the actual video
    if (player.length == 0) {
        console.log("No player found, quality could not be changed");
        return;
    }
    player = player[player.length - 1];
    if (quality) {
        player.setPlaybackQualityRange(quality);
        if (player.getPlayerState() === 5) {
            let my_listener_func = function (data) {
                player = document.querySelectorAll('.html5-video-player');
                if (player.length == 0) {
                    console.log("No player found, quality could not be changed");
                    return;
                }
                player = player[player.length - 1];
                // technically doesn't need to timeout, but if it doesn't then lower qualities
                // have enough time to preload and will run on lower quality until buffer is played.
                // This (probably) ensures immediate change, as this overrides the preload because it doesnt
                // fire on exact time of loading.
                setTimeout(function () {player.setPlaybackQualityRange(quality);}, 50);
                console.log("Quality changed (after retrying) to: " + quality);
                player.removeEventListener("onStateChange", my_listener_func);
                my_listener_func = function () {};
            };
            player.addEventListener("onStateChange", my_listener_func);
        }
        else {
            //player.playVideo();
            
            console.log("Quality successfully changed to: " + quality);
        }
    }
    else {
        console.log("Error: Could not set quality");
    }
}

function change_quality() {
    get_status_on_off(function(isOn) {
        if (isOn) {
            get_quality(function(quality) {
                // injecting change_quality_help here
                injectStuff(quality);
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
