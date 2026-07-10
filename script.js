// =========================
// VARIABLES
// =========================

let showTags = false;

let chapterFilterMode = "exact";

const chapterFilterModeSelect = document.getElementById("ChapterFilterMode");

let selectedChapter = null;
let selectedSeason = null;

let aiSearchMode = false;

const aiSearchButton = document.getElementById("AISearchButton");
const aiSearchPanel = document.getElementById("AISearchPanel");
const aiSearchResults = document.getElementById("AISearchResults");

aiSearchButton.addEventListener("click", () => {
  aiSearchMode = !aiSearchMode;

  if (aiSearchMode) {
    aiSearchButton.textContent = "AI Search: ON";

    aiSearchButton.classList.add("Active");

    aiSearchPanel.classList.add("Active");

    aiSearchPanel.querySelector(".AISearchTitle").textContent =
      "AI Search Enabled";

    aiSearchResults.textContent = "Describe a skin using natural language.";

    searchBar.placeholder = "Describe a skin...";
  } else {
    aiSearchButton.textContent = "AI Search: OFF";

    aiSearchButton.classList.remove("Active");

    aiSearchPanel.classList.remove("Active");

    aiSearchPanel.querySelector(".AISearchTitle").textContent =
      "AI Search Disabled";

    aiSearchResults.textContent = "Searches skin names only.";

    searchBar.placeholder = "Search skin names...";
  }

  filterSystem();
});


const tagToggle = document.getElementById("TagToggle");

const skinHub = document.getElementById("SkinHub");

const searchBar = document.getElementById("SearchBar");

const tagList = document.getElementById("TagList");

const skinOverlay = document.getElementById("SkinOverlay");

const overlaySkinName = document.getElementById("OverlaySkinName");

const skinVideo = document.getElementById("SkinVideo");

const closeButton = document.getElementById("CloseButton");

const timelineList = document.getElementById("TimelineList");

let activeTags = [];




tagToggle.addEventListener("change", () => {

    showTags = tagToggle.checked;

    filterSystem();

});

chapterFilterModeSelect.addEventListener("change", () => {
  chapterFilterMode = chapterFilterModeSelect.value;

  filterSystem();
});


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
    "Visor Glasses",
  ],

  Piercings: [
    "Nose Ring",
    "Plug[Earrings]",
    "Hoop[Earrings]",
    "Drop[Earrings]",
  ],

  Age: ["Middle Aged", "Old", "Young",],

  "Art Style": ["Anime", "Cartoon", "Cell shaded", "Non Cell Shaded",],
  
  Armor: [
    "Arm Bracers",
    "Armored Vest",
    "Chest plate",
    "Cuisses(Thigh Armor)",
    "Knee Pads",
    "Rerebrace(Upper Arm)",
    "Shin Guards",
    "Shoulder Pads",
    "Elbow Pads",
  ],

  Belt: ["Military Belt", "Tactical Belt", "Obi",],

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
    "Assassin",
    "Civilian",
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

  "Facial Hair": ["Beard", "Goatee", "Mustache", "Clean-Shaven",],

  "Full-Body Garments": [
    "Jumpsuit",
    "Romper",
    "Unitard",
    "Leotard",
    "Morph Suit",
    "Wet Suit",
    "Hazmat Suit",
    "Flight Suit",
  ],

  "Outfit Style": [
    "Armored",
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
    "High Military Boots",
    "Sandals",
    "Sneakers",
    "Socks",
    "Strapped Boots"
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
    "Bell Bottoms",
    "Booty Shorts",
    "Cargo Pants",
    "Cuffed Pants",
    "Formal Pants",
    "Jeans",
    "Joggers",
    "Pajamas",
    "Short Jeans",
    "Shorts",
    "Skirts",
    "Short Skirts",
    "Skin Tight Pants",
    "Long Skirts",
    "Sweat Pants",
    "Track Pants",
    "Underwear",
  ],

  Region: ["African", "Asian", "Middle Eastern", "Norwegian", "European", "South American"],

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
    "Light 👍🏻👊🏻",
    "Medium Light 👍🏼👊🏼",
    "Medium 👍🏽👊🏽",
    "Medium Dark 👍🏾👊🏾",
    "Dark 👍🏿👊🏿",
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
    "Muscle Cuirass",
    "Puffy Jacket",
    "Scrunch Sleeve Jacket",
    "Shirtless",
    "Short Sleeve",
    "Skin Tight Chest",
    "Sleeveless",
    "Sleeveless Jacket",
    "Sleeveless Dress Shirt",
    "Suspenders",
    "Sweater",
    "Tank Top",
    "Tracksuit Jacket",
    "T-Shirt",
    "Toga",
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

