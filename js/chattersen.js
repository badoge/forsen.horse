function $(query) {
  return document.querySelector(query);
}

function $$(query) {
  return Array.from(document.querySelectorAll(query));
}

function showError(htmlString) {
  $("#modalPanicBody").innerHTML = htmlString;
  modals.error.show();
}

function sanitize(text = "") {
  const sanitizer = document.createElement("div");
  sanitizer.innerText = text;
  return sanitizer.innerHTML;
}

function emotify(message) {
  const text = sanitize(message);
  const forceMapping = {
    ":)": "_smile",
  };
  const words = text.split(/\s/).map((w) => {
    const emote = forceMapping[w] || w;
    if (emotes.includes(emote)) {
      return `<img src="/pics/emotes/${emote}.png" class="chat-emote" title="${w}" data-bs-toggle="tooltip">`;
    }
    return w;
  });
  return words.join(" ");
}

function dateToText(date) {
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  };
  return new Date(date).toLocaleDateString(undefined, options);
}

function isMobileClient() {
  // yoinked from nytimes wordle
  let userAgent = navigator.userAgent || navigator.vendor || window.opera;
  return (
    /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
      userAgent
    ) ||
    /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
      userAgent.substr(0, 4)
    )
  );
}

function createNodeOfMessage(message = {}, hidden = true) {
  const main = document.createElement("div");
  main.classList = "game-container message-container appear-in";

  // TOP: sender w/ badges, message
  const top = document.createElement("div");
  top.classList = "message-content text-break";

  const sender = document.createElement("span");
  sender.classList = "msg-sender";
  let badgeList = badges.$default;
  if (badges.hasOwnProperty(message.channel)) {
    badgeList = badges[message.channel].concat(badgeList);
  }
  let authorText = "";
  badgeList.forEach((badge) => {
    authorText += `<img src="/pics/badges/${badge}.png" class="chat-badge" title="${badge}">`;
  });
  sender.innerHTML = authorText + message.author;
  top.appendChild(sender);

  const text = document.createElement("span");
  text.classList = "msg-text";
  text.innerHTML = emotify(message.text);
  const tooltips = Array.from(text.querySelectorAll("img.chat-emote"));
  message.tooltips = tooltips.map(
    (t) =>
      new bootstrap.Tooltip(t, {
        trigger: "hover",
      })
  );
  top.appendChild(text);

  // BOTTOM: sent at, channel name
  const bottom = document.createElement("div");
  bottom.classList = "message-content text-break";

  const sentAt = document.createElement("span");
  sentAt.classList = "badge bg-info message-date text-wrap text-start";
  if (hidden) {
    sentAt.innerText = dateToText(Math.random() * 123456789);
    sentAt.classList.add("date-unknown");
  } else {
    sentAt.innerText = dateToText(message.date);
  }
  bottom.appendChild(sentAt);

  const channel = document.createElement("span");
  channel.classList = "msg-channel";
  channel.innerText = message.channel;
  bottom.appendChild(channel);

  main.appendChild(bottom);
  main.appendChild(top);
  $("#game").appendChild(main);
  return main;
}

const modals = {
  error: "#modalPanic",
  welcome: "#modalWelcome",
};

const badges = {
  forsen: ["broadcaster", "forsen-7y"],
  nani: ["moderator", "nani-4y"],
  $default: ["verified"],
};

const emotes = [
  "BabyRage",
  "EZ",
  "FBCatch",
  "forsen1",
  "forsenBlob",
  "forsenBoshE",
  "forsenBridge",
  "forsenD",
  "forsenE",
  "forsenE1",
  "forsenE2",
  "forsenEE",
  "forsenEZ",
  "forsenGASM",
  "forsenJabroni",
  "forsenKek",
  "forsenKraken",
  "forsenOG",
  "forsenPrime",
  "Kapp",
  "Kappa",
  "LUL",
  "LULE",
  "LULW",
  "OMEGALUL",
  "PagMan",
  "Pepega",
  "Pepepains",
  "Pog",
  "SeemsGood",
  "SnickersHype",
  "xqcL",
  "_smile_",
];

