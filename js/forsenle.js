/* globals startConfetti,stopConfetti,$ */

// auxiliary wrappers:
//function $ (e) { return document.querySelector(e); }
// now uses jquery!

function showError(htmlString) {
  $("#modalPanicBody").html(htmlString);
  app.modals.error.show();
}

// main entry point, global object:
const app = {
  consts: {
    hardModeAttempts: 6, // how many tries until lose in hard mode
    disparity: {
      // numeric ranges for defining appropriate colors
      soft: {
        // uses "yellow" color - when result is almost correct
        Date: 2,
        Month: 1,
        FullYear: 1,
      },
      hard: {
        // uses "red" color - when result is kinda far from target
        Date: 7,
        Month: 3,
        FullYear: 2,
      }, // if difference between guess and target is more than .hard, use "black" color
    },
    emojis: {
      // for app.aux.share()
      attempt1: "🟢",
      attempt0: "🔴",
      correct: "🟩",
      close: "🟨",
      far: "🟥",
      miss: "⬛",
      prestige: "⭐",
    },
    midnightTail: "T00:00:00",
    daysInMonth: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
    datePickerTypeHints: {
      // smol advice for user on selected inputtype
      //legacy: "Determine preferred input automatically", // based on app.settings.calendar
      datetimepicker: "Pick date from a calendar view. Simple, effective, elegant.",
      flipbox: "Scroll or swipe to select day, month, and year. Includes color coded hints!",
      date: "Uses native calendar interface to pick date. Visual style may vary - depending on your browser.",
      text: "Input date as text - manually, with no calendar interface.",
    },
    datePickerFormats: {
      // remap for datetimepicker plugin
      "MM-DD-YYYY": "m-d-Y",
      "DD-MM-YYYY": "d-m-Y",
      "YYYY-MM-DD": "Y-m-d",
    },
    dateElements: {
      // remap for guess check (need strict YYYY-MM-DD)
      "YYYY-MM-DD": ["FullYear", "Month", "Date"],
      "MM-DD-YYYY": ["Month", "Date", "FullYear"],
      "DD-MM-YYYY": ["Date", "Month", "FullYear"],
    },
    nonPrestigeGames: [
      // list of games which will not trigger prestige round
      "Games & Demos",
      "Just Chatting",
      "Special Events",
      "Talk Shows & Podcasts",
    ],
    extraPrestigeSuggestions: [
      // list of games to add into autosuggestion list
      "Advance Wars",
      "Adventure",
      "Age of Empires",
      "Age of Empires II",
      "Alone in the Dark",
      "Angry Birds",
      "Animal Crossing",
      "Another World",
      "Archon: The Light and the Dark",
      "Arkanoid",
      "Assassin's Creed II",
      "Asteroids",
      "Baldur's Gate",
      "Baldur's Gate II: Shadows of Amn",
      "Batman: Arkham Asylum",
      "Batman: Arkham City",
      "Battlefield 1942",
      "Battlezone",
      "Bayonetta",
      "Beyond Good & Evil",
      "BioShock",
      "BioShock Infinite",
      "Borderlands",
      "Braid",
      "Bubble Bobble",
      "Burnout 3: Takedown",
      "Burnout Paradise",
      "Call of Duty 2",
      "Call of Duty 4: Modern Warfare",
      "Castlevania: Symphony of the Night",
      "Centipede",
      "Chrono Trigger",
      "Civilization",
      "Civilization II",
      "Civilization IV",
      "Civilization V",
      "Combat",
      "Command & Conquer",
      "Command & Conquer: Red Alert",
      "Company of Heroes",
      "Contra",
      "Contra III: The Alien Wars",
      "Counter-Strike",
      "Crash Bandicoot: Warped",
      "Dance Dance Revolution",
      "Day of the Tentacle",
      "Daytona USA",
      "Defender",
      "Destiny",
      "Deus Ex",
      "Devil May Cry",
      "Devil May Cry 3: Dante's Awakening",
      "Diablo",
      "Diablo II",
      "Donkey Kong",
      "Donkey Kong Country",
      "Doom",
      "Doom II",
      "Double Dragon",
      "Dragon Age: Origins",
      "Dragon Quest VIII",
      "Duke Nukem 3D",
      "Dune II",
      "Dungeon Master",
      "EarthBound",
      "Elite",
      "Eternal Darkness: Sanity's Requiem",
      "EverQuest",
      "Fable II",
      "Fallout",
      "Fallout 2",
      "Fallout 3",
      "Far Cry 3",
      "Final Fantasy IV",
      "Final Fantasy Tactics",
      "Final Fantasy VI",
      "Final Fantasy VII",
      "Final Fantasy X",
      "Final Fight",
      "Fire Emblem: Awakening",
      "Flashback",
      "Frogger",
      "F-Zero GX",
      "Galaga",
      "Gauntlet",
      "Gears of War",
      "Gears of War 2",
      "Ghosts 'n Goblins",
      "God of War",
      "God of War",
      "God of War II",
      "God of War III",
      "GoldenEye 007",
      "Gran Turismo",
      "Gran Turismo 3: A-Spec",
      "Gran Turismo 4",
      "Grand Theft Auto: Vice City",
      "Grim Fandango",
      "Guitar Hero",
      "Gunstar Heroes",
      "Half-Life",
      "Halo 2",
      "Halo 3",
      "Halo: Combat Evolved",
      "Heavy Rain",
      "Hitman: Blood Money",
      "Homeworld",
      "Hotline Miami",
      "Ico",
      "Ikaruga",
      "Indiana Jones and the Fate of Atlantis",
      "Inside",
      "Jet Set Radio",
      "Journey",
      "Joust",
      "Katamari Damacy",
      "Kingdom Hearts",
      "League of Legends",
      "Left 4 Dead",
      "Left 4 Dead 2",
      "Lemmings",
      "LittleBigPlanet",
      "Lode Runner",
      "M.U.L.E.",
      "Marble Madness",
      "Mario Kart 64",
      "Marvel vs. Capcom 2: New Age of Heroes",
      "Mass Effect",
      "Mass Effect 2",
      "Max Payne",
      "Max Payne 2: The Fall of Max Payne",
      "MechWarrior 2: 31st Century Combat",
      "Mega Man 2",
      "Mega Man X",
      "Metal Gear Solid",
      "Metal Gear Solid 2: Sons of Liberty",
      "Metal Gear Solid 3: Snake Eater",
      "Metroid Prime",
      "Micro Machines",
      "Mike Tyson's Punch-Out!!",
      "Missile Command",
      "Monkey Island 2: LeChuck's Revenge",
      "Mortal Kombat",
      "Mortal Kombat II",
      "Ms. Pac-Man",
      "Myst",
      "NBA Jam",
      "Ninja Gaiden",
      "Ōkami",
      "Out Run",
      "Overwatch",
      "Pac-Man",
      "Panzer Dragoon Saga",
      "PaRappa the Rapper",
      "Persona 4",
      "Phantasy Star IV",
      "Phoenix Wright: Ace Attorney",
      "Pitfall!",
      "Planescape: Torment",
      "Plants vs. Zombies",
      "Pokémon Gold and Silver",
      "Pokémon Red and Blue",
      "Pong",
      "Populous",
      "Prince of Persia",
      "Prince of Persia: The Sands of Time",
      "Psychonauts",
      "Quake",
      "Quake II",
      "Quake III: Arena",
      "Red Dead Redemption",
      "Resident Evil",
      "Resident Evil 2",
      "Rez",
      "Ridge Racer",
      "Robotron: 2084",
      "Rock Band",
      "Rock Band 2",
      "Rock Band 3",
      "Rome: Total War",
      "R-Type",
      "Sam & Max Hit the Road",
      "Samurai Shodown",
      "Secret of Mana",
      "Sega Rally Championship",
      "Sensible Soccer",
      "Sensible World of Soccer",
      "Shadow of the Colossus",
      "Shenmue",
      "Shovel Knight",
      "Sid Meier's Pirates!",
      "Silent Hill",
      "Silent Hill 2",
      "SimCity",
      "SimCity 2000",
      "Sonic the Hedgehog",
      "Sonic the Hedgehog 2",
      "Soulcalibur",
      "Soulcalibur II",
      "Space Invaders",
      "Speedball 2: Brutal Deluxe",
      "Spelunky",
      "Star Control II",
      "Star Fox",
      "Star Fox 64",
      "Star Wars Jedi Knight: Dark Forces II",
      "Star Wars: Knights of the Old Republic",
      "Star Wars: TIE Fighter",
      "StarCraft",
      "StarCraft II: Wings of Liberty",
      "Stardew Valley",
      "Street Fighter II",
      "Street Fighter IV",
      "Streets of Rage 2",
      "Suikoden II",
      "Super Castlevania IV",
      "Super Mario 64",
      "Super Mario Bros.",
      "Super Mario Bros. 3",
      "Super Mario Galaxy",
      "Super Mario Galaxy 2",
      "Super Mario Kart",
      "Super Mario World",
      "Super Metroid",
      "Super Smash Bros. Melee",
      "Syndicate",
      "System Shock 2",
      "Team Fortress 2",
      "Tekken 3",
      "Tempest",
      "Tempest 2000",
      "Tetris",
      "The Chronicles of Riddick: Escape from Butcher Bay",
      "The Elder Scrolls III: Morrowind",
      "The Jackbox Party Pack",
      "The Jackbox Party Pack 2",
      "The Jackbox Party Pack 4",
      "The Jackbox Party Pack 9",
      "The Legend of Zelda",
      "The Legend of Zelda: A Link to the Past",
      "The Legend of Zelda: Majora's Mask",
      "The Legend of Zelda: Ocarina of Time",
      "The Legend of Zelda: The Wind Waker",
      "The Legend of Zelda: Twilight Princess",
      "The Oregon Trail",
      "The Secret of Monkey Island",
      "The Sims",
      "The Sims 2",
      "The Witcher 3: Wild Hunt",
      "The World Ends with You",
      "Theme Park",
      "Thief II: The Metal Age",
      "Thief: The Dark Project",
      "Tom Clancy's Splinter Cell",
      "Tom Clancy's Splinter Cell: Chaos Theory",
      "Tomb Raider",
      "Tony Hawk's Pro Skater 2",
      "Tony Hawk's Pro Skater 3",
      "Total Annihilation",
      "Ultima IV: Quest of the Avatar",
      "Ultima Online",
      "Ultima VII: The Black Gate",
      "Uncharted 2: Among Thieves",
      "Uncharted 4: A Thief's End",
      "Unreal Tournament",
      "Valkyria Chronicles",
      "Virtua Fighter 2",
      "Virtua Racing",
      "Warcraft II",
      "WarioWare, Inc.: Mega Microgames!",
      "Wave Race 64",
      "Wii Sports",
      "Wing Commander",
      "Wipeout",
      "Wipeout 2097",
      "Wizardry: Proving Grounds of the Mad Overlord",
      "Wolfenstein 3D",
      "World of Warcraft",
      "Worms",
      "XCOM: Enemy Unknown",
      "X-COM: UFO Defense",
      "Xenoblade Chronicles",
      "Yoshi's Island",
      "Zork",
    ],
    mediasrc: "/data/forsenle-sources.json", // json list of all frames
    startDate: new Date("2022-05-02T00:00:00"), // date of issue #0 - countdown point
  },
  datePickerOptions: {
    // date picker settings
    //theme: (app.settings.darkMode ? "dark" : "default"),
    theme: "default", // dark one is ugly
    // static params
    yearStart: 2010,
    yearEnd: new Date().getFullYear(), // soft limit years list
    dayOfWeekStart: 1, // first day = monday
    mask: true, // adds autovalidator for manual input
    defaultSelect: false, // remove reference to today's date
    closeOnDateSelect: false, // keep picking until submit (seems to be not working?)
    validateOnBlur: false, // do not insert current date on incorrect values
    todayButton: false, // disables "today's date" button
    timepicker: false, // removes hh:mm:ss tail
    // callbacks
    onSelectDate: () => {
      app.aux.renderAdvice(app.html.controls.inputDate, null);
    },
    // dynamic params
    minDate: undefined, // limit based on prev guesses
    maxDate: undefined, // expecting a Date object
    startDate: undefined, // will remember last input (ux improvement)
    format: "Y-m-d", // date format
  },
  game: {
    // saves as localStorage::forsenle-state
    victory: 0, // 1 = win, -1 = loss, 0 = game in progress
    tries: [], // guess list
    issue: 0, // compares to app.currentIssue to detect if new day or not
  },
  prestige: {
    // saves as localStorage::forsenle-prestige
    started: false, // pressed "accept" when invited
    guesses: [], // whatever user typed in
    issue: 0, // must match with app.game.issue
    finished: false, // either by skipping, giving up, or guessing
  },
  settings: {
    // saves as localStorage::forsenle-settings
    dateOrder: (() => {
      // attempt to autodetect best format
      try {
        const dateParts = new Intl.DateTimeFormat(navigator.language).formatToParts();
        switch (dateParts[0].type) {
          case "month":
            return "MM-DD-YYYY";
          case "day":
            return "DD-MM-YYYY";
          case "year":
            return "YYYY-MM-DD";
          default:
            throw new Error("Cannot define first element of date.", dateParts[0]);
        }
      } catch (e) {
        console.warn("Failed to detect locale date format", e);
        return "DD-MM-YYYY";
      }
    })(),
    calendar: true, // legacy: true = use custom jquery calendar, false = native input-date
    inputTypeOverrideHappened: false, // one-time thing: transfer all "datetimepicker" users to "flipbox"
    inputType: "legacy", // determines user's way of entering date, check app.consts.datePickerTypeHints for list of types
    hardMode: false, // hard mode rules
    zoomImageOnClick: true, // enables expanding frame on click
    highContrastMode: false, // distinctive colors (yellow-blue patterns)
    darkMode: (() => {
      // bright background and stuff
      try {
        // attempt autodetect preferred color mode (works in new browsers)
        return window.matchMedia("(prefers-color-scheme: dark)").matches;
      } catch (e) {
        // feature is probably not supported, default to light mode
        return false;
      }
    })(),
  },
  announcements: {
    // various one-time tooltips about new features
    hardModeOffer: 0, // offers players with good avg stat to turn on hard mode
    highContrastModeAdded: 0, // added new option in settings
  },
  stats: {
    // saves as localStorage::forsenle-stats
    games: 0, // total game count
    wins: 0, // total win count
    streak: 0, // consecutive win/loss count
    min: -1, // min guess-to-win count
    max: -1, // max guess-to-win count
    avg: 0, // avg guess-to-win count
    pGames: 0, // prestige rounds count
    pWins: 0, // prestige wins count
    pAvg: 0, // prestige avg guess-to-win count
    pMin: 0, // prestige min guess-to-win count
    pMax: 0, // prestige max guess-to-win count
    lastissue: 0, // last issue with a definitive result (win/loss)
    lastvisit: null, // date object - when user last visited this page
  },
  gameGuessList: new Set(), // auxiliary container for user guesses
  currentIssue: 0, // issue #0 corresponds to app.consts.startDate
  time: new Date(), // timestamp of page load (for issue # calc)
  src: {}, // today's stream frame source info
  target: new Date(), // correct answer for today's riddle
  min: null, // Date - helper for user input
  max: null, // min and max restrict user's calendar input, creating date bounds
  emojiField: [], // helper array - contains emojified user guesses for share()
  modals: {}, // bootstrap modal references storage
  tooltips: [], // bootstrap tooltip references
  popovers: [], // bootstrap popover references
  html: {
    // HTMLElement shorthand references
    countdown: $("span#st_countdown"),
    loader: {
      // elements related to "loader" (shows while game is loading)
      img: $("div#loader img.loading-placeholder"),
      text: $("div#loader div.loading-placeholder"),
      container: $("div#loader"),
    },
    prestige: {
      // elements related to prestige round
      counters: $(".prestige-counter"),
      controls: $("#prestigeControls"),
      giveUpBtn: $("button#prestigeGiveUp"),
      inputField: $("#prestigeInputText"),
      suggestions: $("#prestigeGameOptions"),
      guesses: $("#prestigeGuessList"),
      submitBtn: $("button#prestigeSubmit"),
      container: $("div#prestigeSection"),
      invite: $("div#prestigeInviteCard"),
      inviteAcceptBtn: $("#prestigeAcceptBtn"),
      inviteDeclineBtn: $("#prestigeDeclineBtn"),
      frameCounter: $("#framePrestige"),
    },
    game: {
      // elements related to game
      frame: $("img#picframe"),
      controlArea: $("div#userControlArea"),
      guesses: $("div#mainGameGuessList"),
      container: $("div#game"),
    },
    gameinfo: {
      // some info to show after game over
      name: $("div#frameGame"),
      link: $("a#frameVod"),
      container: $("div#frameInfoCard"),
    },
    hardMode: {
      // labels and counters for hard mode
      hmAttemptCounter: $("#hardModeCounter"),
      container: $("div#mainGameHardModeInfo"),
    },
    controls: {
      // game inputs and stuff
      inputIcon: $("#iCalIcon"),
      inputDate: $("input#iAttempt"),
      inputFlip: $("#forsleFlipper"),
      submitBtn: $("button#iSubmit"),
      container: $("div#mainGameGuessInput"),
    },
    buttons: {
      // top panel buttons
      share: $("#getResultsButton"),
      about: $("#aboutButton"),
      stats: $("#statsButton"),
      settings: $("#settingsButton"),
    },
    settings: {
      // "options" menu buttons and checkboxes
      datefmt: $("select#opt_DateOrderSelect"),
      calendar: $("#opt_CalendarInput"),
      calAdvice: $("#calendarAdvice"),
      hardMode: $("input#opt_HardMode"),
      highContrastMode: $("input#opt_HighContrastMode"),
      zoomImageOnClick: $("input#opt_ZoomImageOnClick"),
      darkMode: $("input#opt_DarkMode"),
    },
    stats: {
      // stats screen microelements
      congrats: $("#st_statcongrats"),
      shame: $("#st_statshame"),
      table: $("#tableWithStats"),
      tries: $("#st_tries"),
      games: $("#st_games"),
      winrate: $("#st_winrate"),
      streak: $("#st_streak"),
      min: $("#st_min"),
      max: $("#st_max"),
      avgtimes: $("#st_avgtimes"),
      title: $("#modalVictoryTitle"),
      // prestige stats
      prestige: {
        games: $("#st_p_games"),
        wins: $("#st_p_wins"),
        min: $("#st_p_min"),
        max: $("#st_p_max"),
        avgtimes: $("#st_p_avgtimes"),
        title: $("#st_stprestige"),
      },
    },
    modals: {
      // bootstrap modals
      error: $("#modalPanic"),
      welcome: $("#modalWelcome"),
      stats: $("#modalVictory"),
      settings: $("#modalSettings"),
    },
    dynamic: {}, // for dynamic html
  },
  aux: {
    // action: do nothing
    nullFunction: () => {},

    // action: check if year is leap year
    isLeapYear: (year) => {
      return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    },

    // action: spray some confetti
    sprinkleSomeLove: (time = 1000) => {
      startConfetti();
      setTimeout(stopConfetti, time);
    },

    // action: hide all modal windows
    hideAllModals: () => {
      Object.keys(app.modals).forEach((m) => app.modals[m].hide());
    },

    // action: display some tooltips about new features
    renderNotifications: () => {
      // hide notification if user already played a game today:
      if (app.game.victory) return;
      // annouce new option: "high contrast"
      if (!app.announcements.highContrastModeAdded) {
        // remember that user is already aware:
        app.announcements.highContrastModeAdded = new Date();
        app.aux.save();
        // show advice friend in main screen:
        const tipParent = app.html.buttons.settings;
        if (tipParent.attr("data-bs-toggle") === "tooltip") {
          tipParent.tooltip("dispose");
          tipParent.removeAttr("title");
          tipParent.removeAttr("data-bs-original-title");
        }
        tipParent.popover({
          placement: "bottom",
          trigger: "manual",
          content: "🐴 New settings added!",
        });
        tipParent.popover("show");
        // and when he finally opens settings menu:
        const newOption = app.html.settings.highContrastMode.parent();
        newOption.tooltip({
          placement: "left",
          trigger: "manual",
          title: "🐴 Check this out!",
        });
        // and destroy advice friends on click/hover as well
        const destroyAdviceHorse = () => tipParent.popover("hide");
        tipParent.on("mouseover", destroyAdviceHorse);
        tipParent.on("click", () => {
          destroyAdviceHorse();
          newOption.tooltip("show");
        });
        const destroyTooltip = () => newOption.tooltip("dispose");
        newOption.on("mouseover", destroyTooltip);
        newOption.on("click", destroyTooltip);
        return; // to disallow hardModeOffer trigger
      }
      if (!app.announcements.hardModeOffer && app.stats.games > 5 && app.stats.avg < 7) {
        // remember that user is already aware:
        app.announcements.hardModeOffer = new Date();
        app.aux.save();
        // show advice friend in main screen:
        const tipParent = app.html.buttons.settings;
        if (tipParent.attr("data-bs-toggle") === "tooltip") {
          tipParent.tooltip("dispose");
          tipParent.removeAttr("title");
          tipParent.removeAttr("data-bs-original-title");
        }
        tipParent.popover({
          placement: "bottom",
          trigger: "manual",
          html: true,
          content: `<img alt="nime" class="inline-smol" src="/pics/forsenle/nime.png" width="18">&nbsp;&nbsp;Game too easy?<br>Try <b>♨️ Hard mode</b>! `,
        });
        tipParent.popover("show");
        // and destroy advice friends on click/hover as well
        const destroyAdvice = () => tipParent.popover("hide");
        tipParent.on("mouseover", destroyAdvice);
        tipParent.on("click", destroyAdvice);
      }
    },

    // action: show tooltip about bad input
    renderAdvice: (target, advice = "") => {
      if (advice) {
        // remove existing advice friend
        if (app.html.dynamic.inputAdviceFriend) {
          app.html.dynamic.inputAdviceFriend.dispose();
        }
        app.html.controls.container.addClass("bad-input");
        // build and display a popover
        const tipParent = target.is(":visible") ? target : target.parent();
        tipParent.attr("data-bs-content", advice);
        app.html.dynamic.inputAdviceFriend = new bootstrap.Popover(tipParent, {
          template:
            `<div class="popover custom-popover" role="tooltip">` +
            `<div class="popover-arrow"></div><h3 class="popover-header bg-danger"></h3>` +
            `<div class="popover-body bg-danger"></div></div>`,
          html: true,
          placement: "bottom",
          trigger: "manual",
        });
        app.html.dynamic.inputAdviceFriend.show();
      } else {
        // falsy value = destroy advice friend
        target.attr("data-bs-content", "");
        target.parent().attr("data-bs-content", "");
        app.html.controls.container.removeClass("bad-input");
        if (app.html.dynamic.inputAdviceFriend) {
          app.html.dynamic.inputAdviceFriend.dispose();
          delete app.html.dynamic.inputAdviceFriend;
        }
      }
    },

    // action: get clean timezone-independent midnighty date object
    getTZMidnightDateString: (date) => {
      if (!(date instanceof Date)) date = new Date(date);
      return date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate()).padStart(2, "0") + app.consts.midnightTail;
    },

    // action: gets date from user input and transforms it to Date
    getUniformedDate: (inputString) => {
      // can throw errors!
      // these inputs already gives us normal date
      if (["date", "flipbox"].includes(app.settings.inputType)) {
        return new Date(inputString + app.consts.midnightTail);
      }
      let input = inputString.split("-");
      if (input.length !== 3) throw new TypeError("Weird date format");
      const remapped = {};
      app.consts.dateElements[app.settings.dateOrder].forEach((elem, i) => {
        remapped[elem] = parseInt(input[i], 10);
        if (isNaN(remapped[elem])) {
          throw new TypeError("Bad date element: " + input[i]);
        }
      });
      // simple validations:
      const isLeapYear = app.aux.isLeapYear(remapped.FullYear);
      const daysInMonth = app.consts.daysInMonth;
      daysInMonth[1] = isLeapYear ? 29 : 28;
      switch (true) {
        case remapped.FullYear < 1:
          throw new RangeError("Invalid year specified: " + remapped.FullYear);
        case remapped.Month < 1 || remapped.Month > 12:
          throw new RangeError("Invalid month specified: " + remapped.Month);
        case remapped.Date < 1 || remapped.Date > daysInMonth[remapped.Month - 1]:
          throw new RangeError("Invalid day specified: " + remapped.Date);
      }
      ["Month", "Date"].forEach((elem) => {
        remapped[elem] = String(remapped[elem]).padStart(2, "0");
      });
      return new Date(remapped.FullYear + "-" + remapped.Month + "-" + remapped.Date + app.consts.midnightTail);
    },

    // action: update custom datepicker with new settings
    updateDatePicker: () => {
      if (app.settings.inputType === "datetimepicker") {
        app.html.controls.inputDate.datetimepicker(app.datePickerOptions);
      }
    },

    // action: detect if user is moble
    isMobileClient: () => {
      // yoinked from nytimes wordle
      let userAgent = navigator.userAgent || navigator.vendor || window.opera;
      return (
        /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
          userAgent
        ) ||
        // eslint-disable-next-line no-useless-escape
        /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
          userAgent.substr(0, 4)
        )
      );
    },

    // action: toggle bright/dark style
    toggleZoomImageOnClick: (syncInput = false) => {
      app.html.game.frame.parent().removeClass("frame-parent-popout");
      app.html.game.controlArea.css("visibility", "visible");
      app.html.game.frame.parent().toggleClass("frame-expandable", app.settings.zoomImageOnClick);
      if (syncInput) {
        app.html.settings.zoomImageOnClick.prop("checked", app.settings.zoomImageOnClick);
      }
    },

    // action: toggle bright/dark style
    toggleDarkMode: (syncInput = false) => {
      document.documentElement.setAttribute("data-bs-theme", app.settings.darkMode ? "dark" : "light");
      if (syncInput) {
        app.html.settings.darkMode.prop("checked", app.settings.darkMode);
      }
    },

    // action: toggle contrast colors
    toggleHighContrastMode: (syncInput = false) => {
      $("body").toggleClass("high-contrast-colors", app.settings.highContrastMode);
      if (syncInput) {
        app.html.settings.highContrastMode.prop("checked", app.settings.highContrastMode);
      }
    },

    // action: change user input type (date/text)
    toggleCalendarInput: (syncInput = false) => {
      if (app.settings.inputType === "legacy") {
        syncInput = true; // to force refresh dropdown
        app.settings.inputType = !app.settings.calendar ? "date" : "flipbox";
      }
      switch (app.settings.inputType) {
        case "flipbox":
          // show flipbox, hide native input
          app.html.controls.inputIcon.hide();
          app.html.controls.inputDate.hide();
          app.html.controls.inputFlip.forsleFlipper(app, "init");
          app.html.controls.inputFlip.show();
          app.html.controls.submitBtn.parent().removeClass("input-group-append-fix");
          app.html.controls.container.addClass("user-guess-input-flipbox");
          break;
        case "datetimepicker":
          // hide flipbox, show native input
          app.html.controls.inputFlip.hide();
          app.html.controls.inputIcon.show();
          app.html.controls.inputDate.show();
          app.html.controls.submitBtn.parent().addClass("input-group-append-fix");
          app.html.controls.container.removeClass("user-guess-input-flipbox");
          // enable custom datebox
          app.html.controls.inputDate.prop("type", "text");
          // mobile friends keyboard keeps popping off, disable it:
          app.html.controls.inputDate.attr("inputmode", "none");
          // update or create date picker
          app.datePickerOptions.format = app.consts.datePickerFormats[app.settings.dateOrder];
          app.datePickerOptions.startDate = new Date(app.game.tries[app.game.tries.length - 1] || app.time);
          app.datePickerOptions.minDate = app.min || undefined;
          app.datePickerOptions.maxDate = app.max || undefined;
          app.aux.updateDatePicker();
          break;
        case "date":
        case "text":
        default:
          // hide flipbox, show native input
          app.html.controls.inputFlip.hide();
          app.html.controls.inputIcon.show();
          app.html.controls.inputDate.show();
          app.html.controls.submitBtn.parent().addClass("input-group-append-fix");
          app.html.controls.container.removeClass("user-guess-input-flipbox");
          // fallback to native type=date input
          app.html.controls.inputDate.datetimepicker("destroy");
          app.html.controls.inputDate.prop("type", app.settings.inputType);
          app.html.controls.inputDate.attr("inputmode", "numeric");
          if (app.min) app.html.controls.inputDate.prop("min", app.min.toISOString().split("T")[0]);
          if (app.max) app.html.controls.inputDate.prop("max", app.max.toISOString().split("T")[0]);
          break;
      }
      // clear field to mitigate any confusion
      app.html.controls.inputDate.val("");
      if (syncInput) {
        app.html.settings.calendar.val(app.settings.inputType);
      }
    },

    // action: set date format (elements order) according to user prefs
    applyCustomDateOrder: (syncInput = false) => {
      // update hint for user
      app.html.controls.inputDate.prop("placeholder", app.settings.dateOrder);
      // update custom date picker
      if (app.settings.inputType === "datetimepicker") {
        // update datepicker format string
        app.datePickerOptions.format = app.consts.datePickerFormats[app.settings.dateOrder];
        app.aux.updateDatePicker();
        // clear value
        app.html.controls.inputDate.val("");
      }
      document.body.dataset.dateOrder = app.settings.dateOrder;
      if (syncInput) {
        app.html.settings.datefmt.val(app.settings.dateOrder);
      }
    },

    // action: block hard mode setting checkbox if needed
    applyHardModeBlock: (syncInput = false) => {
      app.html.hardMode.container[app.settings.hardMode ? "show" : "hide"]();
      if (app.game.tries.length > 0) {
        app.html.settings.hardMode.prop("disabled", true);
        if (!app.html.dynamic.tooltipOfHardMode) {
          const tooltipNode = app.html.settings.hardMode.parent();
          tooltipNode.prop("data-bs-title", "This can only be changed before the game starts!");
          tooltipNode.attr("data-bs-toggle", "tooltip");
          tooltipNode.attr("data-bs-placement", "left");
          const t = new bootstrap.Tooltip(tooltipNode);
          app.html.dynamic.tooltipOfHardMode = t;
          app.tooltips.push(t);
        }
      }
      if (syncInput) {
        app.html.settings.hardMode.prop("checked", app.settings.hardMode);
      }
    },

    // action: clean up before new day's attempt
    clearField: () => {
      app.game.tries.length = 0;
      app.game.victory = 0;
      app.html.controls.inputFlip.forsleFlipper(app, "setDate", app.time);
      if (app.settings.inputType === "datetimepicker") {
        app.datePickerOptions.startDate = false;
        app.aux.updateDatePicker();
      }
      // re-enable hard mode option:
      app.html.settings.hardMode.prop("disabled", false);
      // clean up prestige
      app.prestige.started = false;
      app.prestige.finished = false;
      app.prestige.guesses.length = 0;
      app.prestige.issue = app.currentIssue;
    },

    // action: show hard mode attempt counter
    fillHMCounter: () => {
      let tries = "";
      for (let i = app.consts.hardModeAttempts; i > 0; i--) {
        tries += app.consts.emojis[i > app.game.tries.length ? "attempt1" : "attempt0"];
      }
      app.html.hardMode.hmAttemptCounter.text(tries);
    },

    // action: fill info about game frame (name and link)
    fillSrcInfo: () => {
      // show game name
      if (app.src.game) {
        app.html.gameinfo.name.text("🎮 " + app.src.game);
      } else {
        app.html.gameinfo.name.text("");
      }
      // build link
      if (app.src.file && app.src.file.indexOf("(") < 0) {
        // non-youtube pics use "(vod)" tag
        const linksrc = String(app.src.file || "").split(".")[0]; // this can be used to mark pictures from the same vod!
        if (!linksrc) {
          app.html.gameinfo.link.hide();
        } else {
          app.html.gameinfo.link.prop("href", "https://youtu.be/" + linksrc);
          app.html.gameinfo.link.show();
        }
      } else {
        app.html.gameinfo.link.hide();
      }
    },

    // action: get user's prestige guess, parse and draw html, and return true if guess is correct
    drawAndCheckPrestigeGuess: (userGuess) => {
      if (typeof userGuess !== "string") throw new TypeError("Incorrect type: " + userGuess);
      const win = userGuess === app.src.game;
      // parent container
      const container = document.createElement("div");
      container.classList.add("user-prestige-guess", "user-guess-attempt");
      container.innerText = (win ? "✅" : "✖️") + " " + userGuess;
      app.html.prestige.guesses.append(container);
      app.html.prestige.counters.text(app.prestige.guesses.length);
      // returns true if user won
      return win;
    },

    // action: get user's guess, parse and draw html, and return true if guess is correct
    drawAndCheckUserGuess: (userDate, revelation = false) => {
      if (!(userDate instanceof Date)) throw new TypeError("Incorrect type: " + userDate);
      let win = true;
      // parent container
      const container = document.createElement("div");
      container.classList.add("user-guess-attempt");
      app.html.game.guesses.append(container);
      // add date elements
      const emojipack = {};
      const flipdate = {};
      ["Date", "Month", "FullYear"].forEach((elem) => {
        const node = document.createElement("div");
        node.classList.add("ug-element");
        node.classList.add("ug-" + elem.toLowerCase());
        let value = userDate["get" + elem]();
        flipdate[elem] = value; // remember this for flipbox color codes
        if (elem === "Month") value += 1; // january = 0
        node.innerText = String(value).padStart(2, "0");
        container.appendChild(node);
        // calculate difference
        let diff = Math.abs(userDate["get" + elem]() - app.target["get" + elem]());
        let className = "";
        if (revelation) {
          // hard mode: show the correct guess
          className = "ug-scoots";
        } else if (diff === 0) {
          className = "ug-correct";
          emojipack[elem] = app.consts.emojis.correct;
        } else {
          // any of date elements is not equal
          win = false;
          if (diff <= app.consts.disparity.soft[elem]) {
            className = "ug-close";
            emojipack[elem] = app.consts.emojis.close;
          } else if (diff <= app.consts.disparity.hard[elem]) {
            className = "ug-far";
            emojipack[elem] = app.consts.emojis.far;
          } else {
            className = "ug-incorrect";
            emojipack[elem] = app.consts.emojis.miss;
          }
        }
        node.classList.add(className);
        flipdate[elem] = [flipdate[elem], className];
      });
      // send color codes to flipbox
      app.html.controls.inputFlip.forsleFlipper(app, "colors", flipdate);
      // add direction element
      const isLower = userDate < app.target;
      const direction = document.createElement("div");
      direction.innerText = app.game.tries.length < 2 ? "😎✌️" : "🥳";
      container.appendChild(direction);
      if (revelation) {
        // hard mode: show the correct date
        direction.innerText = "♨️";
      } else {
        if (!win) {
          direction.innerText = isLower ? "⏩" : "⏪";
          // helper: restrict user input to min and max
          if (isLower && (!app.min || userDate.getTime() >= app.min.getTime())) {
            app.min = new Date(userDate.getFullYear(), userDate.getMonth(), userDate.getDate() + 1);
          }
          if (!isLower && (!app.max || userDate.getTime() <= app.max.getTime())) {
            app.max = new Date(userDate.getFullYear(), userDate.getMonth(), userDate.getDate() - 1);
          }
          // update range restrictions on date pickers:
          switch (app.settings.inputType) {
            case "datetimepicker": // pretty calendar
              app.datePickerOptions.startDate = new Date(userDate);
              app.datePickerOptions.minDate = app.min || undefined;
              app.datePickerOptions.maxDate = app.max || undefined;
              app.aux.updateDatePicker();
              break;
            case "date": // native date input
              if (app.min) app.html.controls.inputDate.prop("min", app.min.toISOString().split("T")[0]);
              if (app.max) app.html.controls.inputDate.prop("max", app.max.toISOString().split("T")[0]);
              break;
          }
        }
        // record for "share"
        emojipack.direction = direction.innerText;
        app.emojiField.push(emojipack);
      }
      direction.classList.add("ug-element", "ug-direction");
      // hard mode: update counter
      app.aux.fillHMCounter();
      // returns true if user won
      return win;
    },

    // action: show game name, then show modal with stats
    finalizeGame: (delay = 2000) => {
      // show game info
      app.aux.fillSrcInfo();
      app.html.gameinfo.container.show();
      // show modal
      app.html.controls.container.hide();
      app.html.hardMode.container.hide();
      // show guess list section, hide prestige
      app.html.game.guesses.show();
      app.html.prestige.container.hide();
      app.html.prestige.invite.hide();
      // end the game
      app.aux.victory(delay + 1000 * (app.game.victory < 0));
    },

    // action: load settings and state from localStorage
    load: () => {
      // load field settings
      try {
        let sets = localStorage.getItem("forsenle-settings");
        sets = JSON.parse(sets);
        Object.keys(app.settings).forEach((k) => {
          if (k in sets) app.settings[k] = sets[k];
        });
      } catch (e) {
        console.warn("Failed to load game settings", e);
      }
      // load announcements
      try {
        let announcements = localStorage.getItem("forsenle-announcements");
        announcements = JSON.parse(announcements);
        Object.keys(app.announcements).forEach((k) => {
          if (k in announcements) app.announcements[k] = announcements[k];
        });
      } catch (e) {
        console.warn("Failed to load announcements state", e);
      }
      // load field state
      try {
        let field = localStorage.getItem("forsenle-state");
        field = JSON.parse(field);
        Object.keys(app.game).forEach((k) => {
          if (k in field) app.game[k] = field[k];
        });
      } catch (e) {
        console.warn("Failed to load game state", e);
      }
      // load stats
      try {
        let stats = localStorage.getItem("forsenle-stats");
        stats = JSON.parse(stats);
        Object.keys(app.stats).forEach((k) => {
          if (k in stats) app.stats[k] = stats[k];
        });
        app.stats.lastvisit = new Date(app.stats.lastvisit);
      } catch (e) {
        console.warn("Failed to load stats", e);
      }
      // load prestige state
      try {
        let prestige = localStorage.getItem("forsenle-prestige");
        prestige = JSON.parse(prestige);
        Object.keys(app.prestige).forEach((k) => {
          if (k in prestige) app.prestige[k] = prestige[k];
        });
      } catch (e) {
        console.warn("Failed to load prestige state", e);
      }
      // apply fixups
      if (!app.settings.inputTypeOverrideHappened) {
        // force change of input type for all old datetimepicker users (once)
        if (app.settings.inputType === "datetimepicker") {
          app.settings.inputType = "flipbox";
        }
      }
      app.settings.inputTypeOverrideHappened = true;
      // apply settings
      app.aux.toggleDarkMode(true);
      app.aux.toggleHighContrastMode(true);
      app.aux.applyHardModeBlock(true);
      app.aux.applyCustomDateOrder(true);
      app.aux.toggleCalendarInput(true);
      app.aux.toggleZoomImageOnClick(true);
      // settings menu: update calendar type description
      app.html.settings.calAdvice.text(app.consts.datePickerTypeHints[app.settings.inputType] || app.html.settings.calAdvice.attr("data-fallback-text"));
    },

    // action: draw all previous guesses as html (called on page refresh)
    restoreField: () => {
      // prestige: block invite for users who finished round before prestige update
      if (!app.prestige.issue) app.prestige.finished = true;
      // hard mode: update counter
      app.aux.fillHMCounter();
      // draw every guess
      app.game.tries.forEach((atmpt, i, arr) => {
        try {
          if (atmpt.endsWith("Z")) {
            // apply utc fix
            const d = new Date(atmpt);
            const fixed = app.aux.getTZMidnightDateString(d);
            arr[i] = fixed;
            app.aux.drawAndCheckUserGuess(new Date(fixed));
          } else {
            app.aux.drawAndCheckUserGuess(new Date(atmpt));
          }
          // ignore function's result since app.game.victory should already be non-zero if win
        } catch (e) {
          console.error("Game state unwrap error", e);
        }
      });
      if (!app.game.victory && app.settings.hardMode && app.game.tries.length >= app.consts.hardModeAttempts) {
        app.game.victory = -1; // state = loss
      }
      // if game over, do some things
      if (app.game.victory !== 0) {
        app.html.prestige.counters.text(app.prestige.guesses.length);
        // hard mode: reveal correct answer
        if (app.game.victory < 0) {
          app.prestige.finished = true; // blocks prestige invite
          app.aux.drawAndCheckUserGuess(app.target, true);
        }
        // remove controls and hard mode counter
        app.html.controls.container.hide();
        app.html.hardMode.container.hide();
        // prestige: check if round is unfinished
        if (!app.prestige.finished) {
          if (app.prestige.started) {
            // draw every guess
            app.prestige.guesses.forEach((atmpt) => {
              try {
                app.aux.drawAndCheckPrestigeGuess(atmpt);
              } catch (e) {
                console.error("Game state unwrap error", e);
              }
            });
            app.html.game.guesses.hide();
            app.html.prestige.container.show();
          } else {
            app.html.prestige.invite.show();
          }
        } else {
          // show game info
          app.aux.fillSrcInfo();
          app.html.gameinfo.container.show();
          // and show stats screen
          app.aux.victory(2000);
        }
      }
    },

    // action: save important stuff into localStorage
    save: () => {
      localStorage.setItem("forsenle-state", JSON.stringify(app.game));
      localStorage.setItem("forsenle-prestige", JSON.stringify(app.prestige));
      localStorage.setItem("forsenle-stats", JSON.stringify(app.stats));
      localStorage.setItem("forsenle-settings", JSON.stringify(app.settings));
      localStorage.setItem("forsenle-announcements", JSON.stringify(app.announcements));
    },

    // action: create a fancy string with emojis and send it to clipboard or mobile "share"
    share: () => {
      try {
        let str = "Forsle";
        if (app.game.victory) {
          str += ` #${app.currentIssue + 1} - `;
          str += app.game.victory > 0 ? "🧔 in " + app.game.tries.length : "🙅";
          str += app.settings.hardMode ? " ♨️" : "";
          let lastRow = "",
            lastRowOccurence = 0; // to collapse repeating lines
          app.emojiField.forEach((row) => {
            //let rowOfEmojis = (row_id + 1) + " ";
            let rowOfEmojis = "";
            app.consts.dateElements[app.settings.dateOrder].forEach((d) => {
              rowOfEmojis += row[d];
            });
            rowOfEmojis += row.direction;
            if (lastRow !== rowOfEmojis) {
              if (lastRow) str += "\n" + lastRow;
              if (lastRowOccurence > 1) str += "×" + lastRowOccurence;
              lastRowOccurence = 0;
            }
            lastRow = rowOfEmojis;
            lastRowOccurence += 1;
          });
          if (lastRow) str += "\n" + lastRow;
          if (lastRowOccurence > 1) str += "×" + lastRowOccurence;
        }
        if (app.prestige.started && app.prestige.finished) {
          str += "\n" + app.consts.emojis.prestige + " Prestige: " + app.prestige.guesses.length;
        }
        let winrate = Math.floor((100 * app.stats.wins) / Math.max(app.stats.games, 1));
        str += `\n🧮 Games: ${app.stats.games} (${winrate}%, ${app.stats.streak > 0 ? "+" : ""}${app.stats.streak})`;
        if (app.stats.wins > 0) {
          str += ` Avg: ${app.stats.avg.toFixed(2)} (${app.stats.min}~${app.stats.max})`;
        }
        str += `\n${window.location.origin + window.location.pathname}`;
        // for first-timers stats should be overridden (there's nothing to show)
        if (!app.game.victory && app.stats.games < 1) {
          str = "🧔 Forsle\n" + window.location.origin + window.location.pathname;
        }
        // mobile frogs have their native way of sharing things
        if (app.aux.isMobileClient()) {
          let shareable = { text: str };
          if (navigator.share && navigator.canShare && navigator.canShare(shareable))
            return navigator
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
              .then(
                () => "Results shared!",
                (e) => {
                  throw e;
                }
              );
        }
        // desktop friends - let's hope they use modern browsers
        return navigator.clipboard.writeText(str).then(() => "Copied to clipboard!");
      } catch (e) {
        // what is this retarded browser then???
        console.error(e);
        return Promise.reject(e);
      }
    },

    // action: show stats (if delay>0, it's a celebratory victory screen)
    victory: (delay = 0) => {
      // modal decoration
      if (app.game.victory !== 0) {
        const win = app.game.victory > 0;
        // modal title
        app.html.stats.title.text(win ? "🧔 Clone has been identified!" : "🤔 Did that stream really happen?");
        // show celebratory message
        app.html.stats[win ? "congrats" : "shame"].show();
        // show countdown block
        app.html.countdown.parent().show();
      }
      // stats and shit
      if (app.game.victory || app.stats.games > 0) {
        app.html.stats.tries.text(app.game.tries.length);
        // fill stats:
        for (let stat in app.stats) {
          if (/^p[A-Z]/.test(stat)) continue; // skip prestige stats
          switch (stat) {
            case "avg": {
              // avgtimes stat is a float, needs some love:
              app.html.stats.avgtimes.text(app.stats[stat].toFixed(2));
              break;
            }
            case "wins": {
              // calculate winrate
              let winrate = (100 * app.stats.wins) / Math.max(app.stats.games, 1);
              app.html.stats.winrate.text(Math.floor(winrate) + "%");
              break;
            }
            case "min":
            case "max": {
              // min-max can look weird if user lost a hard mode game as first run
              app.html.stats[stat].text(app.stats[stat] < 0 ? "-" : app.stats[stat]);
              break;
            }
            default: {
              // each html node should have appropriate id for the stat
              if (!(stat in app.html.stats)) continue;
              app.html.stats[stat].text(app.stats[stat]);
              break;
            }
          }
        }
      }
      // prestige stats
      if (app.prestige.started && app.prestige.finished) {
        app.html.prestige.frameCounter.show();
        app.html.stats.prestige.title.show();
      }
      if (app.stats.pGames > 0) {
        const winrate = Math.floor((100 * app.stats.pWins) / app.stats.pGames);
        app.html.stats.prestige.games.text(app.stats.pGames);
        app.html.stats.prestige.wins.text(`${app.stats.pWins} (${winrate.toFixed(0)}%)`);
        app.html.stats.prestige.avgtimes.text(app.stats.pAvg > 0 ? app.stats.pAvg.toFixed(2) : "-");
        app.html.stats.prestige.max.text(app.stats.pMax || "-");
        app.html.stats.prestige.min.text(app.stats.pMin || "-");
      }
      // add "fade" effect for victory message
      app.html.modals.stats.toggleClass("fade", delay > 0);
      // reveal modal (after some delay if specified)
      setTimeout(() => {
        if (app.game.victory > 0 && delay > 0) {
          // win = confetti
          app.aux.sprinkleSomeLove(1000);
        }
        if (delay > 0) app.aux.hideAllModals();
        app.modals.stats.show();
      }, delay);
    },
  },
};

