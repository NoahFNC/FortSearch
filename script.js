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

// NPC outfits are identified by "NPC" appearing anywhere in their codename.
function isNpcSkin(skin) {
  return /NPC/i.test(String(skin?.Codename || ""));
}

// Return the shared codename stem used to associate NPC variants with outfits.
// For example, AnglePatch_Royal_NPC and AnglePatch_Lodge both resolve to AnglePatch.
function getCodenameStem(codename) {
  return String(codename || "")
    .replace(/^.*?(?:Character_|F_|M_)/i, "")
    .replace(/_NPC$/i, "")
    .replace(/_[^_]+$/, "")
    .toLowerCase();
}

let npcOutfitIndexSource = null;
let npcOutfitByCodename = new Map();
let npcOutfitByStem = new Map();

function buildNpcOutfitIndexes() {
  if (npcOutfitIndexSource === skins) return;

  npcOutfitIndexSource = skins;
  npcOutfitByCodename = new Map();
  npcOutfitByStem = new Map();

  for (const candidate of skins) {
    if (isNpcSkin(candidate) || candidate.isEditStyle) continue;

    const codename = String(candidate.Codename || "")
      .replace(/^.*?(?:Character_|F_|M_)/i, "")
      .toLowerCase();
    const stem = getCodenameStem(candidate.Codename);

    if (codename && !npcOutfitByCodename.has(codename)) {
      npcOutfitByCodename.set(codename, candidate);
    }
    if (stem && !npcOutfitByStem.has(stem)) {
      npcOutfitByStem.set(stem, candidate);
    }
  }
}

function getMatchingNpcOutfit(skin) {
  if (!isNpcSkin(skin)) return null;
  buildNpcOutfitIndexes();

  const codename = String(skin?.Codename || "")
    .replace(/^.*?(?:Character_|F_|M_)/i, "")
    .replace(/_NPC$/i, "")
    .toLowerCase();

  return npcOutfitByCodename.get(codename) ||
    npcOutfitByStem.get(getCodenameStem(skin?.Codename)) || null;
}
// Add the [NPC] label once, wherever the skin name is displayed.
function getDisplaySkinName(skin) {
  const matchingOutfit = getMatchingNpcOutfit(skin);
  const name = matchingOutfit?.Identity?.skin_name || skin?.Identity?.skin_name || "Unknown Outfit";

  if (!isNpcSkin(skin) || /\[NPC\]/i.test(name)) {
    return name;
  }

  return `${name} [NPC]`;
}