const app = {
  messages: [],
  pool: [],
  prev: null,
  next: null,
  gameOver: true,
  score: 0,
  stats: {
    // saves as localStorage::chattersen-stats
    games: 0, // total game count
    last: 0, // last run streak
    best: 0, // best streak
    avg: 0, // avg streak
    lastvisit: null, // date object - when user last visited this page
  },
  nodes: {
    // html nodes
    buttons: $$("button.game-choice"),
    controls: $("#gameControls"),
  },
  src: "/data/chattersen-forsen.txt",
};

function loadStats() {
  try {
    let stats = localStorage.getItem("chattersen-stats");
    stats = JSON.parse(stats);
    Object.keys(app.stats).forEach((k) => {
      if (stats.hasOwnProperty(k)) app.stats[k] = stats[k];
    });
    app.stats.lastvisit = new Date(app.stats.lastvisit);
  } catch (e) {
    console.warn("Failed to load stats", e);
  }
}

function saveStats() {
  try {
    app.stats.lastvisit = new Date();
    localStorage.setItem("chattersen-stats", JSON.stringify(app.stats));
  } catch (e) {
    console.warn("Failed to save stats", e);
  }
}

function resetGame() {
  $("#gameOverArea").style.display = "none";
  if (app.messages.length < 1) {
    return showError("🤔 Who is Forsen?<br>There are no messages from this chatter!");
  }
  app.nodes.controls.parentElement.removeChild(app.nodes.controls);
  // clean up props from previous game
  [app.next, app.prev].forEach((msg) => {
    if (!msg) return;
    if (msg.node) {
      msg.node.parentElement.removeChild(msg.node);
      delete msg.node;
    }
    if (msg.tooltips) {
      msg.tooltips.forEach((t) => t.dispose());
      delete msg.tooltips;
    }
  });
  // do a reshuffle of messages
  app.pool = [].concat(app.messages);
  const firstMessage = Math.floor(Math.random() * app.pool.length);
  app.next = app.pool.splice(firstMessage, 1).pop();
  app.next.node = createNodeOfMessage(app.next);
  app.prev = { node: null }; // will be refilled in showNextMessage
  app.gameOver = false;
  app.score = 0;
  $("#score").innerText = app.score;
  $("#scoreContainer").style.display = "";
  return showNextMessage();
}

function showNextMessage() {
  delete app.prev.node;
  if (app.prev.tooltips) {
    app.prev.tooltips.forEach((t) => t.dispose());
    delete app.prev.tooltips;
  }
  app.prev = app.next;
  // reveal date of prev message
  const dateContainer = app.prev.node.querySelector(".message-date");
  dateContainer.innerText = dateToText(app.prev.date);
  dateContainer.classList.remove("date-unknown");
  const nextMessage = Math.floor(Math.random() * app.pool.length);
  app.next = app.pool.splice(nextMessage, 1).pop();
  if (app.pool.length < 1) {
    // reshuffle and remove last element to avoid possible duplicating
    app.pool = [].concat(app.messages);
    app.pool.splice(app.pool.indexOf(app.next), 1);
  }
  const element = createNodeOfMessage(app.next);
  app.next.node = element;
  app.nodes.controls.classList.remove("appear-out");
  app.nodes.controls.classList.add("appear-in");
  app.next.node.appendChild(app.nodes.controls);
  app.nodes.buttons.forEach((b) => {
    b.classList.remove("btn-success", "btn-danger");
    b.classList.add("btn-primary");
    b.disabled = false;
  });
}

