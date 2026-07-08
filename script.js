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
    "Armband",
    "Ammo Pouch",
    "Bow Tie",
    "Bracelet",
    "Bullet Belt",
    "Chain",
    "Choker",
    "Claws",
    "Harness",
    "Holster",
    "Necklace",
    "Nails",
    "Pouches",
    "Sash",
    "Shoulder Bag",
    "Ring",
    "Scarf",
    "Watch",
  ],



  Facewear: [
  "Eyepatch",
  "Face Mask",
  "Gas Mask",
  "Glasses",
  "Goggles",
  "Respirator",
  "Visor",
  "Visor Glasses"
],

  Piercings: [
    "Nose Ring",
    "Plug[Earrings]",
    "Hoop[Earrings]",
    "Drop[Earrings]"

  ],

  Age: ["Middle Aged", "Old", "Young"],

  "Art Style": ["Anime", "Cartoon", "Cell shaded"],
  Armor: [
    "Arm Bracers",
    "Armored Vest",
    "Chestplate",
    "Cuisses(Thigh Armor)",
    "Knee Pads",
    "Shin Guards",
    "Shoulder Pads",
    "Elbow Pads",
  ],

  Belt: ["Military Belt", "Tactical Belt", "Obi"],

  Species: [
    "Alien",
    "Animal",
    "Human",
    "Robot",
    "Cyborg",
    "Cybernetic",
    "Undead",
    "Unique",
],

 "Body Type": [
  "Slim",
  "Slim Muscular",
  "Average",
  "Muscular",
  "Heavy Muscular",
  "Large",
  "Brute",
],

  "Character Archetype": [
    "Agent",
    "Assassin",
    "Hunter",
    "Knight",
    "Mercenary",
    "Ninja",
    "Peely",
    "Pilot",
    "Samurai",
    "Scientist",
    "Soldier",
    "Superhero",
    "Villain",
],

  "Facial Hair": ["Beard", "Goatee", "Mustache", "None"],

  "Outfit Style": [
    "Armor",
    "Athletic",
    "Casual",
    "Formal",
    "Luxury",
    "Medieval",
    "Poor",
    "Spandex",
    "Streetwear",
    "Suit",
],

  Footwear: [
    "Armored Boots",
    "Barefoot",
    "Casual Shoes",
    "Clean Boots",
    "Cleats",
    "Formal Shoes",
    "High Heels",
    "Military Boots",
    "Sandals",
    "Socks",
  ],

  Sex: ["Female", "Male", "Unisex"],

  Gloves: [
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
    "Cornrows",
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
    "Wavy Hair",
  ],

  Headwear: [
    "Bandana",
    "Beanie",
    "Beret",
    "Cap",
    "Cowboy Hat",
    "Crown",
    "Durag",
    "Glasses[Off]",
    "Goggles[Off]",
    "Halo",
    "Hat",
    "Headphones",
    "Headband",
    "Helmet",
    "Hood",
    "Mask",
    "Tiara",
    "Visor[Off]",
    "Visor Glasses[Off]",
  ],

  Legwear: [
    "Booty Shorts",
    "Cargo Pants",
    "Cuff Jeans",
    "Formal Pants",
    "Jeans",
    "Joggers",
    "Pajamas",
    "Short Jeans",
    "Shorts",
    "Skirts",
    "Short Skirts",
    "Long Skirts",
    "Sweat Pants",
    "Underwear",
  ],

  Region: ["African", "Asian", "Middle Eastern", "Norwegian", "European"],

  Series: [
    "Anime",
    "DC",
    "Gaming Legends Series",
    "Icon Series",
    "Marvel",
    "Star Wars",
    "TMNT",
  ],

  "Skin Tone": [
    "Light 🧑🏻‍🦲",
    "Medium Light 🧑🏼‍🦲",
    "Medium 🧑🏽‍🦲",
    "Medium Dark 🧑🏾‍🦲",
    "Dark 🧑🏿‍🦲",
  ],

  Themes: [
    "Apocalyptic",
    "Cyberpunk",
    "Fantasy",
    "Futuristic",
    "Horror",
    "Medieval",
    "Military",
    "Modern",
    "Post-Apocalyptic",
    "Royalty",
    "School",
    "Space",
    "Steampunk",
    "Tactical",
],

  Tops: [
    "Blazer",
    "Corset",
    "Crop Top",
    "Cropped Jacket",
    "Dress Shirt",
    "Hoodie",
    "Jacket",
    "Long Sleeve",
    "Puffy Jacket",
    "Scrunch Sleeve Jacket",
    "Shirtless",
    "Short Sleeve",
    "Sleeveless",
    "Sleeveless Jacket",
    "Sleeveless Dress Shirt",
    "Suspenders",
    "Sweater",
    "Tank Top",
    "Tracksuit Jacket",
    "T-Shirt",
    "Turtleneck",
    "U-Neck",
    "V-Neck",
  ],

  Weapons: [
    "Bow",
    "Firearm",
    "Grenades",
    "Hammer",
    "Katana",
    "Knife",
    "Pickaxe",
    "Pistol",
    "Rifle",
    "Shotgun",
    "Sword",
  ],
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


const enterButton = document.getElementById("EnterButton");
const startScreen = document.getElementById("StartScreen");
const music = document.getElementById("BackgroundMusic");

function enterWebsite() {

    music.volume = 0.35;

    music.play();

    startScreen.classList.add("Hidden");

    setTimeout(() => {

        startScreen.style.display = "none";

    }, 800);

}

enterButton.addEventListener("click", enterWebsite);

document.addEventListener("keydown", (e) => {

    if (e.key === "Enter" && startScreen.style.display !== "none") {

        enterWebsite();

    }

});

const musicButton = document.getElementById("MusicButton");

musicButton.addEventListener("click", () => {

    if (music.paused){

        music.play();

        musicButton.textContent = "🔊";

    } else {

        music.pause();

        musicButton.textContent = "🔇";

    }

});