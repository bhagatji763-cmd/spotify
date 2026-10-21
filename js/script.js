let currentAudio = new Audio();
let songs = [];
let currentSongIndex = -1;
let currfolder;


function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}



async function getSongs(folder) {
    currfolder = folder
    let info = await fetch(`http://127.0.0.1:3000/${currfolder}/`);

    let response = await info.text();

    let div = document.createElement("div");

    div.innerHTML = response;

    let href = div.getElementsByTagName("a");

    songs = [];

    for (let index = 0; index < href.length; index++) {
        const element = href[index];

        if (element.href.endsWith(".mp3")) {
            songs.push(element.href);
        }
    }


    // currentSongIndex = 0;
    playmusic(songs[0], true);

    let songUl = document.querySelector(".songlist").getElementsByTagName("ul")[0];
    songUl.innerHTML = ""


    for (const song of songs) {

        let songName = getSongName(song);

        songUl.innerHTML += `
            <li data-song="${song}">
                <img class="invert" src="music.svg" alt="">

                <div class="info">
                    <div>${songName}</div>
                </div>

                <div class="playnow">
                    <span>Play Now</span>
                    <img class="invert" src="play.svg" alt="">
                </div>
            </li>`;
    }


    Array.from(
        document.querySelector(".songlist")
            .getElementsByTagName("li")).forEach(e => {

                e.addEventListener("click", () => {

                    let track = e.dataset.song;

                    playmusic(track);

                });

            });

    return songs;
}





const getSongName = (track) => {
    return decodeURIComponent(track)
        .replace(/\\/g, "/")
        .split("/")
        .pop()
        .replace(/\.mp3$/i, "")
        .replace(/\s*-\s*[^-]+$/, "")
        .replace(/^C/, "")
        .trim();
};



const playmusic = (track, pause = false) => {

    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }

    const songIndex = songs.indexOf(track);
    if (songIndex !== -1) {
        currentSongIndex = songIndex;
    }

    currentAudio = new Audio(track);


    if (!pause) {
        currentAudio.play();
        play.src = "pause.svg";
    }


    document.querySelector(".songinfo").textContent = getSongName(track);
    document.querySelector(".songTime").innerHTML = "00:00 / 00:00";

    currentAudio.addEventListener("timeupdate", () => {
        document.querySelector(".songTime").innerHTML = `${secondsToMinutesSeconds(currentAudio.currentTime)} / ${secondsToMinutesSeconds(currentAudio.duration)}`;
        document.querySelector(".circle").style.left = `${(currentAudio.currentTime / currentAudio.duration) * 100}%`;
    });

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.currentTarget.offsetWidth) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentAudio.currentTime = (percent / 100) * currentAudio.duration;
    })

};

async function displayAlbums() {
    let info = await fetch(`http://127.0.0.1:3000/songs/`);
    let response = await info.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let archors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")

  let array =  Array.from(archors)
          for (let index = 0; index < array.length; index++) {
            const e = array[index];
            
        if (e.href.includes("%5C")) {
            let folder = (e.href.split("%5C").slice(-1)[0].replace("/", ""));
            let info = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
            let response = await info.json();
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
                        <div class="play">

                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40">

                                <path fill="black"
                                    d="M14.581 9.402C16.194 10.718 17 11.375 17 12.5s-.806 1.783-2.419 3.098a23 23 0 0 1-1.292.99c-.356.25-.759.508-1.176.762c-1.609.978-2.413 1.467-3.134.926c-.722-.542-.787-1.675-.918-3.943A33 33 0 0 1 8 12.5c0-.563.023-1.192.06-1.833c.132-2.267.197-3.401.919-3.943c.721-.541 1.525-.052 3.134.926c.417.254.82.512 1.176.762a23 23 0 0 1 1.292.99">
                                </path>
                            </svg>
                        </div>
                        <img src="/songs/${folder}/cover.webp" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`
        }

    }

    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            playmusic(songs[0])
        });
    });

    }




// Load the playlist whenever card is clicked
Array.from(document.getElementsByClassName("card")).forEach(e => {
    e.addEventListener("click", async item => {
        songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
        playmusic(songs[0])

    })
})




async function main() {

    displayAlbums()

    await getSongs("songs/ncs")

    playmusic(songs[0], true)


    play.addEventListener("click", () => {
        if (currentAudio.paused) {
            currentAudio.play();
            play.src = "pause.svg";
        } else {
            currentAudio.pause();
            play.src = "play.svg";
        }
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });


    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-130%";
    });

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentAudio.volume = parseInt(e.target.value) / 100;
    });
    
    document.querySelector(".volume>img").addEventListener("click" , e => {
       if(e.target.src.includes  ("volume.svg")){
        e.target.src = e.target.src.replace("volume.svg" , "mute.svg")
        currentAudio.volume = 0;
        document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
            
        } else {
         e.target.src = e.target.src.replace("mute.svg" , "volume.svg")
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    })
    

    prev.addEventListener("click", () => {
        if (currentSongIndex > 0) {
            playmusic(songs[currentSongIndex - 1]);
        }
    });


    next.addEventListener("click", () => {
        if (currentSongIndex + 1 < songs.length) {
            playmusic(songs[currentSongIndex + 1]);
        }
    });


    
}

main();