function userGuess(event) {
  const button = event.currentTarget;
  const guess = parseInt(button.dataset.comparator, 10);
  if (isNaN(guess)) return;

  app.nodes.buttons.forEach((b) => (b.disabled = true));
  // if dates match, give user a freebie:
  const result = Math.sign(app.next.date.getTime() - app.prev.date.getTime()) || guess;
  button.classList.remove("btn-primary");
  const dateDiv = app.next.node.querySelector(".message-date");
  dateDiv.innerText = dateToText(app.next.date);
  dateDiv.classList.remove("date-unknown");
  if (result === guess) {
    button.classList.add("btn-success");
    app.score += 1;
    $("#score").innerText = app.score;
    setTimeout(() => {
      app.prev.node.classList.remove("appear-in");
      app.nodes.controls.classList.remove("appear-in");
      app.prev.node.classList.add("appear-out");
      app.nodes.controls.classList.add("appear-out");
      setTimeout(() => {
        $("#game").removeChild(app.prev.node);
        app.nodes.controls.parentNode.removeChild(app.nodes.controls);
        showNextMessage();
      }, 500);
    }, 2000);
  } else {
    button.classList.add("btn-danger");
    gameOver();
  }
}

function gameOver() {
  app.gameOver = true;

  const weighted = app.stats.avg * app.stats.games + app.score;
  app.stats.games += 1;
  app.stats.last = app.score;
  app.stats.avg = weighted / app.stats.games;
  app.stats.best = Math.max(app.stats.best, app.score);
  saveStats();

  const prependers = ["This streak ends at $ point#.", "Your total is $.", "You got $ point# this time.", "You guessed correctly $ time# in a row.", "Your final score is $."];
  const mockers = [
    `<img class="inline-smol" src="/pics/emotes/OMEGALUL.png"> Why are you so bad at this game?`,
    `<img class="inline-smol" src="/pics/emotes/LULE.png"> Are you even trying?`,
    `<img class="inline-smol" src="/pics/emotes/forsenD.png"> That's... okay, I guess.`,
    `<img class="inline-smol" src="/pics/emotes/Kappa.png"> Wow, you are so lucky!`,
    `<img class="inline-smol" src="/pics/emotes/SeemsGood.png"> Not bad for a rookie!`,
    `<img class="inline-smol" src="/pics/emotes/_smile_.png"> Good job!`,
    `<img class="inline-smol" src="/pics/emotes/forsenE.png"> That was a good run!`,
    `<img class="inline-smol" src="/pics/emotes/EZ.png"> Awesome!`,
    `<img class="inline-smol" src="/pics/emotes/PagMan.png"> God gamer!`,
    `<img class="inline-smol" src="/pics/emotes/forsenOG.png"> God gamer!`,
  ];

  let endText = prependers[Math.floor(Math.random() * prependers.length)];
  endText = endText.replace("$", `<span class="scoreCounter text-success">${app.score}</span>`);
  const multiEnding = app.score % 10 === 1 && app.score % 100 !== 11 ? "" : "s";
  endText = endText.replace("#", multiEnding);
  endText += "<br>";

  let endLevel = Math.ceil(app.score / 2);
  if (endLevel >= mockers.length) endLevel = mockers.length - 1;
  endText += mockers[endLevel];

  //$("#scoreContainer").style.display = "none";
  $("#gameOverFlavor").innerHTML = endText;
  $("#gameOverArea").style.display = "";
  $("#gameOverArea").scrollIntoView();
}

