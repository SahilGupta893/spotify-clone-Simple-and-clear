let currSong = new Audio();
let songs;

function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs() {
  let a = await fetch("http://127.0.0.1:3000/songs");
  let response = await a.text();
  //   console.log(response);
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");

  let songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split("/songs/")[1]);
    }
  }
  return songs;
}

const playMusic = (track , pause = false) => {
  // let audio = new Audio("/songs/" + track);
  currSong.src = "/songs/" + track;
  if(!pause){
    currSong.play();
    play.src = "pause.svg";
  }
  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00/00:00";
};

async function main() {
  // get the list of all songs
  songs = await getSongs();
  console.log(songs);
  playMusic(songs[0] , true)

  // Show all the songs in the playlist
  let songUL = document
    .querySelector(".songlist")
    .getElementsByTagName("ul")[0];
  for (const song of songs) {
    songUL.innerHTML =
      songUL.innerHTML +
      `<li> 
    <img src="music.svg" alt="">
                            <div class="info">
                                <div> ${song.replaceAll("%20", " ")}</div>
                                <div>Song Artist</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img src="play.svg" alt="">
                            </div>
   </li>`;
  }

  // Attach an event listener to each song
  Array.from(
    document.querySelector(".songlist").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      console.log(e.querySelector(".info").firstElementChild.innerHTML);
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });

  // Attach an event listener to play , next and previous
  play.addEventListener("click", () => {
    if (currSong.paused) {
      currSong.play();
      play.src = "pause.svg";
    } else {
      currSong.pause();
      play.src = "play.svg";
    }
  });

  //listen for timeupdate event
  currSong.addEventListener("timeupdate" , ()=>{
    console.log(currSong.currentTime , currSong.duration);
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currSong.currentTime)}/${secondsToMinutesSeconds(currSong.duration)}`
    document.querySelector(".circle").style.left = (currSong.currentTime / currSong.duration) * 100 + "%";
  })

  // Add an event listener to seekbar
  document.querySelector(".seekbar").addEventListener("click" , e=>{
    document.querySelector(".circle").style.left = (e.offsetX / e.target.getBoundingClientRect().width) * 100 + "%";
    currSong.currentTime = ((currSong.duration) * (e.offsetX / e.target.getBoundingClientRect().width) * 100) / 100
  })

  // Add an event listner for hamburger
  document.querySelector(".hamburger").addEventListener("click" , ()=>{
    document.querySelector(".left").style.left = "0"
  })

  // Add an event listner for close
  document.querySelector(".close").addEventListener("click" , ()=>{
    document.querySelector(".left").style.left = "-120%"
  })

  //Add an event listner to previous and next
  previous.addEventListener("click" , ()=>{
    console.log("Previous clicked")
    console.log(currSong)
    let index = songs.indexOf(currSong.src.split("/").slice(-1) [0])
    if((index - 1) > 0){
      playMusic(songs[index - 1])
    }
  })

  // Add an event listner next
  next.addEventListener("click" , ()=>{
    console.log("Next clicked")

    let index = songs.indexOf(currSong.src.split("/").slice(-1) [0])
    if((index + 1) < songs.length){
      playMusic(songs[index + 1])
    }
  })
    
}

main();
