// =========================
// FORTNITE API DATA
// =========================
const FORTNITE_API_URL = "https://fortnite-api.com/v2/cosmetics/br?language=en";
const fortSearchMetadata = window.skinMetadata || [];


// ============================================================
// FORTNITE.GG ID -> FORTNITE API ID CROSS-REFERENCE
// ============================================================

let metadataByApiId = new Map();
let fortniteGgIdByApiId = new Map();

function parseCSV(csvText) {
  const rows = [];
  let row = [];
  let value = "";
  let insideQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const next = csvText[i + 1];

    if (char === '"' && insideQuotes && next === '"') {
      value += '"';
      i++;
    } else if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === "," && !insideQuotes) {
      row.push(value.trim());
      value = "";
    } else if ((char === "\n" || char === "\r") && !insideQuotes) {
      if (char === "\r" && next === "\n") i++;

      row.push(value.trim());

      if (row.some(cell => cell !== "")) {
        rows.push(row);
      }

      row = [];
      value = "";
    } else {
      value += char;
    }
  }

  row.push(value.trim());

  if (row.some(cell => cell !== "")) {
    rows.push(row);
  }

  return rows;
}


async function loadFortniteIdCrossReference() {
  try {
    console.log("Loading Fortnite.GG ID cross-reference...");

    const response = await fetch("fortnite-outfit-id-map.csv");

    if (!response.ok) {
      throw new Error(`CSV request failed: ${response.status}`);
    }

    const csvText = await response.text();
    const rows = parseCSV(csvText);

    if (rows.length < 2) {
      throw new Error("The cross-reference CSV is empty.");
    }

    const headers = rows[0].map(header =>
      header.trim().toLowerCase()
    );

    const apiIdIndex = headers.indexOf("fortnite api id");
    const ggIdIndex = headers.indexOf("fortnite.gg id");
    const typeIndex = headers.indexOf("type");

    if ([apiIdIndex, ggIdIndex, typeIndex].includes(-1)) {
      throw new Error("One or more required CSV columns are missing.");
    }

    // Index manually curated data.js entries by Fortnite.GG ID.
    const metadataByGgId = new Map();

    for (const metadata of fortSearchMetadata) {
      if (metadata.isEditStyle) continue;

      const ggId = String(
        metadata.fortniteGgId ?? metadata.id ?? ""
      ).trim();

      if (!/^\d+$/.test(ggId)) continue;

      if (!metadataByGgId.has(ggId)) {
        metadataByGgId.set(ggId, metadata);
      }
    }

    // Separate maps:
    // 1. Every CSV outfit gets an API ID -> GG ID mapping.
    // 2. Only manually curated outfits get metadata mappings.
    const newGgIdByApiId = new Map();
    const newMetadataByApiId = new Map();

    const ambiguousIds = new Set();

    let outfitRows = 0;
    let mappedRows = 0;
    let curatedMatches = 0;
    let unmatchedRows = 0;

    for (const row of rows.slice(1)) {
      const type = row[typeIndex]?.trim().toLowerCase();

      if (type !== "outfit") continue;

      outfitRows++;

      const apiId = row[apiIdIndex]?.trim();
      const ggId = row[ggIdIndex]?.trim();

      if (!apiId || !/^\d+$/.test(ggId || "")) {
        unmatchedRows++;
        continue;
      }

      // Map every valid outfit, even if it isn't in data.js.
      if (newGgIdByApiId.has(apiId)) {
        const existingGgId = newGgIdByApiId.get(apiId);

        if (existingGgId !== ggId) {
          newGgIdByApiId.delete(apiId);
          ambiguousIds.add(apiId);
          console.warn("Ambiguous Fortnite API ID:", apiId);
        }
      } else if (!ambiguousIds.has(apiId)) {
        newGgIdByApiId.set(apiId, ggId);
      }

      // Preserve curated metadata when a data.js entry exists.
      const metadata = metadataByGgId.get(ggId);

      if (metadata) {
        metadata.fortniteGgId =
          metadata.fortniteGgId ?? metadata.id;

        if (!newMetadataByApiId.has(apiId)) {
          newMetadataByApiId.set(apiId, metadata);
        }

        curatedMatches++;
      } else {
        unmatchedRows++;
      }
    }

    // Remove ambiguous API IDs from both maps.
    for (const apiId of ambiguousIds) {
      newGgIdByApiId.delete(apiId);
      newMetadataByApiId.delete(apiId);
    }

    // Activate the new maps.
    fortniteGgIdByApiId = newGgIdByApiId;
    metadataByApiId = newMetadataByApiId;

    console.log("Fortnite.GG cross-reference loaded!");
    console.log("CSV outfit rows:", outfitRows);
    console.log("Total API -> GG ID mappings:", fortniteGgIdByApiId.size);
    console.log("Curated data.js matches:", curatedMatches);
    console.log("Rows without curated metadata:", unmatchedRows);
    console.log("Ambiguous API IDs:", ambiguousIds.size);

    console.log(
      "First 10 API -> GG mappings:",
      [...fortniteGgIdByApiId.entries()].slice(0, 10)
    );

  } catch (error) {
    console.error("Failed to load Fortnite.GG cross-reference:", error);

    metadataByApiId = new Map();
    fortniteGgIdByApiId = new Map();
  }
}