/* application starter */
window.onload = function () {
  // bring modal elements to life
  Object.keys(modals).forEach((kind) => {
    try {
      const node = $(modals[kind]);
      modals[kind] = new bootstrap.Modal(node);
    } catch (e) {
      console.error(`Modal [${kind}] failed to initialize`, e);
    }
  });

  // game starts when we get the list of messages
  fetch(app.src)
    .then((r) => r.text()) // message list is a simple text file
    .then((messageList) => {
      // parse list of messages
      const lines = messageList.trim().split(/\r?\n/);
      const rgxParser = /^\[([\d\-]+ [\d:]+)\] #(\w+) (\w+): (.+)$/i;
      let skips = 0;
      lines.forEach((line) => {
        try {
          const rgx = line.trim().match(rgxParser);
          const result = {
            date: rgx[1],
            channel: rgx[2],
            author: rgx[3],
            text: rgx[4],
          };
          // date needs transformation
          const dateParts = result.date.split(" ");
          const dmy = dateParts[0].split("-").map((n) => parseInt(n, 10));
          const hms = dateParts[1].split(":").map((n) => parseInt(n, 10));
          result.date = new Date(dmy[0], dmy[1] - 1, dmy[2], hms[0], hms[1], hms[2]);
          if (isNaN(result.date.getTime())) throw new Error("Invalid date");
          app.messages.push(result);
        } catch (_e) {
          skips += 1;
        }
      });
      if (skips > 0) console.info(`Parser skipped ${skips} messages.`);

      // user notification control
      loadStats();
      if (app.stats.lastvisit === null) {
        modals.welcome.show();
        saveStats();
      }

      // activate gameplay buttons
      app.nodes.buttons.forEach((b) => {
        b.addEventListener("click", userGuess);
      });

      // end loading: switch to main section
      resetGame();
      $("#loader").style.display = "none";
      $("#game").style.display = "";
    })
    .catch((e) => {
      console.error("Src parsing error", e);
      // build an error message, with a fancy auto email link
      showError(`An error occured while we were trying to load the list of messages.<br>Sorry for the inconvenience. Please try again later.<br><br><em>ERROR: ${sanitize(e.message)}</em>`);
      // flavor:
      $("img.loading-placeholder").src = "/pics/forsenle/forsenpossessed.gif";
      $("div.loading-placeholder").innerText = "👀 ...nurse? NURSE???";
    });
};

// generic button listeners
$("#aboutButton").addEventListener("click", () => {
  modals.welcome.show();
});

$("#doReset").addEventListener("click", resetGame);

$("#doShare").addEventListener("click", (event) => {
  const button = event.currentTarget;
  const buttonHTML = button.innerHTML;
  const buttonSize = button.clientWidth;
  button.disabled = true;
  // build text
  let str = "🧔⌨️ Chattersen \n";
  if (app.stats.games > 0) {
    str += `🗿 My last run: ${app.stats.last} \n`;
    str += `🧮 In ${app.stats.games} games: \n`;
    str += `· Best: ${app.stats.best} Avg: ${app.stats.avg.toFixed(2)} \n`;
  }
  str += window.location.origin + window.location.pathname;
  // try various sharing strategies
  new Promise((resolve, reject) => {
    try {
      // mobile frogs have their native way of sharing things
      let nativeMobileShare = false;
      if (isMobileClient()) {
        let shareable = { text: str };
        if (navigator.share && navigator.canShare && navigator.canShare(shareable)) {
          nativeMobileShare = true;
          navigator
            .share(shareable)
            .catch((e) => {
              // AbortError is not malicious
              if (e instanceof Error)
                switch (e.name) {
                  case "AbortError":
                    return; // user aborted sharing
                  default:
                    throw e; // other errors should be dealt with!
                }
            })
            .then(() => resolve("Shared!"))
            .catch((e) => reject(e));
        }
      }
      if (!nativeMobileShare) {
        // desktop friends - let's hope they use modern browsers
        navigator.clipboard
          .writeText(str)
          .then(() => resolve("Copied!"))
          .catch((e) => reject(e));
      }
    } catch (e) {
      // what is this retarded browser then???
      console.error(e);
      reject(e);
    }
  })
    .then((resultMessage) => {
      // sharing success
      button.innerText = "✔️ " + resultMessage;
      button.style.width = buttonSize + "px"; // prevents width jumping
      button.classList = "btn btn-success";
    })
    .catch((e) => {
      console.warn("Share to clipboard failed", e);
      button.innerText = "❌ Sharing failed!";
      button.classList = "btn btn-warning";
      // fallback: use native window prompt
      window.prompt("Copy this text and send it to your friends:", str);
    })
    .then(() => {
      setTimeout(() => {
        // restore original text and reenable button
        button.innerHTML = buttonHTML;
        button.style.width = "";
        button.disabled = false;
        button.classList = "btn btn-info";
      }, 2323);
    });
});
