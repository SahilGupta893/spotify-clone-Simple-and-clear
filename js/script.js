let currSong = new Audio();
let songs;
let currFolder;

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

async function getSongs(folder) {
  currFolder = folder;
  let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
  let response = await a.text();
  //   console.log(response);
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");

  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }

  //Play the first song


  // Show all the songs in the playlist
  let songUL = document
    .querySelector(".songlist")
    .getElementsByTagName("ul")[0];
  songUL.innerHTML = "";
  for (const song of songs) {
    songUL.innerHTML =
      songUL.innerHTML +
      `<li> 
    <img src="img/music.svg" alt="">
                            <div class="info">
                                <div> ${song.replaceAll("%20", " ")}</div>
                                
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img src="img/play.svg" alt="">
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

  const allListItems = document.querySelectorAll(".songlist li");
  allListItems.forEach((li, index) => {
    li.addEventListener("click", () => {
      const clickedSong = songs[index];
      playMusic(clickedSong);

      // Reset all to default
      allListItems.forEach((el) => {
        el.querySelector(".playnow span").innerText = "Play Now";
        el.querySelector(".playnow img").src = "img/play.svg";
      });
  
      // Set this one to "Playing"
      li.querySelector(".playnow span").innerText = "Playing";
      li.querySelector(".playnow img").src = "img/pause.svg";
    });
  });

  return songs
}

const playMusic = (track, pause = false) => {
  // let audio = new Audio("/songs/" + track);
  currSong.src = `/${currFolder}/` + track;
  if (!pause) {
    currSong.play();
    play.src = "img/pause.svg";
  }
  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00/00:00";
};

async function displayAlbums() {
  let a = await fetch(`http://127.0.0.1:3000/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".cardContainer");
  let array = Array.from(anchors);

  let cardsHTML = '';
  let folders = [];

  for (let index = 0; index < array.length; index++) {
    const e = array[index];
    if (e.href.includes("/songs")) {
      let folder = e.href.split("/").slice(-2)[0];
      let meta = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
      let data = await meta.json();
      folders.push(folder);

      cardsHTML += `
        <div data-folder="${folder}" class="card" style="display: ${index < 5 ? 'inline-block' : 'none'};">
          <div class="play">
            <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="50" fill="green" />
              <polygon points="40,30 70,50 40,70" fill="black" />
            </svg>
          </div>
          <img src="/songs/${folder}/cover.jpg" alt="">
          <h2>${data.title}</h2>
          <p>${data.description}</p>
        </div>`;
    }
  }

  // Inject cards
  cardContainer.innerHTML = cardsHTML;

  // Add Show More / Less buttons
  let buttonWrapper = document.createElement("div");
  buttonWrapper.style.display = "flex";
  buttonWrapper.style.justifyContent = "flex-end";
  buttonWrapper.style.gap = "10px";
  buttonWrapper.style.marginBottom = "10px";

  const showMoreBtn = document.createElement("button");
  const showLessBtn = document.createElement("button");

  showMoreBtn.innerText = "Show all";
  showLessBtn.innerText = "Less";
  showLessBtn.style.display = "none"; // Start hidden

  [showMoreBtn, showLessBtn].forEach((btn) => {
  btn.style.padding = "8px 24px";
  btn.style.cursor = "pointer";
  btn.style.backgroundColor = "transparent";
  btn.style.color = "rgb(156, 148, 148)";
  btn.style.border = "none";
  btn.style.fontSize = "16px";
  btn.style.fontWeight = "bold";
  btn.style.transition = "all 0.3s ease-in-out";
  btn.style.borderRadius = "30px";
});

showMoreBtn.addEventListener("mouseenter", () => {
  showMoreBtn.style.color = "white";
});
showMoreBtn.addEventListener("mouseleave", () => {
  showMoreBtn.style.color = "rgb(156, 148, 148)";
});

showLessBtn.addEventListener("mouseenter", () => {
  showLessBtn.style.color = "white";
});
showLessBtn.addEventListener("mouseleave", () => {
  showLessBtn.style.color = "rgb(156, 148, 148)";
});


  buttonWrapper.appendChild(showMoreBtn);
  buttonWrapper.appendChild(showLessBtn);
  cardContainer.parentNode.insertBefore(buttonWrapper, cardContainer);

  const allCards = cardContainer.querySelectorAll(".card");

  showMoreBtn.addEventListener("click", () => {
    allCards.forEach(card => card.style.display = "inline-block");
    showMoreBtn.style.display = "none";
    showLessBtn.style.display = "inline-block";
  });

  showLessBtn.addEventListener("click", () => {
    allCards.forEach((card, index) => {
      card.style.display = index < 5 ? "inline-block" : "none";
    });
    showLessBtn.style.display = "none";
    showMoreBtn.style.display = "inline-block";
  });

  // Load the playlist on click
  allCards.forEach((card) => {
    card.addEventListener("click", async (item) => {
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
      playMusic(songs[0]);
    });
  });
  
}



