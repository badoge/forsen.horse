// add array shuffler
Array.prototype.shuffle = function () {
  for (let i = this.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    let temp = this[i];
    this[i] = this[j];
    this[j] = temp;
  }
  return this;
};

const YT_DEFAULT_PLAYLISTS = [
  {
    id: "PLA4XEe9tV8qaSoneg5s5uJYo6HrWnT7T0",
    name: "Forsens BRAND NEW DMCA FREE Asylum playlist of Boomer and Zoomer games",
    desc: "Default playlist that Forsen used during his Minecraft speedruns",
  },
];

// custom playlist support
const YT_API_KEY = "AIzaSyBVPb_QSurBi3q18GYgw0_GfXQ55AYAH1A"; // domain-restricted
const YT_PLAYLIST_BASE = "https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&key=" + YT_API_KEY;
const YT_PLAYLIST_INFO = "https://youtube.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&maxResults=1&key=" + YT_API_KEY;
const YT_STORED_ID_KEY = "fp-external-playlist-id";
const YT_LAST_USED_IDS_KEY = "fp-external-history-ids";
const YT_CUSTOM_PLAYLIST_DATA_KEY = "fp-external-playlist-data";

async function loadPlaylistPortion(playlist, nextPageToken) {
  let link = YT_PLAYLIST_BASE + "&playlistId=" + encodeURIComponent(playlist.id);
  if (typeof nextPageToken === "string") link += "&pageToken=" + nextPageToken;

  const data = await fetch(link).then((r) => r.json());
  if (data.error) {
    console.error(`Playlist item portion fetch failed. Error ${data.error.code} `, data.error.message);
    if (data.error.errors && data.error.errors.length > 1) console.warn("Additional errors:", data.error.errors);
    throw new Error(data.error.message || "Youtube API Error");
  }

  data.items.forEach((item) => {
    const song = {
      title: item.snippet.title || "",
      channel: item.snippet.videoOwnerChannelTitle || "",
      id: item.snippet.resourceId.videoId,
    };
    song.isBroken = !song.channel && (!song.title || song.title.startsWith("Deleted video") || song.title.startsWith("Private video"));
    playlist.items.push(song);
  });

  return data.nextPageToken;
}

class ExtPlaylist {
  constructor(link) {
    if (link.indexOf("?") > 0) {
      // attempt to parse link
      const linkParams = link.slice(link.indexOf("?") + 1).split("&");
      const linkParamId = linkParams.find((params) => params.startsWith("list="));
      if (!linkParamId) throw new Error("Invalid playlist link");
      const playlistId = (linkParamId.slice(linkParamId.indexOf("=") + 1) || "").trim();
      if (!playlistId) throw new Error("Invalid playlist ID");

      this.id = decodeURIComponent(playlistId);
    } else {
      // assume user entered raw playlist id
      this.id = link;
    }
    console.debug("New playlist instantiated. ID: ", this.id);
    this.items = [];
    this.index = 0;
    this.count = 0;
    this.setReady(false); // call this.fetchItems() to load items first
  }

  async fetchData() {
    console.debug("Fetching basic info about playlist from YT API. ID: ", this.id);
    const link = YT_PLAYLIST_INFO + "&id=" + encodeURIComponent(this.id);
    const data = await fetch(link).then((r) => r.json());
    if (data.error) {
      console.error(`Playlist general information fetch failed. Error ${data.error.code} `, data.error.message);
      if (data.error.errors && data.error.errors.length > 1) console.warn("Additional errors:", data.error.errors);
      throw new Error(data.error.message || "Youtube API Error");
    }

    return data.items ? data.items[0] : null;
  }

  async fetchItems() {
    this.setReady(false);
    this.items.length = 0;
    this.index = 0;

    const playlistData = await this.fetchData();
    this.name = playlistData.snippet?.title || this.id;
    this.count = playlistData.contentDetails?.itemCount || 0;

    let nextPageToken = 1;
    console.debug("Fetching playlist items from YT API. ID: ", this.id);
    while (nextPageToken) {
      nextPageToken = await loadPlaylistPortion(this, nextPageToken);
      // MIX playlists are infinite, this is the bandaid fix:
      if (this.count && this.items.length >= this.count) break;
    }
    console.info("Playlist loaded. Total item count: ", this.items.length);
    // shuffle and interactivity toggle should be called manually
    this.ready = true;
    return this;
  }