let skins = [];
let cosmeticsLoaded = false;


function normalizeCosmeticName(value) {
  return String(value || "").toLowerCase().replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, " ").trim();
}

// Removes Fortnite codename prefixes for display.
function formatCodename(codename) {
  if (!codename) return "Unknown";

  return String(codename).replace(/^(Character_|F_|M_)/i, "");
}


function getIntroductionPart(value) {
  if (value === undefined || value === null || value === "") return null;
  const text = String(value);
  const match = text.match(/(\d+)/);
  if (match) return Number(match[1]);
  if (/og/i.test(text)) return "OG";
  if (/remix/i.test(text)) return "Remix";
  return text;
}

function mergeApiCosmetic(apiCosmetic) {
  const apiName = apiCosmetic.name || "Unknown Outfit";
  const metadata = metadataByApiId.get(apiCosmetic.id) || null;
  const intro = apiCosmetic.introduction || {};

  // Preserve the original Fortnite.GG ID in curated metadata.
  if (metadata) {
    metadata.fortniteGgId =
      metadata.fortniteGgId ?? metadata.id ?? null;

    metadata.id = apiCosmetic.id;
  }

  // Get the Fortnite.GG ID from the complete cross-reference.
  const fortniteGgId =
    metadata?.fortniteGgId ??
    fortniteGgIdByApiId.get(apiCosmetic.id) ??
    null;

  // Generate the video URL automatically.
  const generatedVideoUrl = fortniteGgId
    ? `https://fnggcdn.com/items/${fortniteGgId}/video.mp4?2`
    : null;

  return {
    id: apiCosmetic.id,
    fortniteGgId,

    isEditStyle: false,
    entryKey: apiCosmetic.id,

    Identity: {
      skin_name: apiName
    },

    Rarity:
      apiCosmetic.displayRarity ||
      apiCosmetic.rarity?.displayValue ||
      metadata?.Rarity ||
      "Unknown",

    Chapter:
      getIntroductionPart(intro.chapter) ??
      metadata?.Chapter ??
      null,

    Season:
      getIntroductionPart(intro.season) ??
      metadata?.Season ??
      null,

    Source: metadata?.Source || "Unknown",

    Codename: metadata?.Codename || apiCosmetic.id || "Unknown",

    Tags: metadata?.Tags || [],

    SearchableTerms: metadata?.SearchableTerms || [],

    icon:
      apiCosmetic.images?.icon ||
      apiCosmetic.images?.smallIcon ||
      "",

    // Manually assigned video takes priority.
    // Otherwise, automatically generate the Fortnite.GG URL.
    video: metadata?.video || generatedVideoUrl,

    API: apiCosmetic
  };
}

