// =========================
// VARIABLES
// =========================
const overlaySkinName = document.getElementById("OverlaySkinName");
const overlaySource = document.getElementById("OverlaySource");
const overlayIntroduced = document.getElementById("OverlayIntroduced");
const overlayCodename = document.getElementById("OverlayCodename");
const overlayRarity = document.getElementById("OverlayRarity");
const overlayTags = document.getElementById("OverlayTags");
const skinVideo = document.getElementById("SkinVideo");
const skinOverlay = document.getElementById("SkinOverlay");
const closeButton = document.getElementById("CloseButton");

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

    aiSearchResults.innerHTML = `Describe a skin using natural language.<br><br>
    <span class="Warning">
    ⚠ Warning: Do not use when searching for multiple highly specific pieces. Instead, use the regular tags panel!
    </span>`;

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



const timelineList = document.getElementById("TimelineList");

let activeTags = [];

closeButton.addEventListener("click", () => {
  skinOverlay.style.display = "none";

  skinVideo.pause();
  skinVideo.src = "";
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && skinOverlay.style.display === "flex") {
    closeSkinOverlay();
  }
});

skinOverlay.addEventListener("click", (e) => {
  if (e.target === skinOverlay) {
    closeSkinOverlay();
  }
});




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
    "Sun Glasses",
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
    "Android",
    "Animal",
    "Human",
    "Robot",
    "Cyborg",
    "Cybernetic",
    "Monster",
    "Undead",
    "Zombie",
    "Skeleton",
    "Ghost",
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


// =========================
// SEARCH ALIASES
// =========================

const tagAliases = {
  // =========================
  // SEX / AGE
  // =========================

  guy: ["Male"],
  guys: ["Male"],
  man: ["Male"],
  men: ["Male"],
  male: ["Male"],
  boy: ["Male", "Young"],
  boys: ["Male", "Young"],
  gentleman: ["Male"],
  gentlemen: ["Male"],
  dude: ["Male"],
  dudes: ["Male"],

  girl: ["Female", "Young"],
  girls: ["Female", "Young"],
  female: ["Female"],
  woman: ["Female"],
  women: ["Female"],
  lady: ["Female"],
  ladies: ["Female"],

  kid: ["Young"],
  child: ["Young"],
  teen: ["Young"],
  teenager: ["Young"],

  adult: ["Middle Aged"],
  elderly: ["Old"],
  senior: ["Old"],

  // =========================
  // SPECIES
  // =========================

  person: ["Human"],
  human: ["Human"],

  robotic: ["Robot"],
  machine: ["Robot"],

  beast: ["Animal"],

  extraterrestrial: ["Alien"],

  // =========================
  // BODY TYPE
  // =========================

  skinny: ["Slim"],
  thin: ["Slim"],

  buff: ["Muscular"],
  ripped: ["Muscular"],
  strong: ["Muscular"],

  huge: ["Large"],
  massive: ["Large"],
  giant: ["Large"],
  big: ["Large"],
  bulky: ["Large"],

  // =========================
  // THEMES
  // =========================

  future: ["Futuristic"],

  "high tech": ["Futuristic"],

  magic: ["Fantasy"],
  wizard: ["Fantasy"],

  scary: ["Horror"],
  creepy: ["Horror"],
  spooky: ["Horror"],

  combat: ["Military"],
  war: ["Military"],

  wasteland: ["Post-Apocalyptic"],

  // =========================
  // OUTFIT STYLE
  // =========================

  armor: ["Armored"],
  armour: ["Armored"],

  sporty: ["Athletic"],

  business: ["Formal"],

  dressy: ["Formal"],

  fancy: ["Luxury"],
  wealthy: ["Luzury"],

  knightly: ["Medieval"],

  homeless: ["Poor"],
  ragged: ["Poor"],

  latex: ["Spandex"],

  urban: ["Streetwear"],

  "business suit": ["Suit"],

  // =========================
  // CHARACTER TYPES
  // =========================

  killer: ["Assassin"],
  hitman: ["Assassin"],

  citizen: ["Civilian"],

  tracker: ["Hunter"],

  "bounty hunter": ["Mercenary"],

  shinobi: ["Ninja"],

  banana: ["Peely"],

  aviator: ["Pilot"],

  researcher: ["Scientist"],

  trooper: ["Soldier"],
  soldier: ["Soldier", "Military"],

  hero: ["Superhero"],

  "bad guy": ["Villain"],
  evil: ["Villain"],

  // =========================
  // FACIAL HAIR
  // =========================

  "clean shave": ["Clean-Shaven"],
  "clean shaven": ["Clean-Shaven"],

  mustache: ["Mustache"],
  moustache: ["Mustache"],

  // =========================
  // HEADWEAR
  // =========================

  hooded: ["Hood"],

  headset: ["Headphones"],

  mask: ["Mask"],
  "face covering": ["Mask"],

  // =========================
  // FACEWEAR
  // =========================
  shades: ["Sun Glasses"],
  // =========================
  // ACCESSORIES
  // =========================
  "bullet strap": ["Bullet Belt"],
  // =========================
  // GLOVES
  // =========================
  // =========================
  // FOOTWEAR
  // =========================
  "combat boots": ["Military Boots"],
  "army boots": ["Military Boots"],
  "tactical boots": ["Military Boots"],

  heels: ["High Heels"],

  "running shoes": ["Sneakers"],

  "bare feet": ["Barefoot"],

  "flip flops": ["Sandals"],

  // =========================
  // HAIR
  // =========================

  dreadlocks: ["Dreads"],

  // =========================
  // SERIES
  // =========================

  // =========================
  // SKIN TONE
  // =========================

  Black: ["Dark 👍🏿👊🏿", "Medium Dark 👍🏾👊🏾"],
  Brown: ["Medium Dark 👍🏾👊🏾"],
  White: ["Light 👍🏻👊🏻", "Medium Light 👍🏼👊🏼"],
  Mixed: ["Medium 👍🏽👊🏽"],

  // =========================
  // WEAPONS
  // =========================

  gun: ["Firearm"],
  guns: ["Firearm"],

  blade: ["Sword"],
  katana: ["Katana", "Sword"],
};