  setReady(state) {
    this.ready = state;
    toggleInteractionState(state);
    return this;
  }

  reshuffle(event) {
    if (event) {
      // means caused by click, and not in code
      event.target.disabled = true;
      userRequestedPlay = true; // external global state
      setTimeout(() => {
        event.target.disabled = false;
      }, 999);
    }
    this.items.shuffle();
    this.index = -1; // playNextSong() will fix this
    populateVisualPlaylist();
    playNextSong();
    return this.saveShuffleState();
  }

  loadShuffleState() {
    // user wants to ignore previous state
    if (autoReshuffle) return this.reshuffle();

    // check: shuffle order refers to this playlist id
    const extId = localStorage.getItem(YT_STORED_ID_KEY);
    if (extId && this.id !== extId) return this.reshuffle();

    // user prefers to keep on playing (default value)
    try {
      // attempt to load previous playlist order
      const prevShuffle = localStorage.getItem("fp-shuffle-order").split(",");
      const newItems = [],
        items = new Array(this.items.length).fill(null);
      // order items from list as they were shuffled previously
      this.items.forEach((listItem) => {
        const idx = prevShuffle.indexOf(listItem.id);
        if (idx < 0) {
          newItems.push(listItem); // playlist has new song
        } else {
          if (items[idx]) items.splice(idx, 0, null);
          items[idx] = listItem; // place it somewhere near its previous position
        }
      });
      // assign new playlist
      this.items = items
        .filter((item) => item !== null) // filter out songs that might have been removed
        .concat(newItems.shuffle()); // and mix in some new ones
      // attempt to get index, and reset if failed
      try {
        let idx = localStorage.getItem("fp-shuffle-index");
        idx = parseInt(idx, 10);
        if (isNaN(idx)) throw new Error("Bad index stored:" + idx);
        /*
          previous index might drift away a bit if song list has been altered
          meaning if some songs have been replaced, index will point to a different video
          idk, not a big deal probably - just check if it's in bounds (0 .. length-1)
        */
        this.index = Math.min(this.items.length, idx) - 1;
      } catch (e) {
        console.warn("Load index failed", e);
        this.index = -1; // playNextSong increments it to 0
      }
      populateVisualPlaylist();
      playNextSong();
      // create a notifier if new songs were added
      if (newItems.length > 0) {
        const adviceFriend = new bootstrap.Popover(btnGroupShuffle, {
          html: true,
          trigger: "focus",
          placement: "bottom",
          title: "🎶 Playlist updated!",
          content: "New songs were added.<br>You may want to <b>reshuffle</b> the list.",
          template: `<div class="popover pop-taunt" role="tooltip" title="Click to dismiss"><div class="arrow"></div><h3 class="popover-header"></h3><div class="popover-body"></div></div>`,
        });
        adviceFriend.show();
        // add custom popover hider:
        const disposeAndHide = function (event) {
          adviceFriend.hide();
          event.currentTarget.removeEventListener(event.type, disposeAndHide);
        };
        adviceFriend.tip.addEventListener("click", disposeAndHide);
        btnGroupShuffle.addEventListener("click", disposeAndHide);
      }
    } catch (e) {
      console.warn("Load shuffle failed", e);
      // reset and reshuffle
      return this.reshuffle();
    }
    // in case song list has changed - save it again
    return this.saveShuffleState();
  }

  saveShuffleState() {
    const order = this.items.map((item) => item.id).join(",");
    localStorage.setItem("fp-shuffle-order", order);
    return this.saveIndex();
  }
  saveIndex() {
    localStorage.setItem("fp-shuffle-index", this.index);
    return this;
  }

  loadFromStorage() {
    try {
      const data = JSON.parse(localStorage.getItem(YT_CUSTOM_PLAYLIST_DATA_KEY));
      if (!Array.isArray(data)) throw new Error("LocalStorage data is not valid");
      this.items = data;
      this.ready = true; // interactivity can't be enabled just yet
    } catch (e) {
      console.warn("ExtPlaylist load failed", e);
    }
    return this;
  }
  saveToStorage() {
    localStorage.setItem(YT_STORED_ID_KEY, this.id);
    localStorage.setItem(YT_CUSTOM_PLAYLIST_DATA_KEY, JSON.stringify(this.items));

    return this;
  }
}