// Fortnite-API represents an outfit's styles as variants of the parent outfit,
// not as separate cosmetic records. FortSearch creates separate searchable cards
// for manually curated edit styles while retaining the parent's API ID/data.


function buildEditStyleEntries(baseSkins, useFortniteGgIcons = false) {
  return fortSearchMetadata
    .filter(metadata => metadata.isEditStyle)
    .map(metadata => {
      // Find the parent using the original Fortnite.GG ID.
      const metadataParentId = String(
        metadata.fortniteGgId ?? metadata.id ?? ""
      );

      const parentMetadata = fortSearchMetadata.find(item =>
        !item.isEditStyle &&
        String(item.fortniteGgId ?? item.id ?? "") === metadataParentId
      );

      if (!parentMetadata) {
        console.warn("Edit style parent metadata not found:", metadata);
        return null;
      }

      // Find the corresponding API outfit using its metadata object.
      const parent = baseSkins.find(skin =>
        skin.fortniteGgId === metadataParentId
      );

      if (!parent) {
        console.warn("Edit style API parent not found:", {
          style: metadata.Identity?.skin_name,
          fortniteGgId: metadataParentId
        });
        return null;
      }

      const styleFortniteGgId = metadata.fortniteGgId ?? metadata.id;

      return {
        ...parent,
        id: parent.id,
        entryKey: `${parent.id}::style::${normalizeCosmeticName(metadata.Identity?.skin_name)}`,
        fortniteGgId: styleFortniteGgId,
        isEditStyle: true,

        Identity: {
          skin_name: metadata.Identity?.skin_name || `${parent.Identity.skin_name} [Style]`
        },

        Tags: metadata.Tags || [],
        SearchableTerms: metadata.SearchableTerms || [],

        icon: useFortniteGgIcons
          ? (metadata.icon || (styleFortniteGgId
              ? `Images/Skins/${styleFortniteGgId}.jpg`
              : parent.icon))
          : (metadata.icon || parent.icon),

        video: metadata.video || (styleFortniteGgId
          ? `https://fnggcdn.com/items/${styleFortniteGgId}/video.mp4?2`
          : parent.video),

        API: parent.API,
        Chapter: metadata.Chapter ?? parent.Chapter,
        Season: metadata.Season ?? parent.Season,
        Rarity: metadata.Rarity || parent.Rarity,
        Source: metadata.Source || parent.Source,
        Codename: metadata.Codename || parent.Codename
      };
    })
    .filter(Boolean);
}



// Build a small offline database from the manually curated entries in data.js.
// This is intentionally limited to the outfits/styles that have been added there.
function buildLocalMetadataDatabase() {
  const baseSkins = fortSearchMetadata
    .filter(item => !item.isEditStyle)
    .map(item => ({
      ...item,
      id: item.id || `local-${normalizeCosmeticName(item.Identity?.skin_name).replace(/\s+/g, "-")}`,
      entryKey: `local-${normalizeCosmeticName(item.Identity?.skin_name)}`,
      fortniteGgId: item.fortniteGgId ?? item.id ?? null,
      isEditStyle: false,
      Identity: { skin_name: item.Identity?.skin_name || "Unknown Outfit" },
      Tags: item.Tags || [],
      SearchableTerms: item.SearchableTerms || [],
      icon: item.icon || ((item.fortniteGgId ?? item.id)
        ? `Images/Skins/${item.fortniteGgId ?? item.id}.jpg`
        : ""),
      video: item.video || (
  (item.fortniteGgId ?? item.id)
    ? `https://fnggcdn.com/items/${item.fortniteGgId ?? item.id}/video.mp4?2`
    : null
),
      API: null
    }));

  return [...baseSkins, ...buildEditStyleEntries(baseSkins, true)];
}

