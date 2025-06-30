const audioPlayer = document.createElement('audio');
audioPlayer.id = 'audio-player';
audioPlayer.controls = true;

const playerContainer = document.createElement('div');
playerContainer.className = 'audio-player-container';

// Custom playlist
const playlist = [
    {
        title: 'Honey This Mirror Isn_t Big Enough for the Two of Us - My Chemical Romance',
        src: './music/SpotifyMate.com - Honey_ This Mirror Isn_t Big Enough for the Two of Us - My Chemical Romance.mp3'
    },
    {
        title: 'I Caught Myself - Paramore', 
        src: './music/SpotifyMate.com - I Caught Myself - Paramore.mp3'
    }
];

let currentTrackIndex = 0;
console.log("Current Track Index:", currentTrackIndex);

// Create playlist display
const playlistElement = document.createElement('div');
playlistElement.className = 'playlist';
playlist.forEach((song, index) => {
    const songElement = document.createElement('div');
    songElement.className = 'playlist-item';
    songElement.textContent = song.title;
    songElement.onclick = () => {
        currentTrackIndex = index;
        console.log("Current Track Index:", currentTrackIndex);
        loadAndPlayTrack(index);
    };
    playlistElement.appendChild(songElement);
});

// Create custom audio player elements
const customAudioPlayer = document.createElement('div');
customAudioPlayer.className = 'custom-audio-player';

const playPauseButton = document.createElement('button');
playPauseButton.className = 'play-pause-btn';
playPauseButton.innerHTML = '▶';

const timeline = document.createElement('input');
timeline.type = 'range';
timeline.className = 'timeline';
timeline.value = 0;

const timeDisplay = document.createElement('div');
timeDisplay.className = 'time-display';
timeDisplay.textContent = '0:00 / 0:00';

const volumeControl = document.createElement('input');
volumeControl.type = 'range';
volumeControl.className = 'volume';
volumeControl.min = 0;
volumeControl.max = 1;
volumeControl.step = 0.1;
volumeControl.value = 1;

const audioElement = new Audio();

// Add event listeners
playPauseButton.onclick = () => {
    if (audioElement.paused) {
        audioElement.play();
        playPauseButton.innerHTML = '⏸';
    } else {
        audioElement.pause();
        playPauseButton.innerHTML = '▶';
    }
};

timeline.oninput = (e) => {
    const time = (timeline.value * audioElement.duration) / 100;
    audioElement.currentTime = time;
};

audioElement.ontimeupdate = () => {
    const percent = (audioElement.currentTime / audioElement.duration) * 100;
    timeline.value = percent;
    
    const currentMinutes = Math.floor(audioElement.currentTime / 60);
    const currentSeconds = Math.floor(audioElement.currentTime % 60);
    const durationMinutes = Math.floor(audioElement.duration / 60) || 0;
    const durationSeconds = Math.floor(audioElement.duration % 60) || 0;
    
    timeDisplay.textContent = `${currentMinutes}:${currentSeconds.toString().padStart(2, '0')} / ${durationMinutes}:${durationSeconds.toString().padStart(2, '0')}`;
};

volumeControl.oninput = (e) => {
    audioElement.volume = e.target.value;
};

// Update loadAndPlayTrack function
function loadAndPlayTrack(index) {
    if (index >= 0 && index < playlist.length) {
        audioElement.src = playlist[index].src;
        audioElement.play();
        playPauseButton.innerHTML = '⏸';
    }
}

// Add controls
const prevButton = document.createElement('button');
prevButton.textContent = 'Previous';
prevButton.onclick = () => {
    currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
    console.log("Current Track Index:", currentTrackIndex);
    loadAndPlayTrack(currentTrackIndex);
};

const nextButton = document.createElement('button');
nextButton.textContent = 'Next';
nextButton.onclick = () => {
    currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
    console.log("Current Track Index:", currentTrackIndex);
    loadAndPlayTrack(currentTrackIndex);
};

// Assemble custom player
customAudioPlayer.appendChild(playPauseButton);
customAudioPlayer.appendChild(timeline);
customAudioPlayer.appendChild(timeDisplay);
customAudioPlayer.appendChild(volumeControl);

// Update player assembly (replace audioPlayer with customAudioPlayer)
playerContainer.appendChild(customAudioPlayer);
playerContainer.appendChild(prevButton);
playerContainer.appendChild(nextButton);
playerContainer.appendChild(playlistElement);

// Add styles
const styles = document.createElement('style');
styles.textContent = `
    .audio-player-container {
        max-width: 500px;
        margin: 20px auto;
        padding: 20px;
        border: 1px solid #8B0000;
        border-radius: 2px
        background-color: #000000;
        color: #ffffff;    
    }
    
    .playlist {
        margin-top: 20px;
    }
    
    .playlist-item {
        padding: 10px;
        cursor: pointer;
        border: 1px solid #8B0000;
    }
    
    .playlist-item:hover {
        background-color:rgb(20, 20, 20);
    }
    
    button {
        margin: 10px 5px;
        padding: 5px 10px;
        border-radius: 2px;
        background-color: #000000;
        color: #ffffff;
        border: 1px solid #8B0000;
    }
    button:hover {
        background-color:rgb(34, 34, 34);
        cursor: pointer;
    }
    
    /* Audio player custom styles */
    audio {
        background-color: #8B0000;
        border-radius: 2px;
    }
    
    audio::-webkit-media-controls-panel {
        background-color: #8B0000;
    }
    
    audio::-webkit-media-controls-current-time-display,
    audio::-webkit-media-controls-time-remaining-display {
        color:rgb(255, 255, 255);
    }
    
    audio::-webkit-media-controls-play-button,
    audio::-webkit-media-controls-mute-button {
        background-color:rgb(100, 0, 0);
        border: 10px solid black;
    }
    
    audio::-webkit-media-controls-timeline {
        background-color: #8B0000;
    }
    audio {
        box-shadow: none;
        outline: none;
        border-radius: none;
        transform: scale(1.01); /* Forces a slight scale-up to remove artifacts */
        image-rendering: crisp-edges;
    }
    audio,
    audio::-webkit-media-controls-panel {
        background-color: #8B0000; /* Match your theme */
        background-clip: border-box;
    }
    
    .custom-audio-player {
        background-color: #8B0000;
        padding: 10px;
        border-radius: 2px;
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .timeline {
        flex-grow: 1;
        height: 5px;
        background: #000000;
        cursor: pointer;
    }
    
    .timeline::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 12px;
        height: 12px;
        background: #ffffff;
        border-radius: 50%;
        cursor: pointer;
    }
    
    .volume {
        width: 100px;
        height: 5px;
        background: #000000;
    }
    
    .volume::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 12px;
        height: 12px;
        background: #ffffff;
        border-radius: 50%;
        cursor: pointer;
    }
    
    .time-display {
        color: #ffffff;
        font-size: 14px;
        min-width: 100px;
    }
    
    .play-pause-btn {
        background-color: rgb(100, 0, 0);
        color: white;
        border: none;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
    }
    
    .play-pause-btn:hover {
        background-color: rgb(120, 0, 0);
    }
`;

document.head.appendChild(styles);
document.body.appendChild(playerContainer);
