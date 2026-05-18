// =========================
// VARIABLES
// =========================

const skinHub = document.getElementById("SkinHub");

const searchBar = document.getElementById("SearchBar");

const tagList = document.getElementById("TagList");

const skinOverlay = document.getElementById("SkinOverlay");

const overlaySkinName = document.getElementById("OverlaySkinName");

const skinVideo = document.getElementById("SkinVideo");

const closeButton = document.getElementById("CloseButton");

let activeTags = [];

// =========================
// TAG CATEGORIES
// =========================

const tagCategories = {
  Gender: ["Male", "Female", "Young Male", "Unisex"],

  "Art Style": ["Cartoon", "Cell shaded", "Anime"],

  Hair: [
    "Fade",
    "Short Hair",
    "Long Hair",
    "Spiky Hair",
    "Ponytail",
    "Dreads",
    "Unique Hairstyle",
    "Bald",
  ],

  Fashion: [
    "Streetwear",
    "Luxury",
    "Casual",
    "Suit",
    "Jacket",
    "Skirt",
    "Hood",
    "Hat",
    "Mask",
    "Bandanna",
  ],

  Accessories: [
    "Necklace",
    "Bracelet",
    "Earrings",
    "Nose Ring",
    "Piercings",
    "Nails",
    "Goggles",
    "Visor Glasses",
  ],

  Themes: [
    "Futuristic",
    "Military",
    "Tactical",
    "Horror",
    "Royalty",
    "School",
    "Apocalyptic",
  ],

  Body: ["Robot", "Cybernetic", "Cyborg", "Slim", "Brute"],

  Age: ["Young", "Middle", "Old"],

  "Skin Tone": ["Dark Skin", "Light Brown Skin"],

  Series: ["Marvel", "Star Wars", "Icon Series", "Gaming Legends Series"],

  "Character Type": ["Superhero", "Agent", "Pilot", "Animal", "Goat", "Peely"],

  Region: ["Asian", "Middle Eastern"],
};

// =========================
// CREATE TAG CATEGORIES
// =========================

Object.entries(tagCategories).forEach(([categoryName, tags]) => {
  // CATEGORY CONTAINER

  const category = document.createElement("div");

  category.classList.add("TagCategory");

  // CATEGORY HEADER

  const header = document.createElement("div");

  header.classList.add("CategoryHeader");

  header.innerHTML = `

    <span>${categoryName}</span>
    <span>+</span>

  `;

  // TAG CONTAINER

  const tagContainer = document.createElement("div");

  tagContainer.classList.add("CategoryTags");

  // TOGGLE OPEN

  header.addEventListener("click", () => {
    category.classList.toggle("Open");
  });

  // CREATE TAGS

  tags.forEach((tag) => {
    const tagElement = document.createElement("div");

    tagElement.classList.add("FilterTag");

    tagElement.textContent = tag;

    tagElement.addEventListener("click", () => {
      tagElement.classList.toggle("Active");

      if (activeTags.includes(tag)) {
        activeTags = activeTags.filter((t) => t !== tag);
      } else {
        activeTags.push(tag);
      }

      filterSystem();
    });

    tagContainer.appendChild(tagElement);
  });

  category.appendChild(header);

  category.appendChild(tagContainer);

  tagList.appendChild(category);
});

// =========================
// OPEN OVERLAY
// =========================

function openSkinOverlay(skin) {
  skinOverlay.style.display = "flex";

  overlaySkinName.textContent = skin.Identity.skin_name;

  const videoURL = `https://fnggcdn.com/items/${skin.id}/video.mp4?2`;

  skinVideo.src = videoURL;

  skinVideo.play();
}

// =========================
// DISPLAY SKINS
// =========================

function displaySkins(skinArray) {
  skinHub.innerHTML = "";

  if (skinArray.length === 0) {
    skinHub.innerHTML = `
      <p class="NoResults">
        No matching skins found.
      </p>
    `;

    return;
  }

  skinArray.forEach((skin) => {
    const imageURL = `./Images/Skins/${skin.id}.jpg`;

    const tagHTML = skin.Tags.map((tag) => {
      return `
          <span class="CardTag">
            ${tag}
          </span>
        `;
    }).join("");

    skinHub.innerHTML += `

      <div
        class="SkinCard"
        onclick="openSkinOverlay(skins[${skins.indexOf(skin)}])"
      >

        <h3 class="SkinName">
          ${skin.Identity.skin_name}
        </h3>

        <img src="${imageURL}" />

        <div class="CardTags">
          ${tagHTML}
        </div>

      </div>

    `;
  });
}

// =========================
// FILTER SYSTEM
// =========================

function filterSystem() {
  const searchText = searchBar.value.toLowerCase().trim();

  const filteredSkins = skins.filter((skin) => {
    const searchableText = `

        ${skin.Identity.skin_name}

        ${skin.SearchableTerms.join(" ")}

        ${skin.Tags.join(" ")}

      `.toLowerCase();

    const searchMatch = searchableText.includes(searchText);

    const tagMatch = activeTags.every((tag) => skin.Tags.includes(tag));

    return searchMatch && tagMatch;
  });

  displaySkins(filteredSkins);
}

// =========================
// SEARCH EVENT
// =========================

searchBar.addEventListener("input", () => {
  filterSystem();
});

// =========================
// CLOSE OVERLAY
// =========================

closeButton.addEventListener("click", () => {
  skinOverlay.style.display = "none";

  skinVideo.pause();

  skinVideo.src = "";
});

skinOverlay.addEventListener("click", (event) => {
  if (event.target === skinOverlay) {
    skinOverlay.style.display = "none";

    skinVideo.pause();

    skinVideo.src = "";
  }
});

// =========================
// INITIAL LOAD
// =========================

displaySkins(skins);
