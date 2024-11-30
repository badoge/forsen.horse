async function loadClips() {
  let clipsTable = new DataTable("#clipsTable", {
    language: {
      emptyTable: "loading...",
    },
  });

  try {
    let response = await fetch(`/clips/clips.json`);
    let clips = await response.json();
    console.log(clips);
    for (let index = 0; index < clips.length; index++) {
      clipsTable.row.add([
        escapeString(clips[index].title || "no title"),
        escapeString(clips[index].game_name || "no game"),
        clips[index].duration,
        clips[index].view_count.toLocaleString(),
        clips[index].created_at,
        clips[index].creator_name || "no username",
        `<a href="/clip#${clips[index]._id}" target="_blank" rel="noopener noreferrer" class="no-decoration">Link</a>`,
      ]);
    }

    clipsTable.draw(false);
  } catch (error) {
    console.log(error);
  }
} //loadClips

async function playClip() {
  let clipID = location.hash?.replace("#", "")?.trim();
  console.log(clipID);

  if (clipID) {
    document.getElementById("clipPlayer").src = `https://clips.forsen.horse/${clipID}`;
    let response = await fetch(`/clips/clips.json`);
    let clips = await response.json();

    let clip = clips.find((e) => e._id === clipID);

    if (!clip) {
      document.getElementById("clipTitle").innerHTML = "Clip info not found";
      document.getElementById("clipInfo").innerHTML = "Clip info not found";
    } else {
      document.getElementById("clipTitle").innerHTML = `${escapeString(clip.title || "no title")} - ${escapeString(clip.game_name || "no game")}`;
      document.getElementById("clipInfo").innerHTML = `${clip.view_count} ${clip.view_count == 1 ? "view" : "views"} - Clipped by ${clip.creator_name || "no username"} on ${
        clip.created_at
      }`;
    }
  } else {
    document.getElementById("clipTitle").innerHTML = "No Clip ID provided";
    document.getElementById("clipInfo").innerHTML = `Go back to the <a href="/clips/"  rel="noopener noreferrer" class="no-decoration">Clips page</a> to search for clips`;
  }
} //playClip

/**
 * @description replace <, >, &, ', ", `, \ and / with HTML entities. - from https://github.com/validatorjs/validator.js
 * @param {*} str
 * @returns {*}
 */
function escapeString(str) {
  assertString(str);
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\//g, "&#x2F;")
    .replace(/\\/g, "&#x5C;")
    .replace(/`/g, "&#96;");
} //escapeString

function assertString(input) {
  let isString = typeof input === "string" || input instanceof String;
  if (!isString) {
    let invalidType = _typeof(input);
    if (input === null) invalidType = "null";
    else if (invalidType === "object") invalidType = input.constructor.name;
    throw new TypeError("Expected a string but received a ".concat(invalidType));
  }
} //assertString
