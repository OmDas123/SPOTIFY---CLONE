
let currentSong = new Audio();
let songs = [];
let currentSongIndex = 0;

async function getsongs() {
    let a = await fetch("http://127.0.0.1:3000/songs/");
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");

    let songsArray = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            let cleanHref = element.href.replaceAll("\\", "/");
            let fileName = cleanHref.split("/").pop();
            songsArray.push(decodeURIComponent(fileName).trim());
        }
    }
    return songsArray;
}
const playMusic = (track, forceIndex = -1, pause = false) => {
    let cleanTrack = decodeURIComponent(track.split(/[\/\\]/).pop()).trim();
    
    if (forceIndex !== -1) {
        currentSongIndex = forceIndex;
    } else {
        let searchName = cleanTrack.toLowerCase().replace(".mp3", "");
        currentSongIndex = songs.findIndex(s => s.toLowerCase().includes(searchName));
        
        if (currentSongIndex === -1) currentSongIndex = 0; 
    }

    currentSong.src = "http://127.0.0.1:3000/songs/" + encodeURIComponent(cleanTrack);
    
    if (!pause) {
        currentSong.play();
        document.getElementById("play").src = "pause.svg";
    }
    
    document.querySelector(".songinfo").innerHTML = cleanTrack.replace(".mp3", "");
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";

 }
async function main() {
    songs = await getsongs();
    let playButton = document.getElementById("play");
     

    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            let songName = e.querySelector(".info").firstElementChild.innerHTML.trim();
           
            playMusic(songName + ".mp3", -1); 
        });
    });

  
    playButton.addEventListener("click", () => {
        if (currentSong.src === "") return;
        if (currentSong.paused) {
            currentSong.play();
            playButton.src = "pause.svg";
        } else {
            currentSong.pause();
            playButton.src = "play.svg";
        }
    });

    
    currentSong.addEventListener("timeupdate", () => {
        let currentMin = Math.floor(currentSong.currentTime / 60);
        let currentSec = Math.floor(currentSong.currentTime % 60);
        let durMin = Math.floor(currentSong.duration / 60);
        let durSec = Math.floor(currentSong.duration % 60);

        if (currentSec < 10) currentSec = "0" + currentSec;
        if (durSec < 10) durSec = "0" + durSec;
        if (currentMin < 10) currentMin = "0" + currentMin;
        if (durMin < 10) durMin = "0" + durMin;

        if (isNaN(durMin) || isNaN(durSec)) {
            document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
        } else {
            document.querySelector(".songtime").innerHTML = `${currentMin}:${currentSec} / ${durMin}:${durSec}`;
        }
        
        let progressPercent = (currentSong.currentTime / currentSong.duration) * 100;
        document.querySelector(".circle").style.left = progressPercent + "%";
    });

    
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    });

   
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-130%";
    });

    
    document.getElementById("previous").addEventListener("click", () => {
        if (currentSong.src === "") return;
        
        if (currentSongIndex > 0) {
            let newIndex = currentSongIndex - 1;
            // Physically force the new index number through
            playMusic(songs[newIndex], newIndex); 
        }
    });

    
    document.getElementById("next").addEventListener("click", () => {
        if (currentSong.src === "") return;
        
        if (currentSongIndex + 1 < songs.length) {
            let newIndex = currentSongIndex + 1;
           
            playMusic(songs[newIndex], newIndex); 
        }
    });
}

    document.querySelector("#volume").addEventListener("change", (e) => {
        console.log("Setting volume to", e.target.value, "/ 100");
        
        currentSong.volume = parseInt(e.target.value) / 100;
    });

main();