/* application starter */
window.onload = function () {
  // bring modal elements to life
  Object.keys(app.html.modals).forEach((modalType) => {
    app.modals[modalType] = new bootstrap.Modal(app.html.modals[modalType]);
  });

  // load everything we might need
  app.aux.load();

  // game starts when we get the list of available frames
  fetch(app.consts.mediasrc)
    .then((r) => r.json()) // get pictures list
    .then((datalist) => {
      // calculate issue number
      app.currentIssue = Math.floor((app.time.getTime() - app.consts.startDate.getTime()) / (1000 * 3600 * 24));
      if (app.currentIssue < 0) {
        // user opened page before app.consts.startDate happened
        app.html.loader.img.prop("src", "/pics/forsenle/godseed.gif");
        app.html.loader.text.html("<small><i>Generating god seed...</i></small><br>Your game starts tomorrow!");
        return;
      }
      if (app.currentIssue !== app.game.issue) {
        if (app.currentIssue - app.stats.lastissue !== 1) {
          app.stats.streak = 0;
        }
        app.game.issue = app.currentIssue;
        app.aux.clearField();
      }
      // prestige: build game autocomplete list
      const existingGames = datalist.map((data) => data.game);
      app.gameGuessList = new Set(
        existingGames
          .concat(app.consts.extraPrestigeSuggestions)
          .filter((g) => !app.consts.nonPrestigeGames.includes(g))
          .sort()
      );
      app.gameGuessList.forEach((game) => {
        const option = document.createElement("option");
        option.value = game;
        app.html.prestige.suggestions.append(option);
      });
      // user notification control
      if (!app.stats.lastvisit) {
        app.html.modals.welcome.addClass("fade");
        app.modals.welcome.show();
        // render some notifications obsolete - since they are intended for returning users
        app.announcements.highContrastModeAdded = new Date();
        app.aux.save();
      } else {
        app.aux.renderNotifications();
      }
      // define today's video and timeframe
      const srcIndex = app.currentIssue % datalist.length;
      app.src = datalist[srcIndex];
      app.target = new Date(app.src.date.replace("Z", ""));
      app.html.game.frame.prop("src", app.src.link);
      // game draws everything when image loads
      app.html.game.frame.on("load", () => {
        app.aux.restoreField();
        // end loading: switch main section
        app.html.loader.container.hide();
        app.html.game.container.show();
      });
      // game panics when image fails to load
      app.html.game.frame.on("error", (event) => {
        console.error("Game image generated an error event!", event);
        // build an error message, with a fancy auto email link
        showError(
          "Stream image could not be loaded!<br><br>Try refreshing the page. If this happens again, please " +
            `<a href="mailto:admin@g7eternal.com?subject=Forsle%20not%20working%20(missing%20image)">notify me</a> about the problem.`
        );
        // flavor:
        app.html.loader.img.prop("src", "/pics/forsenle/forsenpossessed.gif");
        app.html.loader.text.html("Clone factory malfunctioning!<br>Please try again later");
        // force loader section to remain on screen
        app.html.loader.container.show();
        app.html.game.container.hide();
      });
    })
    .catch((e) => {
      console.error("Src parsing error", e);
      const t = encodeURIComponent(e instanceof Error ? e.message : String(e));
      const n = encodeURIComponent(e instanceof Error ? e.name : "Exception");
      const s = encodeURIComponent(e instanceof Error ? e.stack : "(stack not available)");
      // build an error message, with a fancy auto email link
      showError(
        "An error occured while retrieving list of stream frames.<br>Try refreshing the page. If this happens again, please " +
          `<a href="mailto:admin@g7eternal.com?subject=Forsle%20not%20working%20(JSON parse)&body=Error:%20${n}:%20${t}%0D%0A${s}">notify me</a> about the problem.` +
          `<br><br><em>ERROR: ${decodeURIComponent(t)}</em>`
      );
      // flavor:
      app.html.loader.img.prop("src", "/pics/forsenle/forsenpossessed.gif");
      app.html.loader.text.html("Clone factory malfunctioning!<br>Please try again later");
    });

  // start "next day" timer
  const nextDay = new Date(app.time.getFullYear(), app.time.getMonth(), app.time.getDate() + 1);
  const nextDayInterval = setInterval(() => {
    let d = Math.floor((nextDay.getTime() - Date.now()) / 1000);
    if (d < 0) {
      return clearInterval(nextDayInterval);
    }
    app.html.countdown.text(`${String(Math.floor(d / 3600)).padStart(2, "0")}:${String(Math.floor((d % 3600) / 60)).padStart(2, "0")}:${String(d % 60).padStart(2, "0")}`);
  }, 1000);
  /* nb: autorefresh on nextDay timer running out is probably not a good idea
         can lead to everyone refreshing at once, creating a burst load
         nytimes wordle doesnt have autorefresh, why should we?
    */

  // CORE GAME //
  // event: user submits a guess (Submit button)
  app.html.controls.submitBtn.on("click", (event) => {
    const target = event.currentTarget;
    target.disabled = true;
    // hide custom calendar on input
    if (app.settings.inputType === "datetimepicker") {
      app.html.controls.inputDate.datetimepicker("hide");
    }
    // remove red tooltip on input
    app.aux.renderAdvice(app.html.controls.inputDate, null);
    // parse input
    try {
      let d = app.html.controls.inputDate.val();
      if (app.settings.inputType === "flipbox") {
        // flipbox provides date by itself
        d = app.html.controls.inputFlip.forsleFlipper(app, "getDate");
      }
      if (!d) throw new Error("Please provide a date!");
      try {
        d = app.aux.getUniformedDate(d);
        if (!(d instanceof Date) || isNaN(d)) throw new Error("Malformed date");
      } catch (e) {
        console.error("User input parse error", e);
        if (e.name === "RangeError") throw e; // likely thrown by getUniformedDate
        throw new Error("Please provide a valid date!");
      }
      // record this attempt
      app.game.tries.push(app.aux.getTZMidnightDateString(d));
      app.aux.applyHardModeBlock();
      // check if victory
      const win = app.aux.drawAndCheckUserGuess(d);
      if (win) {
        app.game.victory = 1;
      } else if (app.settings.hardMode && app.game.tries.length >= app.consts.hardModeAttempts) {
        app.game.victory = -1;
      }
      // do some things if game over
      if (app.game.victory !== 0) {
        // record stats
        app.stats.lastissue = app.currentIssue;
        let weighted = app.stats.avg * app.stats.games;
        app.stats.games += 1;
        if (app.game.victory * app.stats.streak < 0) app.stats.streak = 0;
        app.stats.streak += app.game.victory;
        if (app.game.victory > 0) {
          app.stats.wins += 1;
          if (app.stats.min < 0) app.stats.min = app.game.tries.length;
          app.stats.min = Math.min(app.stats.min, app.game.tries.length);
          if (app.stats.max < 0) app.stats.max = app.game.tries.length;
          app.stats.max = Math.max(app.stats.max, app.game.tries.length);
          app.stats.avg = (weighted + app.game.tries.length) / app.stats.games;
        }
        // hard mode: reveal correct answer
        if (app.game.victory < 0) {
          setTimeout(() => {
            app.aux.drawAndCheckUserGuess(app.target, true);
          }, 1500);
        }
        // show prestige round offer
        const isAllowedGame = !app.consts.nonPrestigeGames.includes(app.src.game);
        if (isAllowedGame && app.game.victory > 0 && app.prestige.issue === app.currentIssue) {
          // only if user won
          app.html.controls.container.hide();
          app.html.prestige.invite.show();
        } else {
          app.prestige.finished = true; // blocks prestige invite
          app.aux.finalizeGame();
        }
      }
      app.aux.save();
      setTimeout(() => {
        target.disabled = false;
      }, 1000);
    } catch (e) {
      console.warn("User submit error", e);
      // show popover
      app.aux.renderAdvice(app.html.controls.inputDate, String(e.message || e).replace(/\n/g, "<br>"));
      // forcefully reenable button
      target.disabled = false;
    }
  });

  app.html.prestige.inputField.on("keydown", (event) => {
    // user hits "enter" in input => means clicking "Submit"
    if (event.code === "Enter" || event.code === "NumpadEnter") {
      app.html.prestige.submitBtn.click();
    }
    // hide warning popover
    app.aux.renderAdvice(app.html.prestige.inputField, null);
  });

  app.html.controls.inputDate.on("keydown", (event) => {
    // user hits "enter" in input => means clicking "Submit"
    if (event.code === "Enter" || event.code === "NumpadEnter") {
      app.html.controls.submitBtn.click();
    }
    // hide warning popover
    app.aux.renderAdvice(app.html.controls.inputDate, null);
  });

  // BUTTONS //
  // share:
  app.html.buttons.share.on("click", (event) => {
    const button = event.target;
    button.disabled = true;
    app.aux
      .share()
      .then((resultMessage) => {
        // sharing success
        let txt = button.innerText;
        button.innerText = "✔️ " + resultMessage;
        button.classList = "btn btn-success";
        setTimeout(() => {
          // restore original text and reenable button
          button.innerText = txt;
          button.disabled = false;
          button.classList = "btn btn-primary";
        }, 2323);
      })
      .catch((e) => {
        console.warn("Share to clipboard failed", e);
        button.innerText = "🛑 Sharing failed!";
        button.classList = "btn btn-warning";
        // if sharing didnt work, dont reenable button - why bother? it will probably fail again
      });
  });

  // stats:
  app.html.buttons.stats.on("click", app.aux.victory);

  // settings:
  app.html.buttons.settings.on("click", () => {
    app.modals.settings.show();
  });

  // about/welcome:
  app.html.buttons.about.on("click", () => {
    app.html.modals.welcome.removeClass("fade");
    app.modals.welcome.show();
  });

  // click image to expand it:
  app.html.game.frame.parent().on("click", () => {
    if (!app.settings.zoomImageOnClick) return;
    app.html.game.frame.parent().toggleClass("frame-parent-popout");
    app.html.game.controlArea.css(
      // do not use "toggle" here, since it triggers reveal animations
      "visibility",
      (_i, visibility) => (visibility === "visible" ? "hidden" : "visible")
    );
  });

  // prestige: decline invite
  app.html.prestige.inviteDeclineBtn.on("click", () => {
    app.html.prestige.invite.hide();
    app.prestige.finished = true;
    app.aux.save();
    app.aux.finalizeGame(1);
  });

  // prestige: accept invite
  app.html.prestige.inviteAcceptBtn.on("click", () => {
    app.html.prestige.invite.hide();
    app.html.game.guesses.hide();
    app.prestige.started = true;
    app.stats.pGames += 1;
    app.aux.save();
    app.html.prestige.controls.show();
    app.html.prestige.container.show();
  });

  // prestige: give up
  app.html.prestige.giveUpBtn.on("click", () => {
    app.prestige.started = false; // prevents celebratory text from appearing
    app.prestige.finished = true;
    app.aux.save();
    app.html.prestige.controls.hide();
    app.aux.finalizeGame(2000);
  });

  /*
  // prestige: block suggestions if input field is empty
  app.html.prestige.inputField.on("input", () => {
    const value = app.html.prestige.inputField.val();
    if (value) {
      app.html.prestige.inputField.attr(
        "list",
        app.html.prestige.suggestions.attr("id")
      );
    } else {
      // nb: this breaks chrome's autocomplete dropdown somehow!
      app.html.prestige.inputField.removeAttr("list");
    }
  });
  */

  // prestige: hide advice on value change
  app.html.prestige.inputField.on("input", () => {
    app.aux.renderAdvice(app.html.prestige.inputField, null);
  });

  // prestige: submit guess button
  app.html.prestige.submitBtn.on("click", () => {
    const value = String(app.html.prestige.inputField.val());
    if (!value || !app.gameGuessList.has(value)) return;

    app.html.prestige.inputField.val("");

    if (app.prestige.guesses.includes(value)) {
      app.aux.renderAdvice(app.html.prestige.inputField, "You have already tried this one:<br><i>" + value + "</i>");
      return;
    }

    app.prestige.guesses.push(value);
    app.aux.save();
    const win = app.aux.drawAndCheckPrestigeGuess(value);
    if (win) {
      app.prestige.finished = true;

      const clicks = app.prestige.guesses.length;
      const weighted = app.stats.pAvg * app.stats.pWins;
      app.stats.pWins += 1;
      app.stats.pAvg = (weighted + clicks) / app.stats.pWins;
      if (app.stats.pMax < clicks) app.stats.pMax = clicks;
      if (app.stats.pMin === 0 || app.stats.pMin > clicks) app.stats.pMin = clicks;

      app.aux.save();
      app.html.prestige.controls.hide();
      app.aux.finalizeGame(2000);
    }
  });

  // SETTINGS //
  // hard mode
  app.html.settings.hardMode.on("change", (event) => {
    app.settings.hardMode = event.target.checked;
    app.aux.save();
    app.aux.applyHardModeBlock();
  });
  // dark mode
  app.html.settings.darkMode.on("change", (event) => {
    app.settings.darkMode = event.target.checked;
    app.aux.save();
    app.aux.toggleDarkMode();
  });
  // high contrast mode
  app.html.settings.highContrastMode.on("change", (event) => {
    app.settings.highContrastMode = event.target.checked;
    app.aux.save();
    app.aux.toggleHighContrastMode();
  });
  // zoom image on click option toggle
  app.html.settings.zoomImageOnClick.on("change", (event) => {
    app.settings.zoomImageOnClick = event.target.checked;
    app.aux.save();
    app.aux.toggleZoomImageOnClick();
  });
  // user input type
  app.html.settings.calendar.on("change", (event) => {
    if (!event.target.value) return;
    app.settings.inputType = event.target.value;
    app.aux.save();
    app.aux.toggleCalendarInput();
    // update helper
    app.html.settings.calAdvice.text(app.consts.datePickerTypeHints[event.target.value] || app.html.settings.calAdvice.attr("data-fallback-text"));
  });
  // guess date format
  app.html.settings.datefmt.on("change", (event) => {
    app.settings.dateOrder = event.target.value;
    app.aux.save();
    app.aux.applyCustomDateOrder();
  });

  // initialize dynamic bootstrap elements
  const tooltipTriggerList = document.querySelectorAll('main [data-bs-toggle="tooltip"]');
  Array.from(tooltipTriggerList).forEach((tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl));

  /* // disabled until further notice
    // install service worker
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("/serviceworker.js");
    }
    */
};