const allTags = Object.values(tagCategories)
  .flat()
  .sort((a, b) => b.length - a.length);



function parseSearchQuery(searchText) {
  const query = searchText.toLowerCase().trim();

  // =========================
  // NORMAL SEARCH
  // =========================

  if (!aiSearchMode) {
    return {
      extractedTags: [],
      nameWords: query.split(/\s+/).filter(Boolean),
    };
  }

  // =========================
  // AI SEARCH
  // =========================

  let remainingText = query;

  const extractedTags = [];

  // Find tags first

  allTags.forEach((tag) => {
    const lowerTag = tag.toLowerCase();

    const regex = new RegExp(`\\b${lowerTag}\\b`, "i");

    if (regex.test(remainingText)) {

      extractedTags.push(tag);

      remainingText = remainingText.replace(regex, " ");
    }
  });

  // Remaining words

  const leftoverWords = remainingText.split(/\s+/).filter(Boolean);

  const nameWords = [];

  // Check every possible word combination
  for (let start = 0; start < leftoverWords.length; start++) {
    for (let end = leftoverWords.length; end > start; end--) {
      const phrase = leftoverWords.slice(start, end).join(" ");

      const possibleSkin = skins.find(
        (skin) => skin.Identity.skin_name.toLowerCase() === phrase,
      );

      if (possibleSkin) {
        nameWords.push(phrase);

        // Remove used words
        for (let i = start; i < end; i++) {
          leftoverWords[i] = "";
        }

        break;
      }
    }
  }

  // Remove blanks
  const cleanedNameWords = nameWords.filter(Boolean);

  return {
    extractedTags,
    nameWords: cleanedNameWords,
  };
}

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


  const timeline = {
    1: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],

    2: [1, 2, 3, 4, 5, 6, 7, 8],

    3: [1, 2, 3, 4],

    4: [1, 2, 3, 4,"OG"],

    5: [1, 2, 3, 4, ],

    6: [1, 2, "Galactic Battle", 3, 4, "The Simpsons"],

    7: [1,2,3],

    "OG": [1, 2, 3, 4 ,5, 6 , 7 ,8, 9],

    "Remix": []



  };
function createTimeline() {
  timelineList.innerHTML = "";

  const chapterNames = {
    OG: "Fortnite OG",
    Remix: "Chapter 2 Remix",
  };

  Object.entries(timeline).forEach(([chapter, seasons]) => {
    const category = document.createElement("div");
    category.classList.add("TimelineCategory");

    const header = document.createElement("div");
    header.classList.add("TimelineHeader");
    const chapterName = chapterNames[chapter] ?? `Chapter ${chapter}`;

    header.textContent = `▶ ${chapterName}`;

    header.dataset.chapter = chapter;

    const seasonContainer = document.createElement("div");
    seasonContainer.classList.add("TimelineSeasons");

    header.addEventListener("click", () => {
      category.classList.toggle("Open");

      header.textContent = category.classList.contains("Open")
        ? `▼ ${chapterName}`
        : `▶ ${chapterName}`;

      const chapterValue = isNaN(chapter) ? chapter : Number(chapter);

      if (selectedChapter === chapterValue) {
        selectedChapter = null;
        selectedSeason = null;
      } else {
        selectedChapter = chapterValue;
        selectedSeason = null;
      }

      updateTimelineSelection();
      filterSystem();
    });

    seasons.forEach((season) => {
      const button = document.createElement("div");

      button.classList.add("SeasonButton");

      button.textContent = `Season ${season}`;

      button.addEventListener("click", (e) => {
        // Don't trigger the chapter click
        e.stopPropagation();

        const chapterValue = isNaN(chapter) ? chapter : Number(chapter);

        // Clicking the same season deselects it
        if (selectedChapter === chapterValue && selectedSeason === season) {
          selectedSeason = null;
        } else {
          selectedChapter = chapterValue;
          selectedSeason = season;
        }

        updateTimelineSelection();
        filterSystem();
      });

      seasonContainer.appendChild(button);
    });

    category.appendChild(header);
    category.appendChild(seasonContainer);

    timelineList.appendChild(category);
  });
}

