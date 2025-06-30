document.addEventListener('DOMcontentdownloaded', function(audioPlayer))
const audioPlayer = document.createElement('audio');
audioPlayer.id = 'audioPlayer';
document.body.appendChild(audioPlayer);

const pausebutton = document.getElementById('pausebutton');
pausebutton.addEventListener('click', function() {
    if (audioPlayer.paused) {
        audioPlayer.play();
    } else {
        audioPlayer.pause();
    }
});