async function loadFortniteCosmetics() {
  const loadingMessage = document.getElementById("LoadingMessage");
  const loadingPanel = document.getElementById("LoadingPanel");
  const enterButton = document.getElementById("EnterButton");

  if (loadingPanel) loadingPanel.style.display = "block";
  if (loadingMessage) loadingMessage.textContent = "Downloading Fortnite cosmetic database...";

  try {
     // Load the Fortnite.GG ID → Fortnite API ID mappings first.
    await loadFortniteIdCrossReference();

    const response = await fetch(FORTNITE_API_URL);
    if (!response.ok) throw new Error(`Fortnite API returned HTTP ${response.status}`);

    const payload = await response.json();
    if (!Array.isArray(payload.data)) throw new Error("Unexpected Fortnite API response.");

    // FortSearch is a skin finder: load Battle Royale outfits only.
    const baseSkins = payload.data
      .filter(item => item.type?.value === "outfit" || item.type?.backendValue === "AthenaCharacter")
      .map(mergeApiCosmetic);

    if (!baseSkins.length) throw new Error("The API returned no Battle Royale outfits.");

    // Add curated edit styles as their own results, rather than hiding them
    // inside the parent outfit or discarding them during API matching.
    skins = [...baseSkins, ...buildEditStyleEntries(baseSkins)];

    cosmeticsLoaded = true;
    createTimeline();
    filterSystem();

    if (loadingMessage) loadingMessage.textContent = `Loaded ${skins.length.toLocaleString()} Fortnite outfits!`;
    if (loadingPanel) loadingPanel.style.display = "none";
    if (enterButton) enterButton.disabled = false;
  } catch (error) {
    console.error("Fortnite cosmetic database error:", error);
    if (loadingMessage) loadingMessage.textContent =
      `Unable to load Fortnite cosmetics: ${error.message}. Refresh to try again.`;
    // The live API is unavailable: fall back to the manually curated data.js entries.
    skins = buildLocalMetadataDatabase();

    if (skins.length) {
      cosmeticsLoaded = true;
      createTimeline();
      filterSystem();
      if (loadingMessage) {
        loadingMessage.textContent = `Fortnite-API unavailable. Loaded ${skins.length.toLocaleString()} locally saved outfits/styles.`;
      }
      if (loadingPanel) loadingPanel.style.display = "block";
      if (enterButton) enterButton.disabled = false;
    } else {
      if (loadingMessage) loadingMessage.textContent = `Unable to load Fortnite cosmetics: ${error.message}. No local entries were found in data.js.`;
      if (loadingPanel) loadingPanel.style.display = "block";
      if (enterButton) enterButton.disabled = false;
      if (skinHub) skinHub.textContent = "Could not connect to Fortnite-API.com, and data.js contains no local outfits.";
    }
  }
}

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
    ⚠ Warning: Do not use when searching for skin names. Instead, use the regular search mode!
    </span>`
  
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
const tagMatchModeSelect = document.getElementById("TagMatchMode");
if (tagMatchModeSelect) {
  tagMatchModeSelect.addEventListener("change", () => {
    manualTagMatchMode = tagMatchModeSelect.value === "any" ? "any" : "all";
    filterSystem();
  });
}



const timelineList = document.getElementById("TimelineList");

let activeTags = [];
// Manual tag-panel matching mode: "all" requires every selected tag; "any" requires at least one.
let manualTagMatchMode = "all";

function closeSkinOverlay() {
  skinOverlay.style.display = "none";
  skinVideo.pause();
  skinVideo.src = "";
  const videoContainer = skinVideo.closest(".OverlayVideo");
  if (videoContainer) videoContainer.style.display = "block";
}

closeButton.addEventListener("click", closeSkinOverlay);

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
    "Headphones",
    "Holster",
    "Necklace",
    "Nails",
    "Pouches",
    "Sash",
    "Shoulder Bag",
    "Shotgun Shells",
    "Storm Tracker",
    "Ring",
    "Scarf",
    "Walkman",
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

  Age: ["Middle Aged", "Old", "Young", "Young-Adult"],

  "Art Style": ["Anime", "Cartoon", "Cell shaded", "Non Cell Shaded"],

  Armor: [
    "Armguard",
    "Armored Vest",
    "Chest plate",
    "Cuisses(Thigh Armor)",
    "Knee Pads",
    "Knee-Shin Guards",
    "Rerebrace(Upper Arm)",
    "Shin Guards",
    "Shoulder Pads",
    "Elbow Pads", 
  ],

  Belt: ["Military Belt", "Tactical Belt", "Obi"],

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
    "Agent",
    "Assassin",
    "Civilian",
    "Hunter",
    "Knight",
    "Mercenary",
    "Ninja",
    "Peely",
    "Pilot",
    "Pirate",
    "Samurai",
    "Scientist",
    "Soldier",
    "Superhero",
    "Villain",
  ],

  "Facial Hair": ["Beard", "Goatee", "Mustache", "Clean-Shaven"],

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
    "Heavy Armored",
    "Lightly Armored",
    "Luxury",
    "Medieval",
    "Mildy Armored",
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
    "Strapped Boots",
    "Velcro Sneakers",
  ],

  Sex: ["Female", "Male", "Unisex"],

  Gloves: [
    "Armored Gloves",
    "Boxing Gloves",
    "Clawed Gloves",
    "Clean Gloves",
    "Elbow-Length Gloves",
    "Fingerless Gloves",
    "Leather Gloves",
    "Long Gloves",
    "Opera Gloves",
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
    "Open-Top Helmet",
    "Hood",
    "Mask",
    "Open-Top Mask",
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
    "Leather Pants",
    "Long Skirts",
    "Sweat Pants",
    "Track Pants",
    "Underwear",
  ],

  Region: [
    "African",
    "Asian",
    "Middle Eastern",
    "Norwegian",
    "European",
    "South American",
    "North American",
  ],

  Rarity: [
    "Anime",
    "Common",
    "DC",
    "Epic",
    "Gaming Legends Series",
    "Icon Series",
    "Legendary",
    "Marvel",
    "Rare",
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
    "Post-Apocalyptic",
    "Royalty",
    "School",
    "Space",
    "Steampunk",
    "Tactical",
  ],

  "Outfit Era": [
    "1800's",
    "1930's - 1960's",
    "1970's",
    "1980's",
    "1990's",
    "2000's",
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
    "Leather Jacket",
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

  "light armor": ["Lightly Armored"],
  "Heavy armor": ["Heavy Armored"],
  armor: ["Armored"],

 



  sporty: ["Sport"],

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
        (skin) => skin.Identity?.skin_name?.toLowerCase() === phrase,
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


  let timeline = {};
function buildTimelineFromCosmetics() {
  const grouped = new Map();
  skins.forEach(skin => {
    if (skin.Chapter === null || skin.Chapter === undefined || skin.Chapter === "") return;
    const chapter = String(skin.Chapter);
    if (!grouped.has(chapter)) grouped.set(chapter, new Set());
    if (skin.Season !== null && skin.Season !== undefined && skin.Season !== "")
      grouped.get(chapter).add(String(skin.Season));
  });
  timeline = {};
  [...grouped.entries()].sort((a,b) => Number(a[0]) - Number(b[0])).forEach(([chapter,seasons]) => {
    timeline[chapter] = [...seasons].sort((a,b) => Number(a)-Number(b));
  });
}

function createTimeline() {
  buildTimelineFromCosmetics();
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
      button.dataset.season = String(season);

      button.textContent = `Season ${season}`;

      button.addEventListener("click", (e) => {
        // Don't trigger the chapter click
        e.stopPropagation();

        const chapterValue = isNaN(chapter) ? chapter : Number(chapter);

        // Clicking the same season deselects it
        if (selectedChapter === chapterValue && String(selectedSeason) === String(season)) {
          selectedSeason = null;
        } else {
          selectedChapter = chapterValue;
          selectedSeason = String(season);
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
          const season = button.dataset.season;

          if (String(season) === String(selectedSeason)) {
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
  overlaySkinName.textContent = skin.Identity?.skin_name || "Unknown Outfit";
  overlaySource.textContent = skin.Source || "Not provided by Fortnite-API";
  overlayIntroduced.textContent = `${skin.Chapter ? `Chapter ${skin.Chapter}` : "Unknown chapter"} ${skin.Season ? `Season ${skin.Season}` : "Unknown season"}`;
  overlayRarity.textContent = skin.Rarity || "Unknown";
  overlayCodename.textContent = formatCodename(skin.Codename);

  overlayTags.replaceChildren();
  (skin.Tags || []).forEach(tag => {
    const div = document.createElement("div");
    div.className = "OverlayTag";
    div.textContent = tag;
    overlayTags.appendChild(div);
  });

  const apiInfo = document.getElementById("OverlayAPIInfo");
  if (apiInfo) {
    apiInfo.replaceChildren();
    const api = skin.API || {};
    const details = [
      ["Fortnite API ID", api.id],
      ["Type", api.type?.displayValue || api.type?.value],
      ["Rarity", api.displayRarity || api.rarity?.displayValue],
      ["Set", api.set?.text || api.set?.value],
      ["Series", api.series?.value || api.series?.name],
      ["Added", api.added],
      ["Last Updated", api.lastUpdate],
      ["Gameplay Tags", Array.isArray(api.gameplayTags) ? api.gameplayTags.join(", ") : null]
    ];
    details.forEach(([label,value]) => {
      if (value === undefined || value === null || value === "") return;
      const row = document.createElement("div");
      row.className = "InfoRow";
      const title = document.createElement("span");
      title.className = "InfoLabel";
      title.textContent = `${label}: `;
      const content = document.createElement("span");
      content.textContent = String(value);
      row.append(title,content);
      apiInfo.appendChild(row);
    });
    const raw = document.createElement("details");
    const summary = document.createElement("summary");
    summary.textContent = "View complete Fortnite API data";
    const pre = document.createElement("pre");
    pre.textContent = JSON.stringify(api,null,2);
    raw.append(summary,pre);
    apiInfo.appendChild(raw);
  }

  skinVideo.pause();
  skinVideo.src = skin.video || "";
  const videoContainer = skinVideo.closest(".OverlayVideo");
  if (videoContainer) videoContainer.style.display = skin.video ? "block" : "none";
  if (skin.video) skinVideo.play().catch(() => {});
}

// =========================
// OPTIMIZED SKIN CARD RENDERER
// =========================

let skinRenderVersion = 0;

const SKIN_RENDER_BATCH_SIZE = 60;

function displaySkins(skinArray) {

    // Cancel any previous rendering operation.
    const currentRender = ++skinRenderVersion;

    skinHub.replaceChildren();

    if (!skinArray.length) {
        const empty = document.createElement("p");
        empty.className = "NoResults";
        empty.textContent = "No matching skins found.";
        skinHub.appendChild(empty);
        return;
    }

    let currentIndex = 0;

    function renderBatch() {

        // A newer search/filter may have started.
        if (currentRender !== skinRenderVersion) return;

        const fragment = document.createDocumentFragment();

        const batchEnd = Math.min(
            currentIndex + SKIN_RENDER_BATCH_SIZE,
            skinArray.length
        );

        for (; currentIndex < batchEnd; currentIndex++) {

            const skin = skinArray[currentIndex];

            const card = document.createElement("div");
            card.className = "SkinCard";

            // Clicking the card still opens its full information overlay.
            card.addEventListener("click", () => {
                openSkinOverlay(skin);
            });

            const name = document.createElement("h3");
            name.className = "SkinName";
            name.textContent =
                skin.Identity?.skin_name || "Unknown Outfit";

            const image = document.createElement("img");

            image.src = skin.icon || "";
            image.alt =
                skin.Identity?.skin_name || "Fortnite outfit";

            image.loading = "lazy";
            image.decoding = "async";

            image.onerror = () => {
                image.alt = "Image unavailable";
            };

            card.append(name, image);

            // Create the video ONLY when the user hovers over this card.
            if (skin.video) {

                let preview = null;

                card.addEventListener("mouseenter", () => {

                    if (!preview) {

                        preview = document.createElement("video");

                        preview.className = "SkinHoverVideo";
                        preview.muted = true;
                        preview.loop = true;
                        preview.playsInline = true;
                        preview.preload = "none";

                        preview.src = skin.video;

                        card.appendChild(preview);
                    }

                    preview.play().catch(() => {});
                });

                card.addEventListener("mouseleave", () => {

                    if (preview) {
                        preview.pause();

                        try {
                            preview.currentTime = 0;
                        } catch (_) {}
                    }
                });
            }

            // Preserve the Show Tags feature.
            if (showTags && (skin.Tags || []).length) {

                const tags = document.createElement("div");
                tags.className = "CardTags";

                skin.Tags.forEach(tag => {

                    const element = document.createElement("span");

                    element.className = "CardTag";
                    element.textContent = tag;

                    tags.appendChild(element);
                });

                card.appendChild(tags);
            }

            fragment.appendChild(card);
        }

        // Add this batch to the page.
        skinHub.appendChild(fragment);

        // Yield control to the browser before rendering the next batch.
        if (currentIndex < skinArray.length) {
            requestAnimationFrame(renderBatch);
        }
    }

    // Start rendering the first batch.
    requestAnimationFrame(renderBatch);
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
      skin.Identity?.skin_name,
      skin.id,
      skin.Rarity,
      ...(skin.SearchableTerms || []),
    ]
      .join(" ")
      .toLowerCase();

    const nameMatch =
      parsedSearch.nameWords.length === 0 ||
      parsedSearch.nameWords.every((word) => searchableName.includes(word));


     

    const manualTagsMatch = activeTags.length === 0 || (
      manualTagMatchMode === "any"
        ? activeTags.some((tag) => (skin.Tags || []).includes(tag))
        : activeTags.every((tag) => (skin.Tags || []).includes(tag))
    );

    const searchTagsMatch = parsedSearch.extractedTags.every((tag) =>
      (skin.Tags || []).includes(tag),
    );

    const tagMatch = manualTagsMatch && searchTagsMatch;

    let chapterMatch = true;

    if (selectedChapter !== null) {
      const skinChapter = Number(skin.Chapter);
      const selectedChapterNumber = Number(selectedChapter);

      if (chapterFilterMode === "exact") {
        chapterMatch = String(skin.Chapter) === String(selectedChapter) ||
          (Number.isFinite(skinChapter) && skinChapter === selectedChapterNumber);
      } else if (chapterFilterMode === "above") {
        chapterMatch = Number.isFinite(skinChapter) &&
          Number.isFinite(selectedChapterNumber) &&
          skinChapter >= selectedChapterNumber;
      } else if (chapterFilterMode === "below") {
        chapterMatch = Number.isFinite(skinChapter) &&
          Number.isFinite(selectedChapterNumber) &&
          skinChapter <= selectedChapterNumber;
      }
    }

    const seasonMatch =
      selectedSeason === null ||
      String(skin.Season) === String(selectedSeason);

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
displaySkins([]);
loadFortniteCosmetics();

const enterButton = document.getElementById("EnterButton");
const startScreen = document.getElementById("StartScreen");
const music = document.getElementById("BackgroundMusic");

function enterWebsite() {
  // Audio is optional: a missing file or browser autoplay restriction must not
  // prevent the user from entering the website.
  if (music) {
    music.volume = 0.35;
    const playback = music.play();
    if (playback && typeof playback.catch === "function") {
      playback.catch(error => console.warn("Background music could not play:", error));
    }
  }

  if (!startScreen) return;
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