function updateTimelineSelection() {
  document.querySelectorAll(".TimelineHeader").forEach((header) => {
    header.classList.remove("Active");
  });

  document.querySelectorAll(".SeasonButton").forEach((button) => {
    button.classList.remove("Active");
  });

  document.querySelectorAll(".TimelineCategory").forEach((category) => {
    const header = category.querySelector(".TimelineHeader");

    const chapter = header.dataset.chapter;

    const chapterValue = isNaN(chapter) ? chapter : Number(chapter);

    if (chapterValue === selectedChapter) {
      header.classList.add("Active");

      if (selectedSeason !== null) {
        category.querySelectorAll(".SeasonButton").forEach((button) => {
          const season = Number(button.textContent.replace("Season ", ""));

          if (season === selectedSeason) {
            button.classList.add("Active");
          }
        });
      }
    }
  });
}

// =========================
// OPEN OVERLAY
// =========================

function openSkinOverlay(skin) {
  skinOverlay.style.display = "flex";

  overlaySkinName.textContent = skin.Identity.skin_name;

  const videoURL =
    skin.video ??
    `https://fnggcdn.com/items/${skin.id}/video.mp4?2`;

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
    const imageURL = skin.isEditStyle
    ? skin.icon
    : `./Images/Skins/${skin.id}.jpg`;

    const tagHTML = showTags
    ? skin.Tags.map(tag => `
        <span class="CardTag">
            ${tag}
        </span>
    `).join("")
    : "";

    skinHub.innerHTML += `

      <div
        class="SkinCard"
        onclick="openSkinOverlay(skins[${skins.indexOf(skin)}])"
      >

        <h3 class="SkinName">
          ${skin.Identity.skin_name}
        </h3>

        <img src="${imageURL}" />

        ${showTags ? `
        <div class="CardTags">
            ${tagHTML}
        </div>
        ` : ""}

      </div>

    `;
  });
}



// =========================
// FILTER SYSTEM
// =========================

function filterSystem() {
  const searchText = searchBar.value.trim();

  const parsedSearch = parseSearchQuery(searchText);

  console.log(parsedSearch);

  const filteredSkins = skins.filter((skin) => {
    const searchableName = [
      skin.Identity.skin_name,

      ...(skin.SearchableTerms || []),
    ]
      .join(" ")
      .toLowerCase();

    const nameMatch =
      parsedSearch.nameWords.length === 0 ||
      parsedSearch.nameWords.every((word) => searchableName.includes(word));


     

    const manualTagsMatch = activeTags.every((tag) => skin.Tags.includes(tag));

    const searchTagsMatch = parsedSearch.extractedTags.every((tag) =>
      skin.Tags.includes(tag),
    );

    const tagMatch = manualTagsMatch && searchTagsMatch;

    let chapterMatch = true;

    if (selectedChapter !== null) {
      if (chapterFilterMode === "exact") {
        chapterMatch = skin.Chapter === selectedChapter;
      } else if (chapterFilterMode === "above") {
        chapterMatch = skin.Chapter >= selectedChapter;
      } else if (chapterFilterMode === "below") {
        chapterMatch = skin.Chapter <= selectedChapter;
      }
    }
    const seasonMatch =
      selectedSeason === null || skin.Season === selectedSeason;

    return nameMatch && tagMatch && chapterMatch && seasonMatch;
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
createTimeline();
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
  if (music.paused) {
    music.play();

    musicButton.textContent = "🔊";
  } else {
    music.pause();

    musicButton.textContent = "🔇";
  }
});
