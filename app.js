$(document).ready(function() {
    
    // Playlist data array containing your local tracks
    const tracks = [
        {
            title: "Afghan Jalebi",
            artist: "Arijit Singh, Pritam",
            src: "Songs/afghan.mp3"
        },
        {
            title: "Maand",
            artist: "Bayaan, Hasan Raheem",
            src: "Songs/Maand(KoshalWorld.Com).mp3"
        },
        {
            title: "Pal Pal",
            artist: "Afusic",
            src: "Songs/Pal Pal - Afusic 320KBPS .mp3"
        }
    ];

    let trackIndex = 0;
    let playingState = false;
    
    // Grabbing the HTML5 audio element
    const audioObj = $("#audio-element")[0];

    // Standard function used when switching tracks actively
    function prepareTrack(index) {
        const selectedTrack = tracks[index];
        $("#track-title").text(selectedTrack.title);
        $("#track-artist").text(selectedTrack.artist);
        audioObj.src = selectedTrack.src;
        
        // Dynamic playlist switching highlight
        $("#playlist-queue li").removeClass("active-track");
        $(`#track-id-${index}`).addClass("active-track");
        
        $("#progress-bar").val(0);
        $("#current-time").text("0:00");
    }

    // Safe loader for the very first page load to prevent browser blocks
    function loadTrackInitially(index) {
        const selectedTrack = tracks[index];
        $("#track-title").text(selectedTrack.title);
        $("#track-artist").text(selectedTrack.artist);
        
        // Pre-assign the source file safely
        audioObj.src = selectedTrack.src;
        audioObj.load(); 
        
        $("#playlist-queue li").removeClass("active-track");
        $(`#track-id-${index}`).addClass("active-track");
    }

    // Function to build out our tracklist UI visually
    function initializePlaylist() {
        const queueList = $("#playlist-queue");
        queueList.empty();

        tracks.forEach((track, index) => {
            const trackItem = $(`<li id="track-id-${index}">${index + 1}. ${track.title} - <span>${track.artist}</span></li>`);
            
            // Clicking directly on a track name triggers it safely
            trackItem.on("click", function() {
                trackIndex = index;
                prepareTrack(trackIndex);
                startPlayback();
            });
            queueList.append(trackItem);
        });
    }

    function startPlayback() {
        audioObj.play().then(() => {
            playingState = true;
            $("#btn-play").text("⏸"); // Swaps character icon to Pause
        }).catch(error => {
            console.log("Browser blocked auto-play framework. Click a track directly first.", error);
        });
    }

    function stopPlayback() {
        audioObj.pause();
        playingState = false;
        $("#btn-play").text("▶"); // Swaps character icon to Play
    }

    // Wire up standard play button logic safely
    $("#btn-play").on("click", function() {
        // If the audio source somehow got cleared, reload it
        if (!audioObj.src || audioObj.src === "") {
            prepareTrack(trackIndex);
        }
        
        if (playingState) {
            stopPlayback();
        } else {
            startPlayback();
        }
    });

    // Skip to next track
    $("#btn-next").on("click", function() {
        trackIndex = (trackIndex + 1) % tracks.length;
        prepareTrack(trackIndex);
        startPlayback();
    });

    // Skip to previous track
    $("#btn-prev").on("click", function() {
        trackIndex = (trackIndex - 1 + tracks.length) % tracks.length;
        prepareTrack(trackIndex);
        startPlayback();
    });

    // Keeping track of slider updates in real-time
    $(audioObj).on("timeupdate", function() {
        if (audioObj.duration) {
            const movementPercent = (audioObj.currentTime / audioObj.duration) * 100;
            $("#progress-bar").val(movementPercent);
            $("#current-time").text(convertTime(audioObj.currentTime));
        }
    });

    $(audioObj).on("loadedmetadata", function() {
        $("#duration-time").text(convertTime(audioObj.duration));
    });

    // Manual slider dragging updates song position
    $("#progress-bar").on("input", function() {
        if (audioObj.duration) {
            const targetTime = (parseFloat($(this).val()) / 100) * audioObj.duration;
            audioObj.currentTime = targetTime;
        }
    });

    // Automatically plays next track when one finishes
    $(audioObj).on("ended", function() {
        $("#btn-next").click();
    });

    // Time translation calculation utility
    function convertTime(seconds) {
        if (isNaN(seconds)) return "0:00";
        let m = Math.floor(seconds / 60);
        let s = Math.floor(seconds % 60);
        if (s < 10) s = "0" + s;
        return `${m}:${s}`;
    }

    // Kickstart the app loop cleanly
    initializePlaylist();
    loadTrackInitially(trackIndex);
});