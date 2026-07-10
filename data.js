// =========================
// DATABASE
// =========================

const skins = [
  {
    id: "8086",

    isEditStyle: false,
    icon: undefined,
    video: undefined,
    Chapter: 3,
    Season: 3,
    Source: "Item Shop",
    Codename: "M_PennantSeasOne_C",
    Rarity: "Rare",

    Identity: {
      skin_name: "'Mato Marauder",
    },

    Tags: [
      "Young",
      "Non Cell Shaded",
      "Human",
      "Average",
      "Civilian",
      "Clean-Shaven",
      "Athletic",
      "Sneakers",
      "Male",
      "Gloveless",
      "Fade",
      "Track Pants",
      "Cuffed Pants",
      "Medium 👍🏽👊🏽",
      "Modern",
      "Tracksuit Jacket",
    ],
  },

  {
    id: "15288",

    isEditStyle: false,
    icon: undefined,
    video: undefined,
    Chapter: "Remix",
    Season: "",

    Identity: {
      skin_name: "1-Ball",
    },

    Tags: [
      "Young",
      "Non Cell Shaded",
      "Arm Bracers",
      "Chest plate",
      "Knee Pads",
      "Shoulder Pads",
      "Human",
      "Average",
      "Ninja",
      "Unitard",
      "Armored",
      "Strapped Boots",
      "Male",
      "Armored Gloves",
      "Tactical Gloves",
      "Helmet",
      "Tactical",
    ],
  },

  {
    id: "15288",

    isEditStyle: true,

    icon: "Images/Skins/T_Soldier_StageCue_ChalkJacket.png",
    video: "https://fnggcdn.com/items/15288/video-1-2-1.mp4?2",

    Chapter: "Remix",
    Season: "",

    Identity: {
      skin_name: "1-Ball[Jacket]",
    },

    Tags: [
      "Young",
      "Non Cell Shaded",
      "Knee Pads",
      "Human",
      "Average",
      "Ninja",
      "Unitard",
      "Strapped Boots",
      "Male",
      "Armored Gloves",
      "Tactical Gloves",
      "Helmet",
      "Tactical",
      "Puffy Jacket",
    ],
  },

  {
    id: "15282",

    isEditStyle: false,
    icon: undefined,
    video: undefined,
    Chapter: "Remix",
    Season: "",

    Identity: {
      skin_name: "10-Ball",
      rarity: "Epic",
    },

    Tags: [
      "Ammo Pouch",
      "Young",
      "Non Cell Shaded",
      "Chest plate",
      "Cuisses(Thigh Armor)",
      "Knee Pads",
      "Shin Guards",
      "Rerebrace(Upper Arm)",
      "Military Belt",
      "Human",
      "Average",
      "Ninja",
      "Unitard",
      "Armored",
      "High Military Boots",
      "Female",
      "Clean Gloves",
      "Ponytail",
      "Wavy Hair",
      "Helmet",
      "Tactical",
    ],
  },
];

if (typeof module !== "undefined") {
  module.exports = skins;
}

if (typeof window !== "undefined") {
  window.skins = skins;
}