async function main() {
  // get the list of all songs
  await getSongs("songs/ncs");
  console.log(songs);
  playMusic(songs[0], true);

  // Display all the albumns on the page
  displayAlbums();

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
  currSong.addEventListener("timeupdate", () => {
    console.log(currSong.currentTime, currSong.duration);
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(
      currSong.currentTime
    )}/${secondsToMinutesSeconds(currSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currSong.currentTime / currSong.duration) * 100 + "%";
  });

  // Add an event listener to seekbar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    document.querySelector(".circle").style.left =
      (e.offsetX / e.target.getBoundingClientRect().width) * 100 + "%";
    currSong.currentTime =
      (currSong.duration *
        (e.offsetX / e.target.getBoundingClientRect().width) *
        100) /
      100;
  });

  // Add an event listner for hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  // Add an event listner for close
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  //Add an event listner to previous and next
  previous.addEventListener("click", () => {
    console.log("Previous clicked");
    console.log(currSong);
    let index = songs.indexOf(currSong.src.split("/").slice(-1)[0]);
    if (index - 1 > 0) {
      playMusic(songs[index - 1]);
    }
  });

  // Add an event listner next
  next.addEventListener("click", () => {
    console.log("Next clicked");
    console.log("Current song src:", currSong.src);
  console.log("Songs list:", songs);

    let index = songs.indexOf(currSong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });
  

  // Add an event in volume
  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      console.log(e);
      currSong.volume = parseInt(e.target.value) / 100;
    });

  // Add event listner to mute the track
  document.querySelector(".volume > img").addEventListener("click", (e) => {
    console.log(e.target);
    if (e.target.src.includes("volume.svg")) {
      e.target.src = e.target.src.replace("volume.svg", "mute.svg");
      currSong.volume = 0;
      document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
    } else {
      e.target.src = e.target.src.replace("mute.svg", "volume.svg");
      currSong.volume = 0.1;
      document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
    }
  });

  // handle 'M' key to mute
 document.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() === "m") {
    const volumeIcon = document.querySelector(".volume > img");
    const volumeSlider = document.querySelector(".range").getElementsByTagName("input")[0];

    if (currSong.volume > 0) {
      volumeIcon.src = volumeIcon.src.replace("volume.svg", "mute.svg");
      currSong.volume = 0;
      volumeSlider.value = 0;
    }
  }
});

// Handle 'U' key to unmute
document.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() === "u") {
    const volumeIcon = document.querySelector(".volume > img");
    const volumeSlider = document.querySelector(".range").getElementsByTagName("input")[0];

    if (currSong.volume === 0) {
      volumeIcon.src = volumeIcon.src.replace("mute.svg", "volume.svg");
      currSong.volume = 0.1;
      volumeSlider.value = 10;
    }
  }
});


}

main();
