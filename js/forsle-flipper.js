/* globals jQuery */

(function ($) {
  /* this jquery plugin builds a date flipper inside specified html container */
  /* needs "app" reference as it's made specifically for forsle */

  // local consts
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

  // local vars
  let lastscrollp = 0;
  let lasttouchp = 0;
  const touchToAdjust = 28;

  // date container
  const date = {
    FullYear: 0,
    Month: 0,
    Date: 0,
  };
  const colorCodes = {
    FullYear: {},
    Month: {},
    Date: {},
    classes: ["ug-correct", "ug-close", "ug-far", "ug-incorrect"],
  };
  let startingDate = new Date();

  // pre-render controls:
  const makePickerContainer = (...classes) => {
    return $(`<div class="${classes.join(" ")}"></div>`);
  };
  const makePickerButton = (...classes) => {
    return $(`<button class="${classes.join(" ")}"></button>`);
  };

  // date input representation
  const inputs = {
    // date, month, year
    Date: makePickerContainer("flipbox-picker", "flipbox-date"),
    Month: makePickerContainer("flipbox-picker", "flipbox-month"),
    FullYear: makePickerContainer("flipbox-picker", "flipbox-fullyear"),
  };
  const parseDate = (d) => {
    Object.keys(date).forEach((k) => {
      date[k] = d["get" + k]();
    });
  };

  // container divs
  const containers = {
    Date: makePickerContainer("flipbox-picker-parent", "flipbox-date-parent"),
    Month: makePickerContainer("flipbox-picker-parent", "flipbox-month-parent"),
    FullYear: makePickerContainer("flipbox-picker-parent", "flipbox-fullyear-parent"),
    global: makePickerContainer("flipbox-container"),
  };

  // date input aux buttons
  const buttons = {
    Date: {
      up: makePickerButton("flipbox-arrow", "flipbox-arrow-up"),
      down: makePickerButton("flipbox-arrow", "flipbox-arrow-down"),
    },
    Month: {
      up: makePickerButton("flipbox-arrow", "flipbox-arrow-up"),
      down: makePickerButton("flipbox-arrow", "flipbox-arrow-down"),
    },
    FullYear: {
      up: makePickerButton("flipbox-arrow", "flipbox-arrow-up"),
      down: makePickerButton("flipbox-arrow", "flipbox-arrow-down"),
    },
  };

  //button and misc events
  const events = {
    adjustDate: (v) => {
      if (!v) return;
      date.Date += Math.sign(v);
      const m = new Date(date.FullYear, date.Month + 1, 0).getDate();
      if (date.Date > m) date.Date = 1;
      if (date.Date < 1) date.Date = m;
      events.updateTexts();
    },
    adjustMonth: (v) => {
      if (!v) return;
      date.Month += Math.sign(v);
      if (date.Month > 11) date.Month = 0;
      if (date.Month < 0) date.Month = 11;
      events.updateTexts();
      events.setMaxDays();
    },
    adjustFullYear: (v) => {
      if (!v) return;
      date.FullYear += Math.sign(v);
      date.FullYear = Math.max(2010, Math.min(new Date().getFullYear(), date.FullYear));
      events.updateTexts();
      events.setMaxDays();
    },
    setMaxDays: () => {
      const m = new Date(date.FullYear, date.Month + 1, 0).getDate();
      if (date.Date > m) {
        date.Date = m;
        events.updateTexts();
      }
    },
    updateTexts: () => {
      Object.keys(inputs).forEach((k) => {
        switch (k) {
          case "Month":
            inputs[k].text(months[date.Month]);
            break;
          default:
            inputs[k].text(date[k]);
            break;
        }
        // paint picker element according to prev guesses
        colorCodes.classes.forEach((cssClass, i) => {
          inputs[k].toggleClass(cssClass, colorCodes[k][date[k]] === i);
        });
      });
    },
  };
  Object.keys(buttons).forEach((k) => {
    buttons[k].up.on("click", () => events["adjust" + k](1));
    buttons[k].down.on("click", () => events["adjust" + k](-1));
  });

  // work with inputs:
  Object.keys(inputs).forEach((k) => {
    // link up parents and children
    inputs[k].appendTo(containers[k]);
    buttons[k].up.text("▲");
    buttons[k].up.appendTo(containers[k]);
    buttons[k].down.text("▼");
    buttons[k].down.appendTo(containers[k]);
    containers[k].appendTo(containers.global);

    // assign scroll event
    inputs[k].on("wheel", (event) => {
      const e = event.originalEvent;
      e.preventDefault();
      lastscrollp = lastscrollp + e.deltaY;
      if (lastscrollp > 0 && e.deltaY < 0) {
        lastscrollp = 0;
      }
      if (lastscrollp < 0 && e.deltaY > 0) {
        lastscrollp = 0;
      }
      if (lastscrollp > 10 || lastscrollp < -10) {
        events["adjust" + k](e.deltaY);
        lastscrollp = 0;
      }
    });
    // assign touch events
    inputs[k].on("touchstart", (event) => {
      const e = event.originalEvent;
      lasttouchp = e.changedTouches[0].pageY;
    });
    inputs[k].on("touchmove", (event) => {
      const e = event.originalEvent;
      e.preventDefault();
      let diff = e.changedTouches[0].pageY - lasttouchp;
      let updown = 0;
      if (diff > touchToAdjust) {
        updown = -1;
        lasttouchp = e.changedTouches[0].pageY;
      } else {
        if (diff < -touchToAdjust) {
          updown = 1;
          lasttouchp = e.changedTouches[0].pageY;
        }
      }
      events["adjust" + k](updown);
    });
  });

  // plugin shenanigans
  $.fn.forsleFlipper = function (app, action, ...args) {
    if (!app || typeof app !== "object" || !app.consts) throw new Error("Must provide [app] reference as first argument!");
    if (!action || typeof action !== "string") throw new Error("Must provide [action] string as second argument!");

    switch (action) {
      case "init": {
        // create controls and stuff
        const lastGuessDate = app.game.tries[app.game.tries.length - 1];
        if (lastGuessDate) startingDate = new Date(lastGuessDate);
        parseDate(startingDate);
        events.updateTexts();
        containers.global.appendTo(this);
        break;
      }

      case "setDate": {
        // force set date
        if (!args[0] || !(args[0] instanceof Date)) {
          throw new Error("Action 'setDate' expects a Date argument!");
        }
        startingDate = new Date(args[0]);
        parseDate(startingDate);
        events.updateTexts();
        break;
      }

      case "getDate": {
        // return user's input
        return date.FullYear + "-" + String(date.Month + 1).padStart(2, "0") + "-" + String(date.Date).padStart(2, "0");
      }

      case "colors": {
        /** adds color codes mapping
         *
         * args[0] should look like:
         * {
         *  FullYear: [2021, "ug-close"],
         *  Month: [11, "ug-incorrect"],
         *  Date: [30, "ug-correct"]
         * }
         */
        if (!args[0] || typeof args[0] !== "object") {
          throw new Error("Action 'colors' expects an Object as a followup argument!");
        }
        const codes = args[0];
        Object.keys(date).forEach((k) => {
          if (!(k in codes)) return;
          if (!Array.isArray(codes[k]) || codes[k].length < 2) {
            throw new Error(`Element [${k}] of input argument is malformed! Expecting an array of 2 values - date element (number) and class name (string)`);
          }
          colorCodes[k][codes[k][0]] = colorCodes.classes.indexOf(codes[k][1]);
        });
        events.updateTexts();
        break;
      }

      default:
        throw new Error("Unknown action: " + action);
    }

    return this;
  };
})(jQuery);
