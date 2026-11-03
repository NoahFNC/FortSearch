// =========================
// DATABASE
// =========================

const skinMetadata = [
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

    Tags: [
      "Young",
      "Non Cell Shaded",
      "Human",
      "Muscular",
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
      "Jacket",
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


    Tags: [
      "Young",
      "Non Cell Shaded",
      "Arm Bracers",
      "Chest plate",
      "Knee Pads",
      "Shoulder Pads",
      "Human",
      "Muscular",
      "Agent",
      "Unitard",
      "Armored",
      "Mildy Armored",
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

    icon: "Images\\Skins\\T_Soldier_StageCue_ChalkJacket.png",
    video: "https://fnggcdn.com/items/15288/video-1-2-1.mp4?2",

   

    Identity: {
      skin_name: "1-Ball[Jacket]",
    },

    Tags: [
      "Young",
      "Non Cell Shaded",
      "Knee Pads",
      "Human",
      "Muscular",
      "Agent",
      "Unitard",
      "Strapped Boots",
      "Male",
      "Armored Gloves",
      "Tactical Gloves",
      "Helmet",
      "Tactical",
      "Jacket",
      "Puffy Jacket",
    ],
  },

  {
    id: "15282",

    isEditStyle: false,
    icon: undefined,
    video: undefined,

    
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
      "Agent",
      "Unitard",
      "Armored",
      "Mildy Armored",
      "High Military Boots",
      "Female",
      "Clean Gloves",
      "Ponytail",
      "Wavy Hair",
      "Helmet",
      "Tactical",
    ],
  },

  {
    id: "19251",

    isEditStyle: false,
    icon: undefined,
    video: undefined,
    Rarity: "Epic",
    Source: "Item Shop",

    Identity: {
    },

    Tags: [
      "Ammo Pouch",
      "Pouches",
      "Non Cell Shaded",
      "Armguard",
      "Knee-Shin Guards",
      "Shin Guards",
      "Human",
      "Muscular",
      "Agent",
      "Armored",
      "Lightly Armored",
      "Sneakers",
      "Velcro Sneakers",
      "Male",
      "Tactical Gloves",
      "Epic",
      "Tactical",
      "Jacket",
      "Cropped Jacket",
      "Puffy Jacket",
      "Sleeveless",
      "Sleeveless Jacket",

    ],
  },

  


  //Marvel Rarity//

  {
    id: 543,

    isEditStyle: false,
    icon: undefined,
    video: undefined,
    Chapter: 1,
    Season: 8,
    Source: "Item Shop",
    Codename: "F_AshtonBoardwalk",
    Rarity: "Marvel",

    Identity: {
      skin_name: "Black Widow Outfit",
      rarity: "Marvel",
    },

    Tags: [
      "Armband",
      "Bracelet",
      "Holster",
      "Storm Tracker",
      "Young-Adult",
      "Non Cell Shaded",
      "Shin Guards",
      "Knee Pads",
      "Military Belt",
      "Tactical Belt",
      "Human",
      "Average",
      "Assassin",
      "Superhero",
      "Clean-Shaven",
      "Unitard",
      "Strapped Boots",
      "Armored Boots",
      "Female",
      "Fingerless Gloves",
      "Tactical Gloves",
      "Short Hair",
      "Wavy Hair",
      "European",
      "Marvel",
      "Medium Light 👍🏼👊🏼",
      "Tactical",
      "Firearm",
      "Pistol",
    ],
  },

  {
    id: 542,

    isEditStyle: false,
    icon: undefined,
    video: undefined,
    Chapter: "1",
    Season: "8",
    Source: "Item Shop",
    Codename: "M_AshtonSaltLake",
    Rarity: "Marvel",

    Identity: {
      skin_name: "Star-Lord Outfit",
      rarity: "Marvel",
    },

    Tags: [
      "Armband",
      "Storm Tracker",
      "Walkman",
      "Headphones",
      "Pouches",
      "Respirator",
      "Young-Adult",
      "Non Cell Shaded",
      "Knee Pads",
      "Tactical Belt",
      "Human",
      "Average",
      "Superhero",
      "Military Boots",
      "Male",
      "Leather Gloves",
      "Mohawk",
      "Helmet",
      "Open-Top Helmet",
      "Leather Pants",
      "Marvel",
      "Medium Light 👍🏼👊🏼",
      "Tactical",
      "Space",
      "Jacket",
      "Leather Jacket",
      "Sleeveless Jacket",
    ],
  },
];

if (typeof module !== "undefined") {
  module.exports = skinMetadata;
}

if (typeof window !== "undefined") {
  window.skinMetadata = skinMetadata;
}
