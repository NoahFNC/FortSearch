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

  {
    id: "19251",

    Identity: {
      skin_name: "2-Ball",
      rarity: "Epic",
    },

    Tags: [
      "Tactical",
      "Shin Guards",
      "Muscular",
      "Casual Shoes",
      "Male",
      "Armored Gloves",
      "Jacket",
      "Mask",
    ],

  },

  {
    id: "9548",

    Identity: {
      skin_name: "212th Battalion Trooper",
      rarity: "Star Wars",
    },

    Tags: [
      "Knee Pads",
      "Shin Guards",
      "Shoulder Pads",
      "Elbow Pads",
      "Arm Bracers",
      "Cuisses(Thigh Armor)",
      "Chestplate",
      "Military Belt",
      "Muscular",
      "Soldier",
      "Armor",
      "Casual Shoes",
      "Male",
      "Armored Gloves",
      "Helmet",
      "Underwear",
      "Star Wars",
      "Apocalyptic",
      "Futuristic",
      "Space",
    ],

  },

  {
    id: "19532",

    Identity: {
      skin_name: "2D",
      rarity: "Icon Series",
    },

    Tags: [
      "Necklace",
      "Cartoon",
      "Slim",
      "Casual",
      "Casual Shoes",
      "Male",
      "Gloveless",
      "Spiky Hair",
      "Messy Hair",
      "Cuff Jeans",
      "White Skin",
      "Sleeveless Dress Shirt",
    ],

  },

  {
    id: "9544",

    Identity: {
      skin_name: "501st Trooper",
      rarity: "Star Wars",
    },

    Tags: [
      "Knee Pads",
      "Shin Guards",
      "Shoulder Pads",
      "Elbow Pads",
      "Arm Bracers",
      "Cuisses(Thigh Armor)",
      "Chestplate",
      "Military Belt",
      "Muscular",
      "Soldier",
      "Armor",
      "Casual Shoes",
      "Male",
      "Armored Gloves",
      "Helmet",
      "Underwear",
      "Star Wars",
      "Apocalyptic",
      "Futuristic",
      "Space",
    ],

  },

  {
    id: "19852",

    Identity: {
      skin_name: "7-Ball",
      rarity: "Epic",
    },

    Tags: [],

  },

  {
    id: "380",

    Identity: {
      skin_name: "8-Ball vs Scratch",
      rarity: "Epic",
    },

    Tags: [
      "Tactical",
      "Number",
      "Futuristic",
      "Agent",
      "Male",
      "Military",
      "Weapons",
    ],

  },

  {
    id: "8459",

    Identity: {
      skin_name: "A Goat",
      rarity: "Gaming Legends Series",
    },

    Tags: ["Animal", "Goat", "Casual", "Unisex"],

  },

  {
    id: "662",

    Identity: {
      skin_name: "A.I.M.",
      rarity: "Legendary",
    },

    Tags: ["Futuristic", "Apocalyptic", "Male", "Cyborg", "Robot"],

  },

  {
    id: "22090",

    Identity: {
      skin_name: "Aaliyah",
      rarity: "Epic",
    },

    Tags: [
      "Royalty",
      "Female",
      "Middle Eastern",
      "Cybernetic",
      "Necklace",
      "Earrings",
    ],

  },

  {
    id: "11910",

    Identity: {
      skin_name: "Aang",
      rarity: "Epic",
    },

    Tags: ["Young Male", "Cartoon", "Asian", "Toga", "Anime",],

  },

  {
    id: "6009",

    Identity: {
      skin_name: "Absenz",
      rarity: "Rare",
    },

    Tags: ["Horror", "Hood", "Male"],

  },

  {
    id: "891",

    Identity: {
      skin_name: "Absolute Zero",
      rarity: "Rare",
    },

    Tags: ["Defualt", "Goggles", "Facial Hair", "Male"],

  },

  {
    id: "806",

    Identity: {
      skin_name: "Abstrakt",
      rarity: "Epic",
    },

    Tags: [
      "Casual",
      "Streetwear",
      "graffiti",
      "Hood",
      "Gas mask",
      "Cap",
      "Male",
    ],

  },

  {
    id: "8557",

    Identity: {
      skin_name: "Abyss",
      rarity: "Epic",
    },

    Tags: ["Female", "Ponytail", "Braids", "Earrings"],

  },

  {
    id: "9668",

    Identity: {
      skin_name: "Ace Academic",
      rarity: "Epic",
    },

    Tags: ["Cell shaded", "School", "Female", "Skirt", "Casual", "Short Hair"],

  },

  {
    id: "16685",

    Identity: {
      skin_name: "Aces Wild Card",
      rarity: "Epic",
    },

    Tags: ["Male", "Luxury", "Suit", "Mask"],

  },

  {
    id: "22472",

    Identity: {
      skin_name: "Adam Smasher",
      rarity: "Epic",
    },

    Tags: ["Futuristic", "Cyborg", "Male", "Robot"],

  },

  {
    id: "11323",

    Identity: {
      skin_name: "Adanna of the Deep",
      rarity: "Rare",
    },

    Tags: ["Female", "Nose Ring", "Dreads", "Piercings", "Nails", "Dark Skin"],

  },

  {
    id: "148",

    Identity: {
      skin_name: "Adeline",
      rarity: "Rare",
    },

    Tags: ["Hood", "Casual", "Female", "Hat", "Visor Glasses"],

  },

  {
    id: "7877",

    Identity: {
      skin_name: "Adira",
      rarity: "Epic",
    },

    Tags: ["Tactical", "Female", "Unique Hairstyle"],

  },

  {
    id: "9267",

    Identity: {
      skin_name: "Adonis Creed",
      rarity: "Epic",
    },

    Tags: ["Dark Skin", "Male", "Athletic", "Fade", "Shorts"],

  },

  {
    id: "10819",

    Identity: {
      skin_name: "Adventure Peely",
      rarity: "Epic",
    },

    Tags: ["Food", "Peely", "Bandanna", "Cartoon", "Goggles"],

  },

  {
    id: "15577",

    Identity: {
      skin_name: "Aerial Assault Bomber",
      rarity: "Epic",
    },

    Tags: ["Military", "Pilot", "Helmet", "Jacket"],

  },

  {
    id: "261",

    Identity: {
      skin_name: "Midas",
      rarity: "Legendary",
    },

    Tags: ["Male", "Luxury", "Gold"],

   
  },

  {
    id: "589",

    Identity: {
      skin_name: "Peely",
      rarity: "Epic",
    },

    Tags: ["Cartoon", "Food", "Male", "Peely"],

  },

  {
    id: "766",

    Identity: {
      skin_name: "Drift",
      rarity: "Legendary",
    },

    Tags: ["Male", "Streetwear", "Futuristic", "Asian"],

    
  },

  {
    id: "543",

    Identity: {
      skin_name: "Black Widow Outfit",
      rarity: "Marvel",
    },

    Tags: [
      "Female",
      "Marvel",
      "Superhero",
      "Tactical",
      "Short Hair",
      "Military",
      "Weapons",
    ],

  },
];

if (typeof module !== "undefined") {
  module.exports = skins;
}

if (typeof window !== "undefined") {
  window.skins = skins;
}