// create references to controls
const linkToPlaylist = document.getElementById("nowPlayingList"),
  divLoader = document.getElementById("loader"),
  divContent = document.getElementById("content"),
  divPlaylist = document.getElementById("playlistItems"),
  btnUseDefaultPlaylist = document.getElementById("doUseDefaultPlaylist"),
  btnUseCustomPlaylist = document.getElementById("doUseCustomPlaylist"),
  txtCustomPlaylistError = document.getElementById("customPlaylistError"),
  optCustomPlaylist = document.getElementById("inputPlaylistLink"),
  optAutoReshuffle = document.getElementById("optShuffleOnRefresh"),
  optMute = document.getElementById("muteButton"),
  optVolume = document.getElementById("volumeSlider"),
  btnPlayAll = document.getElementById("doPlay"),
  btnPlayAllIcon = document.getElementById("doPlayButtonIcon"),
  btnPlayAllText = document.getElementById("doPlayButtonText"),
  btnNextSong = document.getElementById("doSkipSong"),
  btnGroupShuffle = document.getElementById("ctrlGroupShuffle"),
  btnShuffle = document.getElementById("doShuffle"),
  inputPlaylistSelect = document.getElementById("inputPlaylistSelect"),
  inputPlaylistDescription = document.getElementById("inputPlaylistDescription"),
  inputPlaylistEnter = document.getElementById("inputPlaylistEnter"),
  inputPlaylistDefaultGroup = document.getElementById("inputPlaylistSelectDefault"),
  inputPlaylistCustomGroup = document.getElementById("inputPlaylistSelectCustom"),
  SpinnerHTML = `<div class="spinner-border spinner-border-sm" role="status"><span class="visually-hidden">Loading...</span></div>`;

// player vars:
let player, playerIframe;
let stuckControl = null,
  userRequestedPlay = false; // attempt to autoskip blocked videos
let playlist = null;

// load options:
let autoReshuffle = localStorage.getItem("fp-option-autoshuffle") === "true";
optAutoReshuffle.checked = autoReshuffle;
optAutoReshuffle.addEventListener("change", () => {
  autoReshuffle = optAutoReshuffle.checked;
  localStorage.setItem("fp-option-autoshuffle", autoReshuffle);
});

let muted = localStorage.getItem("fp-option-muted") === "true";
let volume = localStorage.getItem("fp-option-volume");
if (volume === null || isNaN(volume) || volume < 0 || volume > 100) {
  volume = 70;
}
// update html elements for settings
optVolume.value = volume;
optMute.firstElementChild.innerText = updateMuteState(muted);