// Removes Fortnite codename prefixes for display.
function formatCodename(codename) {
  if (!codename) return "Unknown";

  return String(codename).replace(/^.*?(?:Character_|F_|M_)/i, "");
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

    // Keep both IDs separately identifiable.
    fortniteApiId: apiCosmetic.id,
    fortniteGgId: fortniteGgId,

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


// Read the requested variant selector from data.js.
// Preferred format: editStyle: { channel: "Progressive", tag: "Stage2" }
function getEditStyleSelector(metadata) {
  const selector = metadata.editStyle || {};

  return {
    channel: String(
      selector.channel ?? metadata.editStyleChannel ?? metadata.variantChannel ?? ""
    ).trim(),
    tag: String(
      selector.tag ?? metadata.editStyleTag ?? metadata.variantTag ?? ""
    ).trim()
  };
}

// Find the exact Fortnite API variant option requested in data.js.
function findEditStyleVariant(apiCosmetic, metadata) {
  if (!apiCosmetic || !Array.isArray(apiCosmetic.variants)) return null;

  const { channel, tag } = getEditStyleSelector(metadata);
  if (!channel || !tag) return null;

  const matchingVariant = apiCosmetic.variants.find(variant =>
    String(variant.channel || "").toLowerCase() === channel.toLowerCase()
  );

  if (!matchingVariant || !Array.isArray(matchingVariant.options)) return null;

  const option = matchingVariant.options.find(item =>
    String(item.tag || "").toLowerCase() === tag.toLowerCase()
  );

  return option ? { variant: matchingVariant, option } : null;
}

function buildEditStyleEntries(baseSkins, useFortniteGgIcons = false) {
  return fortSearchMetadata
    .filter(metadata => metadata.isEditStyle)
    .map(metadata => {
      // The edit-style entry and its parent share the Fortnite.GG ID.
      const metadataParentId = String(
        metadata.fortniteGgId ?? metadata.id ?? ""
      ).trim();

      const parentMetadata = fortSearchMetadata.find(item =>
        !item.isEditStyle &&
        String(item.fortniteGgId ?? item.id ?? "").trim() === metadataParentId
      );

      if (!parentMetadata) {
        console.warn("Edit style parent metadata not found:", metadata);
        return null;
      }

      // Reuse the parent's API cosmetic after the existing GG -> API mapping.
      const parent = baseSkins.find(skin =>
        String(skin.fortniteGgId ?? "") === metadataParentId
      );

      if (!parent) {
        console.warn("Edit style API parent not found:", {
          fortniteGgId: metadataParentId,
          editStyle: metadata.editStyle
        });
        return null;
      }

      const selector = getEditStyleSelector(metadata);
      const resolvedStyle = findEditStyleVariant(parent.API, metadata);
      const option = resolvedStyle?.option || null;

      if ((selector.channel || selector.tag) && !option) {
        console.warn("Fortnite API edit style variant was not found:", {
          skin: parent.Identity?.skin_name,
          fortniteGgId: metadataParentId,
          channel: selector.channel,
          tag: selector.tag
        });
      }

      // API option name/image are used when a selector is supplied.
      // Existing manual name/icon values remain compatible as fallbacks/overrides.
      const fallbackStyleName = selector.channel && selector.tag
        ? "Style"
        : `${parent.Identity?.skin_name || "Unknown Outfit"}[Style]`;

      const styleName =
        option?.name ||
        metadata.Identity?.skin_name ||
        fallbackStyleName;

      const styleIcon =
        metadata.icon ||
        option?.image ||
        (useFortniteGgIcons && metadataParentId
          ? `Images/Skins/${metadataParentId}.jpg`
          : parent.icon);

      const styleFortniteGgId =
        metadata.fortniteGgId ?? metadata.id ?? parent.fortniteGgId;

      const selectorKey = selector.channel && selector.tag
        ? `${normalizeCosmeticName(selector.channel)}-${normalizeCosmeticName(selector.tag)}`
        : normalizeCosmeticName(styleName);

      return {
        ...parent,
        id: parent.id,
        entryKey: `${parent.entryKey || parent.id}::style::${selectorKey}`,
        fortniteGgId: styleFortniteGgId,
        isEditStyle: true,

        Identity: {
          skin_name: selector.channel && selector.tag
            ? `${parent.Identity?.skin_name || "Unknown Outfit"}[${styleName}]`
            : styleName
        },

        editStyle: {
          channel: selector.channel || null,
          tag: selector.tag || null,
          name: option?.name || null,
          image: option?.image || null
        },

        Tags: metadata.Tags || [],
        SearchableTerms: metadata.SearchableTerms || [],
        icon: styleIcon,

        // A manually supplied Fortnite.GG video always takes priority.
        video: metadata.video || (styleFortniteGgId
          ? `https://fnggcdn.com/items/${styleFortniteGgId}/video.mp4?2`
          : parent.video),

        // Keep the complete parent API cosmetic, including its variants.
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
      fortniteApiId: null,
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
    // Start both downloads together to avoid waiting for the cross-reference
    // file before the much larger cosmetics request can begin.
    const [_, response] = await Promise.all([
      loadFortniteIdCrossReference(),
      fetch(FORTNITE_API_URL)
    ]);
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
let showFullBody = false;

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
const fullBodyButton = document.getElementById("FullBodyButton");

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

// Switch every result card between its standard icon and API featured image.
if (fullBodyButton) {
    fullBodyButton.addEventListener("click", () => {
        showFullBody = !showFullBody;

        fullBodyButton.classList.toggle("Active", showFullBody);
        fullBodyButton.setAttribute("aria-pressed", String(showFullBody));
        skinHub.classList.toggle("FullBodyMode", showFullBody);

        filterSystem();
    });
}

chapterFilterModeSelect.addEventListener("change", () => {
  chapterFilterMode = chapterFilterModeSelect.value;

  filterSystem();
});


// =========================
// TAG CATEGORIES
// =========================

const tagCategories = {
  Accessories: [
    "Ammo Pouch",
    "Armband",
    "Backpack",
    "Bandolier",
    "Bow Tie",
    "Bracelet",
    "Bullet Belt",
    "Canister",
    "Cape",
    "Chain",
    "Chaps",
    "Choker",
    "Claws",
    "Cybernetic Arm",
    "Dog Tags",
    "Earbud / Earpiece",
    "Glow / Reactive Effects",
    "Greaves",
    "Harness",
    "Holster",
    "Keychain / Charm",
    "Lanyard",
    "Leg Pouch / Drop-Leg Holster",
    "Mask[Off]",
    "Medal / Pin",
    "Nails",
    "Necklace",
    "Pauldrons",
    "Pouches",
    "Ring",
    "Sabatons",
    "Sash",
    "Scabbard",
    "Scarf",
    "Sheath",
    "Shotgun Shells",
    "Shoulder Bag",
    "Storm Tracker",
    "Tail",
    "Tattoo[Arm]",
    "Tattoo[Full Body]",
    "Tattoo[Leg]",
    "Tattoo[Torso]",
    "Tie",
    "Walkman",
    "Watch",
    "Wings",
    "Wristband / Sweatband",
  ],

  Facewear: [
    "No Facewear",
    "Balaclava / Ski Mask",
    "Blindfold",
    "Cybernetic Eye",
    "Eyepatch",
    "Face Mask",
    "Gas Mask",
    "Glasses",
    "Glowing Eyes",
    "Goggles",
    "Mask",
    "Monocle",
    "Respirator",
    "Sun Glasses",
    "Tactical Headset",
    "Visor",
    "Visor Glasses",
  ],

  Piercings: [
    "No Piercings",
    "Drop[Earrings]",
    "Hoop[Earrings]",
    "Lip Ring",
    "Nose Ring",
    "Plug[Earrings]",
    "Stud[Earrings]",
  ],

  Age: ["Middle Aged", "Old", "Young", "Young-Adult"],

  "Art Style": ["Anime", "Cartoon", "Cell shaded", "Non Cell Shaded"],

  Armor: [
    "Armguard",
    "Armored Underwear",
    "Armored Vest",
    "Bracers",
    "Chest plate",
    "Cuisses(Thigh Armor)",
    "Elbow Pads",
    "Gauntlets",
    "Knee Pads",
    "Knee-Shin Guards",
    "Muscle Cuirass",
    "Rerebrace(Upper Arm)",
    "Shin Guards",
    "Shoulder Armor (Single)",
    "Shoulder Pads",
  ],

  Belt: ["Casual Belt", "Military Belt", "Obi", "Tactical Belt", "Utility Belt"],

  Species: [
    "Alien",
    "Android",
    "Angelic",
    "Animal",
    "Cybernetic",
    "Cyborg",
    "Demonic",
    "Ghost",
    "Human",
    "Humanoid",
    "Monster",
    "Robot",
    "Skeleton",
    "Undead",
    "Unique",
    "Vampiric",
    "Zombie",
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
    "Athlete",
    "Civilian",
    "Cowboy / Outlaw",
    "Cyborg / Android",
    "Demon / Monster",
    "Gamer",
    "Hunter",
    "Knight",
    "Knight / Warrior",
    "Mage / Sorcerer",
    "Mercenary",
    "Monster Hunter",
    "Ninja",
    "Peely",
    "Performer",
    "Pilot",
    "Pilot / Racer",
    "Pirate",
    "Robot / Mech",
    "Samurai",
    "Scientist",
    "Soldier",
    "Street Artist / Skater",
    "Superhero",
    "Survivalist",
    "Villain",
    "Wastelander",
  ],

  "Facial Hair": [
    "No Facial Hair",
    "Beard",
    "Clean-Shaven",
    "Goatee",
    "Mustache",
  ],

  "Full-Body Garments": [
    "Coat",
    "Dress",
    "Flight Suit",
    "Gown",
    "Hazmat Suit",
    "Jumpsuit",
    "Leotard",
    "Morph Suit",
    "Overalls",
    "Romper",
    "Trench Coat",
    "Unitard",
    "Wet Suit",
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
    "Mildly Armored",
    "Poor",
    "Spandex",
    "Streetwear",
    "Suit",
  ],

  Footwear: [
    "Armored Boots",
    "Barefoot",
    "Boots",
    "Casual Shoes",
    "Clean Boots",
    "Cleats",
    "Combat Boots",
    "Cybernetic Foot",
    "Flip Flops",
    "Formal Shoes",
    "Heels",
    "High Heels",
    "High Military Boots",
    "Knee-High Boots",
    "Military Boots",
    "Platform Boots / Shoes",
    "Sandals",
    "Slippers",
    "Sneakers",
    "Socks",
    "Strapped Boots",
    "Thigh-High Boots",
    "Velcro Sneakers",
  ],

  Sex: ["Female", "Male", "Unisex"],

  Gloves: [
    "Armored Gloves",
    "Boxing Gloves",
    "Clawed Gloves",
    "Clean Gloves",
    "Cybernetic Hand",
    "Elbow-Length Gloves",
    "Fingerless Gloves",
    "Gloveless",
    "Leather Gloves",
    "Long Gloves",
    "Mechanical Gloves",
    "Opera Gloves",
    "Rubber Gloves",
    "Tactical Gloves",
    "Winter Gloves",
  ],

  Hair: [
    "Afro",
    "Bald",
    "Bangs",
    "Bob",
    "Braids",
    "Bun",
    "Buzz Cut",
    "Cornrows",
    "Curly Hair",
    "Curtain Bangs",
    "Dreads",
    "Fade",
    "Faux Hawk",
    "Long Hair",
    "Messy Hair",
    "Mohawk",
    "Mullet",
    "Pig Tails",
    "Pigtails / Twin Tails",
    "Ponytail",
    "Shaved Sides / Undercut",
    "Short Hair",
    "Side Part",
    "Space Buns",
    "Spiky Hair",
    "Straight Hair",
    "Unique Hairstyle",
    "Wavy Hair",
  ],

  Headwear: [
    "No Headwear",
    "Animal Ears",
    "Bandana",
    "Beanie",
    "Beret",
    "Cap",
    "Cap[Backwards]",
    "Cowboy Hat",
    "Crown",
    "Durag",
    "Glasses[Off]",
    "Goggles[Off]",
    "Halo",
    "Hat",
    "Headband",
    "Headphones",
    "Helmet",
    "Hood",
    "Horns / Antlers",
    "Mask[Side / Top]",
    "Open-Top Helmet",
    "Straw Hat",
    "Tiara",
    "Top Hat",
    "Veil",
    "Visor Cap",
    "Visor[Off]",
    "Visor Glasses[Off]",
  ],

  Legwear: [
    "Asymmetrical Legwear",
    "Bell Bottoms",
    "Booty Shorts",
    "Capri Pants",
    "Cargo Pants",
    "Chaps",
    "Cuffed Pants",
    "Cybernetic Leg",
    "Fishnets",
    "Formal Pants",
    "Jeans",
    "Joggers",
    "Leather Pants",
    "Leggings",
    "Long Skirts",
    "Pajamas",
    "Ripped Jeans",
    "Short Jeans",
    "Short Skirts",
    "Shorts",
    "Skin Tight Pants",
    "Skirts",
    "Sweat Pants",
    "Tactical Pants",
    "Tights / Stockings",
    "Track Pants",
    "Underwear",
  ],

  Region: [
    "African",
    "Asian",
    "European",
    "Middle Eastern",
    "North American",
    "Norwegian",
    "South American",
  ],

  "Skin Tone": [
    "Pale🧛‍♀️",
    "Light 👍🏻👊🏻",
    "Medium Light 👍🏼👊🏼",
    "Medium 👍🏽👊🏽",
    "Medium Dark 👍🏾👊🏾",
    "Dark 👍🏿👊🏿",
    "Non-Human Skin Tone",
  ],

  Themes: [
    "Apocalyptic",
    "Cyberpunk",
    "Fantasy",
    "Futuristic",
    "Gothic",
    "Halloween / Spooky",
    "Horror",
    "Medieval",
    "Military",
    "Music / DJ",
    "Mythological",
    "Post-Apocalyptic",
    "Royalty",
    "School",
    "Sci-Fi",
    "Space",
    "Sports",
    "Steampunk",
    "Summer / Beach",
    "Tactical",
    "Western",
    "Winter / Holiday",
  ],

  "Outfit Era": [
    "Prehistoric",
    "Ancient / Classical",
    "Medieval",
    "1800's",
    "1930's - 1960's",
    "1970's",
    "1980's",
    "1990's",
    "2000's",
    "2010's",
    "2020's",
    "Futuristic",
  ],

  Tops: [
    "Armor Only",
    "Blazer",
    "Bodysuit",
    "Camisole",
    "Cloak",
    "Corset",
    "Crop Top",
    "Cropped Jacket",
    "Dress Shirt",
    "Flannel / Plaid Shirt",
    "Halter Top",
    "Hoodie",
    "Jacket",
    "Jersey / Varsity Jacket",
    "Kimono / Haori",
    "Leather Jacket",
    "Long Sleeve",
    "Off-Shoulder",
    "Peplum Top",
    "Polo Shirt",
    "Poncho",
    "Puffy Jacket",
    "Scrunch Sleeve Jacket",
    "Shirtless",
    "Short Sleeve",
    "Skin Tight Chest",
    "Sleeveless",
    "Sleeveless Dress Shirt",
    "Sleeveless Jacket",
    "Sports Jersey",
    "Suspenders",
    "Sweater",
    "T-Shirt",
    "Tank Top",
    "Toga",
    "Tracksuit Jacket",
    "Tube Top",
    "Turtleneck",
    "U-Neck",
    "V-Neck",
    "Vest",
    "Windbreaker",
  ],

  Weapons: [
    "No Weapons",
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
  "heavy armor": ["Heavy Armored"],
  armor: ["Armored"],
  "thigh armor": ["Cuisses(Thigh Armor)"],

 



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

    // NORMAL SEARCH
    if (!aiSearchMode) {
        return {
            extractedTags: [],
            nameWords: query.split(/\s+/).filter(Boolean),
        };
    }

    // AI SEARCH
    let remainingText = query;

    const extractedTags = [];

    // Process longer aliases before shorter aliases.
    // This prevents "armor" from consuming part of "thigh armor".
    const sortedAliases = Object.entries(tagAliases)
        .sort((a, b) => b[0].length - a[0].length);

    sortedAliases.forEach(([alias, tags]) => {
        const escapedAlias = alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

        const regex = new RegExp(`\\b${escapedAlias}\\b`, "gi");

        if (regex.test(remainingText)) {
            tags.forEach(tag => {
                if (!extractedTags.includes(tag)) {
                    extractedTags.push(tag);
                }
            });

            // Remove the matched alias so shorter aliases cannot match it.
            remainingText = remainingText.replace(regex, " ");
        }
    });

    // FIND DIRECT TAG MATCHES
    allTags.forEach(tag => {
        const escapedTag = tag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

        const regex = new RegExp(`\\b${escapedTag}\\b`, "i");

        if (regex.test(remainingText)) {
            if (!extractedTags.includes(tag)) {
                extractedTags.push(tag);
            }

            remainingText = remainingText.replace(regex, " ");
        }
    });

    // FIND SINGULAR / PLURAL TAG MATCHES
    const leftoverWords = remainingText.split(/\s+/).filter(Boolean);

    for (let i = 0; i < leftoverWords.length; i++) {
        const detectedTags = findTag(leftoverWords[i]);

        if (detectedTags) {
            const tags = Array.isArray(detectedTags)
                ? detectedTags
                : [detectedTags];

            tags.forEach(tag => {
                if (!extractedTags.includes(tag)) {
                    extractedTags.push(tag);
                }
            });

            leftoverWords[i] = "";
        }
    }

    // FIND SKIN NAMES
    const nameWords = [];
    const remainingWords = leftoverWords.filter(Boolean);

    for (let start = 0; start < remainingWords.length; start++) {
        for (let end = remainingWords.length; end > start; end--) {
            const phrase = remainingWords.slice(start, end).join(" ");

            const possibleSkin = skins.find(
                skin => skin.Identity?.skin_name?.toLowerCase() === phrase
            );

            if (possibleSkin) {
                nameWords.push(phrase);

                for (let i = start; i < end; i++) {
                    remainingWords[i] = "";
                }

                break;
            }
        }
    }

    return {
        extractedTags,
        nameWords: nameWords.filter(Boolean),
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


function openSkinOverlay(skin) {
  skinOverlay.style.display = "flex";

  // =========================
  // BASIC SKIN INFORMATION
  // =========================

  overlaySkinName.textContent = getDisplaySkinName(skin);

  overlaySource.textContent =
    skin.Source || "Not provided by Fortnite-API";

  overlayIntroduced.textContent =
    `${skin.Chapter ? `Chapter ${skin.Chapter}` : "Unknown chapter"} ${
      skin.Season ? `Season ${skin.Season}` : "Unknown season"
    }`;

  // Rarity is displayed ONLY in the original HTML row.
  overlayRarity.textContent = skin.Rarity || "Unknown";

  overlayCodename.textContent = formatCodename(skin.Codename);

  // =========================
  // TAGS
  // =========================

  overlayTags.replaceChildren();

  (skin.Tags || []).forEach(tag => {
    const div = document.createElement("div");

    div.className = "OverlayTag";
    div.textContent = tag;

    overlayTags.appendChild(div);
  });

  // =========================
  // FORTNITE API INFORMATION
  // =========================

  const apiInfo = document.getElementById("OverlayAPIInfo");

  if (apiInfo) {
    apiInfo.replaceChildren();

    const api = skin.API || {};

    // Display unavailable values rather than randomly
    // removing rows from the overlay.
    const details = [
      [
        "Fortnite API ID",
        skin.fortniteApiId || api.id || skin.id
      ],
      [
        "Fortnite.gg ID",
        skin.fortniteGgId
      ],
      [
        "Type",
        api.type?.displayValue || api.type?.value
      ],
      [
        "Set",
        api.set?.text || api.set?.value
      ],
      [
        "Series",
        api.series?.value || api.series?.name
      ],
      [
        "Added",
        api.added
      ],
      [
        "Last Updated",
        api.lastUpdate
      ],
      [
        "Gameplay Tags",
        Array.isArray(api.gameplayTags)
          ? api.gameplayTags.join(", ")
          : null
      ]
    ];

    // Create every information row consistently.
    details.forEach(([label, value]) => {
      const row = document.createElement("div");
      row.className = "InfoRow";

      const title = document.createElement("span");
      title.className = "InfoLabel";
      title.textContent = `${label}: `;

      const content = document.createElement("span");
      content.className = "InfoValue";
      content.textContent =
        value !== undefined && value !== null && value !== ""
          ? String(value)
          : "Unavailable";

      row.append(title, content);
      apiInfo.appendChild(row);
    });

    // =========================
    // COMPLETE API DATA
    // =========================

    // Only show this dropdown when actual API data exists.
    const hasApiData =
      skin.API &&
      typeof skin.API === "object" &&
      Object.keys(skin.API).length > 0;

    if (hasApiData) {
      const raw = document.createElement("details");

      const summary = document.createElement("summary");
      summary.textContent = "View complete Fortnite API data";

      const pre = document.createElement("pre");
      pre.textContent = JSON.stringify(skin.API, null, 2);

      raw.append(summary, pre);
      apiInfo.appendChild(raw);
    }
  }

  // =========================
  // VIDEO
  // =========================

  skinVideo.pause();

  const videoContainer = skinVideo.closest(".OverlayVideo");
  const npcFeaturedImage =
    skin.API?.images?.featured || skin.icon || "";

  // NPC outfits do not have Fortnite.gg video IDs. Show their
  // Fortnite API featured artwork in the overlay instead.
  if (isNpcSkin(skin)) {
    let npcImage = videoContainer?.querySelector(".OverlayNPCFeaturedImage");

    if (videoContainer && !npcImage) {
      npcImage = document.createElement("img");
      npcImage.className = "OverlayNPCFeaturedImage";
      npcImage.alt = `${getDisplaySkinName(skin)} featured artwork`;
      npcImage.style.width = "100%";
      npcImage.style.height = "100%";
      npcImage.style.maxHeight = "100%";
      npcImage.style.objectFit = "contain";
      npcImage.style.display = "block";
      videoContainer.appendChild(npcImage);
    }

    if (npcImage) {
      npcImage.src = npcFeaturedImage;
      npcImage.alt = `${getDisplaySkinName(skin)} featured artwork`;
      npcImage.style.display = npcFeaturedImage ? "block" : "none";
    }

    skinVideo.removeAttribute("src");
    skinVideo.load();
    skinVideo.style.display = "none";

    if (videoContainer) {
      videoContainer.style.display = npcFeaturedImage ? "block" : "none";
    }
  } else {
    const npcImage =
      videoContainer?.querySelector(".OverlayNPCFeaturedImage");

    if (npcImage) {
      npcImage.style.display = "none";
    }

    skinVideo.style.display = "";
    skinVideo.src = skin.video || "";

    if (videoContainer) {
      videoContainer.style.display = skin.video ? "block" : "none";
    }

    if (skin.video) {
      skinVideo.play().catch(() => {});
    }
  }
}

function updateTimelineSelection() {

    // Update chapter highlighting.
    document.querySelectorAll(".TimelineHeader").forEach(header => {

        const chapter = header.dataset.chapter;

        const chapterValue = isNaN(chapter)
            ? chapter
            : Number(chapter);

        header.classList.toggle(
            "Active",
            chapterValue === selectedChapter
        );

    });

    // Update season highlighting.
    document.querySelectorAll(".SeasonButton").forEach(button => {

        const category = button.closest(".TimelineCategory");
        const header = category?.querySelector(".TimelineHeader");

        if (!header) return;

        const chapter = header.dataset.chapter;

        const chapterValue = isNaN(chapter)
            ? chapter
            : Number(chapter);

        const isSelected =
            chapterValue === selectedChapter &&
            String(button.dataset.season) === String(selectedSeason);

        button.classList.toggle("Active", isSelected);

    });

}


// =========================
// OPTIMIZED SKIN CARD RENDERER
// =========================

let skinRenderVersion = 0;
let activeSkinRenderObserver = null;
let activeSkinScrollHandler = null;
let activeCardVideo = null;
const SKIN_RENDER_BATCH_SIZE = 60;
const SKIN_RENDER_PREFETCH_DISTANCE = 3200;
const CARD_VIDEO_HOVER_DELAY_MS = 120;

function displaySkins(skinArray) {
  const currentRender = ++skinRenderVersion;
  if (activeCardVideo) {
    activeCardVideo.pause();
    activeCardVideo.removeAttribute("src");
    activeCardVideo.load();
    activeCardVideo = null;
  }
  if (activeSkinRenderObserver) {
    activeSkinRenderObserver.disconnect();
    activeSkinRenderObserver = null;
  }
  if (activeSkinScrollHandler) {
    window.removeEventListener("scroll", activeSkinScrollHandler);
    activeSkinScrollHandler = null;
  }

  skinHub.replaceChildren();

  if (!skinArray.length) {
    const empty = document.createElement("p");
    empty.className = "NoResults";
    empty.textContent = "No matching skins found.";
    skinHub.appendChild(empty);
    return;
  }

  let currentIndex = 0;
  let batchScheduled = false;
  const sentinel = document.createElement("div");
  sentinel.className = "SkinRenderSentinel";
  sentinel.setAttribute("aria-hidden", "true");
  sentinel.style.cssText = "flex: 1 0 100%; height: 1px; pointer-events: none;";

  function makeCard(skin) {
    const card = document.createElement("div");
    card.className = "SkinCard";
    let suppressNextClick = false;
    card.addEventListener("click", () => {
      if (suppressNextClick) {
        suppressNextClick = false;
        return;
      }
      openSkinOverlay(skin);
    });
    card.addEventListener("contextmenu", event => event.preventDefault());

    const displayName = getDisplaySkinName(skin);
    const name = document.createElement("h3");
    name.className = "SkinName";
    name.textContent = displayName;

    const image = document.createElement("img");
    const standardIcon = skin.icon || "";
    const featuredIcon = skin.API?.images?.featured || "";
    const shouldUseFeaturedImage =
      isNpcSkin(skin) || (showFullBody && !skin.isEditStyle);
    const preferredImage = shouldUseFeaturedImage && featuredIcon
      ? featuredIcon
      : standardIcon;

    image.alt = displayName;
    image.loading = "lazy";
    image.decoding = "async";
    image.fetchPriority = "low";
    image.draggable = false;
    image.onerror = () => {
      if (image.dataset.fallbackUsed !== "true" && standardIcon && preferredImage !== standardIcon) {
        image.dataset.fallbackUsed = "true";
        image.src = standardIcon;
      } else {
        image.alt = "Image unavailable";
      }
    };
    image.src = preferredImage;
    card.append(name, image);

    if (skin.video) {
      let preview = null;
      let hoverTimer = null;
      let isHovered = false;
      let touchTimer = null;
      let touchHeld = false;

      const startPreview = () => {
        if (activeCardVideo && activeCardVideo !== preview) {
          activeCardVideo.pause();
          activeCardVideo.style.opacity = "0";
          activeCardVideo.removeAttribute("src");
          activeCardVideo.load();
        }

        if (!preview) {
          preview = document.createElement("video");
          preview.className = "SkinHoverVideo";
          preview.muted = true;
          preview.loop = true;
          preview.playsInline = true;
          preview.preload = "none";
          preview.setAttribute("playsinline", "");
          preview.style.opacity = "0";
          preview.addEventListener("playing", () => {
            if (isHovered || touchHeld) preview.style.opacity = "1";
          });
          card.appendChild(preview);
        }

        activeCardVideo = preview;
        if (!preview.src) preview.src = skin.video;
        const playback = preview.play();
        if (playback && typeof playback.catch === "function") playback.catch(() => {});
      };

      const stopPreview = () => {
        if (!preview) return;
        preview.pause();
        preview.style.opacity = "0";
        try { preview.currentTime = 0; } catch (_) {}
      };

      card.addEventListener("mouseenter", () => {
        isHovered = true;
        if (hoverTimer !== null) clearTimeout(hoverTimer);
        hoverTimer = setTimeout(() => {
          hoverTimer = null;
          if (!isHovered) return;

          startPreview();
        }, CARD_VIDEO_HOVER_DELAY_MS);
      });

      card.addEventListener("mouseleave", () => {
        isHovered = false;
        if (hoverTimer !== null) {
          clearTimeout(hoverTimer);
          hoverTimer = null;
        }
        stopPreview();
      });

      card.addEventListener("touchstart", () => {
        touchHeld = false;
        touchTimer = setTimeout(() => {
          touchTimer = null;
          touchHeld = true;
          suppressNextClick = true;
          startPreview();
        }, 100);
      }, { passive: true });

      const finishTouch = () => {
        if (touchTimer !== null) {
          clearTimeout(touchTimer);
          touchTimer = null;
        }
        if (touchHeld) {
          touchHeld = false;
          stopPreview();
          // Also suppress the synthetic click some browsers send after a hold.
          setTimeout(() => { suppressNextClick = false; }, 700);
        }
      };

      card.addEventListener("touchend", finishTouch, { passive: true });
      card.addEventListener("touchcancel", finishTouch, { passive: true });
      card.addEventListener("touchmove", () => {
        // Moving the finger means the user is scrolling, not requesting a preview.
        if (!touchHeld && touchTimer !== null) {
          clearTimeout(touchTimer);
          touchTimer = null;
        }
      });
    }

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

    return card;
  }

  function scheduleNextBatch() {
    if (batchScheduled || currentRender !== skinRenderVersion) return;
    batchScheduled = true;
    if (activeSkinRenderObserver) activeSkinRenderObserver.unobserve(sentinel);
    requestAnimationFrame(() => {
      batchScheduled = false;
      renderBatch();
    });
  }

  function renderBatch() {
    if (currentRender !== skinRenderVersion) return;

    const fragment = document.createDocumentFragment();
    const batchEnd = Math.min(currentIndex + SKIN_RENDER_BATCH_SIZE, skinArray.length);
    for (; currentIndex < batchEnd; currentIndex++) {
      fragment.appendChild(makeCard(skinArray[currentIndex]));
    }
    skinHub.appendChild(fragment);

    if (currentIndex < skinArray.length) {
      if (!sentinel.isConnected) skinHub.appendChild(sentinel);
      const nearEnd = sentinel.getBoundingClientRect().top <=
        window.innerHeight + SKIN_RENDER_PREFETCH_DISTANCE;

      if (nearEnd || !activeSkinRenderObserver) {
        scheduleNextBatch();
      } else {
        activeSkinRenderObserver.observe(sentinel);
      }
    } else {
      sentinel.remove();
      if (activeSkinRenderObserver) {
        activeSkinRenderObserver.disconnect();
        activeSkinRenderObserver = null;
      }
      if (activeSkinScrollHandler) {
        window.removeEventListener("scroll", activeSkinScrollHandler);
        activeSkinScrollHandler = null;
      }
    }
  }

  if ("IntersectionObserver" in window) {
    activeSkinRenderObserver = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) scheduleNextBatch();
    }, { rootMargin: `${SKIN_RENDER_PREFETCH_DISTANCE}px 0px` });
  }

  activeSkinScrollHandler = () => {
    if (currentRender !== skinRenderVersion || !sentinel.isConnected) return;
    if (sentinel.getBoundingClientRect().top <=
        window.innerHeight + SKIN_RENDER_PREFETCH_DISTANCE) {
      scheduleNextBatch();
    }
  };
  window.addEventListener("scroll", activeSkinScrollHandler, { passive: true });

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
