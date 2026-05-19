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

  Accessories: [
    "Bracelet",
    "Earrings",
    "Glasses",
    "Goggles",
    "Necklace",
    "Nails",
    "Nose Ring",
    "Piercings",
    "Ring",
    "Scarf",
    "Visor Glasses",
    "Watch"
  ],

  Age: [
    "Middle Aged",
    "Old",
    "Young"
  ],

  "Art Style": [
    "Anime",
    "Cartoon",
    "Cell shaded"
  ],
  "Armor": [
    "Arm Bracers",
    "Armored Vest",
    "Chestplate",
    "Cuisses(Thigh Armor)",
    "Knee Pads",
    "Shin Guards",
    "Shoulder Pads",
    "Elbow Pads",
  ],

  Belt: [
    "Military Belt",
    "Tactical Belt",
    "Obi"
  ],

  Body: [
    "Alien",
    "Animal",
    "Brute",
    "Cybernetic",
    "Cyborg",
    "Heavy Muscular",
    "Muscular",
    "Robot",
    "Slim",
    "Spry Muscular"
  ],

  "Character Type": [
    "Agent",
    "Animal",
    "Ninja",
    "Peely",
    "Pilot",
    "Samurai",
    "Superhero",
    "Soldier"
  ],

  "Facial Hair": [
    "Beard",
    "Goatee",
    "Mustache"
  ],

  "Fashion/Outfit": [
    "Armor",
    "Casual",
    "Luxury",
    "Medieval",
    "Poor",
    "Spandex",
    "Streetwear",
    "Suit",
  ],

  "Footwear": [
    "Armored Boots",
    "Barefoot",
    "Casual Shoes",
    "Clean Boots",
    "Cleats",
    "Formal Shoes",
    "High Heels",
    "Military Boots",
    "Sandals",
    "Socks"
  ],

  Gender: [
    "Female",
    "Male",
    "Unisex"
  ],

  "Gloves": [
  "Armored Gloves",
  "Boxing Gloves",
  "Clawed Gloves",
  "Clean Gloves",
  "Fingerless Gloves",
  "Leather Gloves",
  "Mechanical Gloves",
  "Gloveless",
  "Rubber Gloves",
  "Tactical Gloves",
  "Winter Gloves",
],


  Hair: [
    "Afro",
    "Bald",
    "Bangs",
    "Braids",
    "Buzz Cut",
    "Curly Hair",
    "Dreads",
    "Fade",
    "Long Hair",
    "Messy Hair",
    "Mohawk",
    "Pig Tails",
    "Ponytail",
    "Short Hair",
    "Side Part",
    "Spiky Hair",
    "Straight Hair",
    "Unique Hairstyle",
    "Wavy Hair"
  ],

  "Headwear": [
    "Bandanna",
    "Durag",
    "Eyepatch",
    "Gas Mask",
    "Glasses",
    "Goggles",
    "Hat",
    "Headphones",
    "Helmet",
    "Hood",
    "Mask",
    "Visor",
    "Visor Glasses"
  ],

  "Legwear": [
    "Booty Shorts",
    "Cargo Pants",
    "Formal Pants",
    "Jeans",
    "Knee Pads",
    "Pajamas",
    "Short Jeans",
    "Shorts",
    "Skirts",
    "Sweat Pants",
    "Underwear"
  ],

  Region: [
    "African",
    "Asian",
    "Middle Eastern",
    "Norwegian"
  ],

  Series: [
    "Anime",
    "DC",
    "Gaming Legends Series",
    "Icon Series",
    "Marvel",
    "Star Wars",
    "TMNT"
  ],

  "Skin Tone": [
    "Dark Skin",
    "Light Skin",
    "White"
  ],

  Themes: [
    "Apocalyptic",
    "Cyberpunk",
    "Fantasy",
    "Futuristic",
    "Horror",
    "Military",
    "Normal",
    "Royalty",
    "School",
    "Space",
    "Tactical",
    "Medieval"
  ],

  "Tops": [
    "Blazer",
    "Crop Top",
    "Hoodie",
    "Jacket",
    "Shirtless",
    "Suspenders",
    "Sweater",
    "Tank Top",
    "Tracksuit Jacket",
    "T-Shirt"
  ],

  "Weapons": [
    "Knife",
    "Firearm",
    "Grenades"
  ]

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