// load Youtube API:
const tag = document.createElement("script");
tag.src = "https://www.youtube.com/iframe_api";
const firstScriptTag = document.getElementsByTagName("script")[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// eslint-disable-next-line no-unused-vars
function onYouTubeIframeAPIReady() {
  // create player instance:
  player = new YT.Player("YtPlayer", {
    width: "1280",
    height: "720",
    playerVars: {
      hl: "en",
      fs: 0,
      iv_load_policy: 3,
      controls: 1,
      color: "white",
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
    },
  });
  playerIframe = player.getIframe();
}

function playNextSong(force = false) {
  playlist.index += 1;
  if (playlist.index >= playlist.items.length) playlist.index = 0;
  const nextSong = playlist.items[playlist.index];
  const autoplay = force || player.getPlayerState() === YT.PlayerState.PLAYING;

  const callMethod = autoplay ? "loadVideoById" : "cueVideoById";
  player[callMethod](nextSong.id);

  const muteMethod = muted ? "mute" : "unMute";
  player[muteMethod]();

  player.setVolume(volume);
  // playlist control
  document.querySelectorAll("li.active").forEach((elem) => {
    elem.classList.remove("active");
  });
  document.querySelectorAll("#playitem-" + playlist.index).forEach((elem) => {
    elem.classList.add("active");
    if (elem.scrollIntoViewIfNeeded) {
      // scrollIntoView works like ass, scrollIntoViewIfNeeded is not supported by firefox
      elem.scrollIntoViewIfNeeded(false);
    } else if (elem.scrollIntoView) {
      // simulate same behavior as scrollIntoViewIfNeeded for firefox users:
      elem.scrollIntoView({ behavior: "instant", block: "nearest", inline: "nearest" });
    }
  });
  playlist.saveIndex();
}

function updateVolume(value = 0) {
  volume = parseInt(value, 10);
  localStorage.setItem("fp-option-volume", volume);
  try {
    player.setVolume(value); // may fail if player did not load yet
  } catch (e) {
    console.warn("Volume update on player failed", e);
  }
}

function updateMuteState(newValue) {
  muted = newValue === undefined ? !muted : Boolean(newValue);
  localStorage.setItem("fp-option-muted", muted);
  try {
    player[muted ? "mute" : "unMute"](); // may fail if player did not load yet
  } catch (e) {
    console.warn("Mute status update on player failed", e);
  }
  return muted ? "volume_off" : "volume_up";
}

// assign listeners to buttons:
function toggleInteractionState(state = true) {
  btnPlayAll.disabled = !state;
  btnNextSong.disabled = !state;
  btnShuffle.disabled = !state;
  optMute.disabled = !state;
  optVolume.disabled = !state;

  divLoader.style.display = state ? "none" : "";
  divContent.style.display = state ? "" : "none";
}

function onPlayerReady() {
  // init player controls:
  btnPlayAll.addEventListener("click", () => {
    switch (player.getPlayerState()) {
      case YT.PlayerState.PLAYING:
        player.pauseVideo();
        userRequestedPlay = false;
        break;
      default:
        player.playVideo();
        userRequestedPlay = true;
        waitAndSkipSong(999);
        break;
    }
  });
  btnShuffle.addEventListener("click", () => playlist.reshuffle());
  btnNextSong.addEventListener("click", () => playNextSong(false));

  const simpleUpdateVolume = function () {
    return updateVolume(this.value);
  };
  optVolume.addEventListener("input", simpleUpdateVolume);
  optVolume.addEventListener("change", simpleUpdateVolume);
  optVolume.addEventListener("wheel", function (event) {
    this.value = Number(this.value) - 3 * Math.sign(event.deltaY);
    return updateVolume(this.value);
  });

  btnUseCustomPlaylist.addEventListener("click", loadCustomPlaylist);
  optCustomPlaylist.addEventListener("keydown", (event) => {
    if (event.key === "Enter") loadCustomPlaylist();
  });
  optCustomPlaylist.addEventListener("input", () => {
    txtCustomPlaylistError.innerHTML = "";
    //btnUseCustomPlaylist.innerText = optCustomPlaylist.value === playlist.id ? "Update" : "Load";
  });

  // set the playlist:
  try {
    const extId = localStorage.getItem(YT_STORED_ID_KEY);
    if (!extId) throw new Error("No custom playlist stored");

    const existingPlaylist = YT_DEFAULT_PLAYLISTS.find((p) => p.id === extId);
    if (existingPlaylist) {
      useDefaultPlaylist(existingPlaylist);
    } else {
      playlist = new ExtPlaylist(extId);
      playlist.loadFromStorage().setReady(true).loadShuffleState();
      linkToPlaylist.href = "https://www.youtube.com/playlist?list=" + playlist.id;
      linkToPlaylist.innerText = "custom playlist";
    }
  } catch (e) {
    console.info("Failed to load custom playlist; falling back to default.\n", e);
    useDefaultPlaylist(YT_DEFAULT_PLAYLISTS[0]);
  }
}

function onPlayerStateChange(event) {
  // play button state change:
  switch (event.data) {
    case YT.PlayerState.ENDED:
      playNextSong(true);
      break;
    case YT.PlayerState.UNSTARTED:
      if (userRequestedPlay) {
        waitAndSkipSong();
      }
      break;
    case YT.PlayerState.PLAYING:
      clearTimeout(stuckControl);
      userRequestedPlay = true; // forces autoskip of non-loading videos
      btnPlayAll.classList.remove("btn-success");
      btnPlayAll.classList.add("btn-danger");
      btnPlayAllText.innerText = "Stop playing";
      btnPlayAllIcon.innerText = "stop";
      player[muted ? "mute" : "unMute"]();
      player.setVolume(volume);
      break;
    default:
      btnPlayAll.classList.add("btn-success");
      btnPlayAll.classList.remove("btn-danger");
      btnPlayAllText.innerText = "Start playing";
      btnPlayAllIcon.innerText = "play_arrow";
      break;
  }
}

function waitAndSkipSong(time = 2000) {
  clearTimeout(stuckControl);
  stuckControl = setTimeout(() => {
    if (player && player.getPlayerState() < 0) {
      // -1 = player not started -> probably because "video unavailable" or such
      playNextSong(true);
    }
  }, time);
}

function populateVisualPlaylist() {
  divPlaylist.innerHTML = "";

  const runSpecificPlaylistItem = (event) => {
    try {
      const element = event.currentTarget;
      if (element.classList.contains("active")) return; // this song is already playing
      const idx = parseInt(element.dataset.index, 10);
      if (isNaN(idx)) throw new Error("Bad index: " + element.dataset.index);
      playlist.index = idx - 1; // nextSong will increment it
      playNextSong(true);
    } catch (e) {
      console.warn("Item choice error", e);
    }
  };

  playlist.items.forEach((item, idx) => {
    const itemContainer = document.createElement("li");
    itemContainer.classList = "list-group-item list-group-item-action flex-column-nowrap align-items-start no-select";
    itemContainer.id = "playitem-" + idx;
    itemContainer.dataset.index = idx;
    itemContainer.addEventListener("click", runSpecificPlaylistItem);

    const itemTitle = document.createElement("p");
    itemTitle.classList = "m-0 text-break";
    if (item.isBroken) itemTitle.style.color = "#995";
    itemTitle.id = "playitem-title-" + idx;
    itemTitle.innerText = item.title;
    itemContainer.appendChild(itemTitle);

    const itemAuthor = document.createElement("small");
    itemAuthor.classList = "yt-author text-break";
    itemAuthor.id = "playitem-author-" + idx;
    itemAuthor.innerText = item.channel;
    itemContainer.appendChild(itemAuthor);

    divPlaylist.appendChild(itemContainer);
  });
}

function useDefaultPlaylist(playlistInfo) {
  fetch(`/data/playlists/${playlistInfo.id}.json`)
    .then((r) => r.json())
    .then((list) => {
      // everything is ready!
      playlist = new ExtPlaylist(playlistInfo.id);
      playlist.items = list;
      playlist.setReady(true).loadShuffleState();
      localStorage.setItem(YT_STORED_ID_KEY, playlist.id);
      linkToPlaylist.href = "https://www.youtube.com/playlist?list=" + playlist.id;
      linkToPlaylist.innerText = playlistInfo.name;
    })
    .catch((e) => {
      console.error("Playlist parsing error", e);
      showError("An error occured while retrieving list of songs.<br>Try refreshing the page. That will surely help.");
    });
}

async function loadCustomPlaylist() {
  txtCustomPlaylistError.innerHTML = "";
  optCustomPlaylist.disabled = true;
  btnUseCustomPlaylist.disabled = true;

  const currentButtonHTML = btnUseCustomPlaylist.innerHTML;
  btnUseCustomPlaylist.innerHTML = SpinnerHTML;
  try {
    player.pauseVideo();
    userRequestedPlay = false;
    playlist.setReady(false);

    // attempt to load playlist
    const userLink = (inputPlaylistSelect.value || optCustomPlaylist.value || "").trim();
    if (!userLink) throw new Error("Please provide a YouTube link");
    const newPlaylist = new ExtPlaylist(userLink);

    const existingPlaylist = YT_DEFAULT_PLAYLISTS.find((p) => p.id === newPlaylist.id);
    if (existingPlaylist) {
      console.info("Custom playlist is actually a default playlist: ", existingPlaylist);
      playlistModalDialog.hide();
      return useDefaultPlaylist(existingPlaylist);
    }

    await newPlaylist.fetchItems();
    if (newPlaylist.items.length < 1) throw new Error("This playlist is empty!");

    // no errors = playlist loaded
    playlist = newPlaylist.saveToStorage(); // replace current playlist
    playlist.reshuffle().setReady(true);
    playlistModalDialog.hide();
    linkToPlaylist.href = "https://www.youtube.com/playlist?list=" + playlist.id;
    linkToPlaylist.innerText = "custom playlist";

    const history = getCustomHistory();
    if (history.findIndex((x) => x[0] === newPlaylist.id) < 0) {
      history.push([newPlaylist.id, newPlaylist.name]);
    }
    localStorage.setItem(YT_LAST_USED_IDS_KEY, history.map((x) => x.map(encodeURIComponent).join(":")).join(";"));
    populateSelector();
  } catch (e) {
    console.warn("Load custom playlist failed", e);
    txtCustomPlaylistError.innerHTML = e.message;
  } finally {
    optCustomPlaylist.disabled = false;
    optCustomPlaylist.value = "";
    btnUseCustomPlaylist.disabled = false;
    btnUseCustomPlaylist.innerHTML = currentButtonHTML;
    playlist.setReady(true);
  }
}

// initial load:
function getCustomHistory() {
  const str = (localStorage.getItem(YT_LAST_USED_IDS_KEY) || "").trim();
  if (!str) return [];
  const allItems = str.split(";");
  return allItems.map((r) => r.split(":").map(decodeURIComponent));
}

function updateChangePlaylistSection() {
  const value = inputPlaylistSelect.value;
  if (value) {
    const defaultItem = YT_DEFAULT_PLAYLISTS.find((r) => r.id === value);
    if (defaultItem) {
      inputPlaylistDescription.innerHTML = defaultItem.desc;
    } else {
      inputPlaylistDescription.innerHTML = `Custom playlist.`;
    }
    inputPlaylistDescription.innerHTML += `<br><br>Link: <a href="https://www.youtube.com/playlist?list=${value}" target="_blank">YouTube</a>`;
    inputPlaylistEnter.style.display = "none";
  } else {
    inputPlaylistDescription.innerHTML = "";
    inputPlaylistEnter.style.display = "";
  }
}

function populateSelector() {
  const current = localStorage.getItem(YT_STORED_ID_KEY) || YT_DEFAULT_PLAYLISTS[0].id;
  while (inputPlaylistDefaultGroup.firstChild) {
    inputPlaylistDefaultGroup.removeChild(inputPlaylistDefaultGroup.firstChild);
  }
  for (const item of YT_DEFAULT_PLAYLISTS) {
    const opt = document.createElement("option");
    opt.value = item.id;
    opt.innerText = item.name;
    opt.selected = current === item.id;
    inputPlaylistDefaultGroup.appendChild(opt);
  }
  while (inputPlaylistCustomGroup.firstChild) {
    inputPlaylistCustomGroup.removeChild(inputPlaylistCustomGroup.firstChild);
  }
  for (const item of getCustomHistory()) {
    const opt = document.createElement("option");
    opt.value = item[0];
    opt.selected = current === item[0];
    opt.innerText = item[1];
    inputPlaylistCustomGroup.appendChild(opt);
  }
  updateChangePlaylistSection();
}

populateSelector();
inputPlaylistSelect.addEventListener("change", updateChangePlaylistSection);

// bootstrap - load all interactive elements:
const errorModalDialog = new bootstrap.Modal(document.getElementById("modalPanic"));
function showError(htmlString) {
  document.getElementById("modalPanicBody").innerHTML = htmlString;
  errorModalDialog.show();
}

const helperModalDialog = new bootstrap.Modal(document.getElementById("modalHelper"));
const helperModalButton = document.getElementById("helperButton");
helperModalButton.addEventListener("click", () => {
  helperModalDialog.show();
});

const playlistModalDialog = new bootstrap.Modal(document.getElementById("modalExtPlaylist"));
const playlistModalButton = document.getElementById("doChangePlaylist");
playlistModalButton.addEventListener("click", () => {
  playlistModalDialog.show();
});

document.querySelectorAll('main [data-bs-toggle="tooltip"]').forEach(
  (elem) =>
    new bootstrap.Tooltip(elem, {
      placement: "bottom",
      delay: 200,
      trigger: "hover",
    })
);

// hack: create listener for youtube player volume change events - for custom volume slider parity
window.addEventListener("message", function (event) {
  if (playerIframe && event.source === playerIframe.contentWindow) {
    const data = JSON.parse(event.data);
    if (data.event === "infoDelivery" && data.info) {
      // detect if volume changed
      if ("volume" in data.info && data.info.volume !== volume) {
        volume = data.info.volume;
        optVolume.value = volume;
        localStorage.setItem("fp-option-volume", Math.floor(volume));
      }
      // detect if mute state changed
      if ("muted" in data.info && data.info.muted !== muted) {
        muted = data.info.muted;
        optMute.firstElementChild.innerText = muted ? "volume_off" : "volume_up";
        localStorage.setItem("fp-option-muted", muted);
      }
    }
  }
});