// =========================
// FIND TAG
// =========================

function findTag(word) {

  const lowerWord = word.toLowerCase().trim();

  // -------------------------
  // Exact Match
  // -------------------------

  let tag = allTags.find(
    t => t.toLowerCase() === lowerWord
  );

  if (tag) return tag;


  // -------------------------
  // Alias Match
  // -------------------------

  if (tagAliases[lowerWord]) {
    return tagAliases[lowerWord];
  }


  // -------------------------
  // Plural: ies → y
  // -------------------------

  if (lowerWord.endsWith("ies")) {

    tag = allTags.find(
      t =>
        t.toLowerCase() ===
        lowerWord.slice(0, -3) + "y"
    );

    if (tag) return tag;

  }


  // -------------------------
  // Plural: es
  // -------------------------

  if (lowerWord.endsWith("es")) {

    tag = allTags.find(
      t =>
        t.toLowerCase() ===
        lowerWord.slice(0, -2)
    );

    if (tag) return tag;

  }


  // -------------------------
  // Plural: s
  // -------------------------

  if (lowerWord.endsWith("s")) {

    tag = allTags.find(
      t =>
        t.toLowerCase() ===
        lowerWord.slice(0, -1)
    );

    if (tag) return tag;

  }


  return null;

}

const allTags = Object.values(tagCategories)
  .flat()
  .sort((a, b) => b.length - a.length);



function parseSearchQuery(searchText) {
  const query = searchText.toLowerCase().trim();

  let processedQuery = query;

  Object.entries(tagAliases).forEach(([alias, tags]) => {
    const regex = new RegExp(`\\b${alias}\\b`, "gi");

    if (regex.test(processedQuery)) {
      processedQuery = processedQuery.replace(regex, tags.join(" "));
    }
  });
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

  let remainingText = processedQuery;

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

  // Check remaining words for singular/plural tags

  for (let i = 0; i < leftoverWords.length; i++) {
    const detectedTags = findTag(leftoverWords[i]);

    if (detectedTags) {
      const tags = Array.isArray(detectedTags) ? detectedTags : [detectedTags];

      tags.forEach((tag) => {
        if (!extractedTags.includes(tag)) {
          extractedTags.push(tag);
        }
      });

      leftoverWords[i] = "";
    }
  }

  const nameWords = [];

  // Remove words that became tags
  const remainingWords = leftoverWords.filter(Boolean);

  // Check every possible word combination
  for (let start = 0; start < remainingWords.length; start++) {
    for (let end = remainingWords.length; end > start; end--) {
      const phrase = remainingWords.slice(start, end).join(" ");

      const possibleSkin = skins.find(
        (skin) => skin.Identity.skin_name.toLowerCase() === phrase,
      );

      if (possibleSkin) {
        nameWords.push(phrase);

        // Remove used words
        for (let i = start; i < end; i++) {
          remainingWords[i] = "";
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

  overlaySource.textContent = skin.Source || "Unknown";

  overlayIntroduced.textContent = `Chapter ${skin.Chapter} Season ${skin.Season}`;

  overlayRarity.textContent = skin.Rarity || skin.rarity || "Unknown";

  overlayCodename.textContent = skin.Codename || skin.codename || "Unknown";


  overlayTags.innerHTML = "";

  skin.Tags.forEach((tag) => {
    const div = document.createElement("div");

    div.className = "OverlayTag";

    div.textContent = tag;

    overlayTags.appendChild(div);
  });

  skinVideo.src =
    skin.video ?? `https://fnggcdn.com/items/${skin.id}/video.mp4?2`;

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
