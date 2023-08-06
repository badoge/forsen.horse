let infoModal;

window.onload = async function () {
  infoModal = new bootstrap.Modal(document.getElementById("infoModal"));

  let response = await fetch("/soundboard/samples.json");
  let samples = await response.json();

  let response2 = await fetch("/soundboard/categories.json");
  let enabledCategories = await response2.json();

  const categories = samples.reduce((groups, sample) => {
    const key = sample.category;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(sample);
    return groups;
  }, {});

  for (const category of Object.keys(categories)) {
    const sample = categories[category];
    if (!enabledCategories[category]) {
      continue;
    }
    document.getElementById("dank").innerHTML += `<div class="category-label"><h1 class="display-5">${category}</h1>
    <small class="text-body-secondary">${enabledCategories[category].description}</small><br></div>`;

    const container = document.createElement("div");
    container.classList = "category-div";

    for (let index = 0; index < sample.length; index++) {
      const div = document.createElement("div");
      div.classList = `btn-group sample-div ${sample[index].source || sample[index].description ? "has-metadata" : "no-metadata"} m-2`;
      div.role = "group";
      div["aria-label"] = sample[index].name + "button group";
      const modalButton = document.createElement("button");
      modalButton.classList = `btn ${enabledCategories[category].class} info-button p-1`;
      modalButton.type = "button";
      modalButton.title = "Sample info";
      modalButton.dataset.category = sample[index].category;
      modalButton.dataset.name = sample[index].name;
      modalButton.dataset.source = sample[index].source || "no source yet";
      modalButton.dataset.description = sample[index].description || "no description yet";
      modalButton.innerHTML = `<i class="material-icons notranslate">info</i>`;

      const button = document.createElement("button");

      button.innerText = sample[index].name.replace(".mp3", "");
      button.type = "button";
      button.classList = `btn ${enabledCategories[category].class} play-button`;
      button.dataset.category = sample[index].category;
      button.dataset.name = sample[index].name;

      div.appendChild(button);
      div.appendChild(modalButton);
      container.appendChild(div);
      document.getElementById("dank").appendChild(container);
    }
  }
  document.addEventListener("click", function (event) {
    if (event.target.nodeName === "BUTTON") {
      if (event.target.classList.contains("play-button")) {
        playSample(event.target.dataset.category, event.target.dataset.name);
      }
      if (event.target.classList.contains("info-button")) {
        document.getElementById("infoModalLabel").innerHTML = event.target.dataset.name.replace(".mp3", "");
        document.getElementById("infoModalBody").innerHTML = `
        <b><i class="material-icons notranslate">label</i> Name:</b> ${event.target.dataset.name.replace(".mp3", "")}<br>
        <b><i class="material-icons notranslate">category</i> Category:</b> ${event.target.dataset.category}<br>
        <b><i class="material-icons notranslate">source</i> Source:</b> ${event.target.dataset.source}<br>
        <b><i class="material-icons notranslate">description</i> Description:</b> ${event.target.dataset.description}<br><br>
        <button 
        type="button" 
        class="btn btn-secondary" 
        onclick="copyLink(event,'https://badoge.github.io/soundboard/forsen/${event.target.dataset.category}/${event.target.dataset.name}')">
        <i class="material-icons notranslate">content_copy</i> Copy direct link 
        </button>`;
        infoModal.show();
      }
    }

    if (event.target.id == "showAll") {
      let samplesWithMetadata = document.querySelectorAll(`.has-metadata`);
      let samplesWithoutMetadata = document.querySelectorAll(`.no-metadata`);
      for (let index = 0; index < samplesWithMetadata.length; index++) {
        samplesWithMetadata[index].style.display = "";
      }
      for (let index = 0; index < samplesWithoutMetadata.length; index++) {
        samplesWithoutMetadata[index].style.display = "";
      }
    }
    if (event.target.id == "showWithMetadata") {
      let samplesWithMetadata = document.querySelectorAll(`.has-metadata`);
      let samplesWithoutMetadata = document.querySelectorAll(`.no-metadata`);
      for (let index = 0; index < samplesWithMetadata.length; index++) {
        samplesWithMetadata[index].style.display = "";
      }
      for (let index = 0; index < samplesWithoutMetadata.length; index++) {
        samplesWithoutMetadata[index].style.display = "none";
      }
    }
    if (event.target.id == "showWithoutMetadata") {
      let samplesWithMetadata = document.querySelectorAll(`.has-metadata`);
      let samplesWithoutMetadata = document.querySelectorAll(`.no-metadata`);
      for (let index = 0; index < samplesWithMetadata.length; index++) {
        samplesWithMetadata[index].style.display = "none";
      }
      for (let index = 0; index < samplesWithoutMetadata.length; index++) {
        samplesWithoutMetadata[index].style.display = "";
      }
    }
  });
}; //onload

let isPlaying = false;
async function playSample(category, fileName) {
  if (!document.getElementById("allowOverlap").checked && isPlaying) {
    return;
  }
  try {
    audio = new Audio(`https://badoge.github.io/soundboard/forsen/${category}/${fileName}`);
    await audio.play();
    isPlaying = true;
    audio.addEventListener("ended", function () {
      isPlaying = false;
    });
  } catch (error) {
    isPlaying = false;
    console.log(error);
  }
} //playSample

function copyLink(event, link) {
  navigator.clipboard.writeText(encodeURI(link));
  event.target.innerHTML = "Link copied :)";
  setTimeout(() => {
    event.target.innerHTML = `<i class="material-icons notranslate">content_copy</i> Copy direct link `;
  }, 2000);
} //copyLink

function search(event) {
  document.getElementById("showAll").checked = true;
  let filter = event.target.value.toLowerCase();
  let labels = document.querySelectorAll(`.category-label`);
  let divs = document.querySelectorAll(`.category-div`);
  for (let index = 0; index < labels.length; index++) {
    let samples = divs[index].querySelectorAll(`.sample-div`);
    let allButtonsHidden = true;
    for (let i = 0; i < samples.length; i++) {
      let button = samples[i].getElementsByTagName("button")[0];
      if (button.textContent.toLowerCase().indexOf(filter) > -1) {
        samples[i].style.display = "";
        allButtonsHidden = false;
      } else {
        samples[i].style.display = "none";
      }
    }
    if (allButtonsHidden) {
      labels[index].style.display = "none";
    } else {
      labels[index].style.display = "";
    }
  }
} //search
