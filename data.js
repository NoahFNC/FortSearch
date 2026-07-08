// =========================
// DATABASE
// =========================

const skins = [
  {
    id: "8086",

    isEditStyle: false,
    icon: undefined,
    video: undefined,

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

    SearchableTerms: [],
  },

  {
    id: "15288",

    isEditStyle: false,
    icon: undefined,
    video: undefined,

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

    SearchableTerms: [],
  },

  {
    id: "15288",

    isEditStyle: true,
    
    icon: "https://static.wikia.nocookie.net/fortnite/images/9/9f/1-Ball_%28Jacket_-_On%29_-_Outfit_-_Fortnite.png/revision/latest?cb=20241102100317",
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

    SearchableTerms: [],
  },

  {
    id: "15282",

    Identity: {
      skin_name: "10-Ball",
      rarity: "Epic",
    },

    Tags: [
      "Knee Pads",
      "Elbow Pads",
      "Chestplate",
      "Tactical",
      "Slim",
      "Armor",
      "Armored Boots",
      "Female",
      "Clean Gloves",
      "Helmet",
      "Tactical",
      "Ponytail",
      "Tactical Belt",
    ],

    SearchableTerms: ["tactical armour"],
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

    SearchableTerms: [],
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

    SearchableTerms: [""],
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

    SearchableTerms: ["band gorillaz"],
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

    SearchableTerms: [""],
  },

  {
    id: "19852",

    Identity: {
      skin_name: "7-Ball",
      rarity: "Epic",
    },

    Tags: [],

    SearchableTerms: [],
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

    SearchableTerms: ["tactical armour"],
  },

  {
    id: "8459",

    Identity: {
      skin_name: "A Goat",
      rarity: "Gaming Legends Series",
    },

    Tags: ["Animal", "Goat", "Casual", "Unisex"],

    SearchableTerms: ["Horns", "converse", "jeans", "skinny jeans"],
  },

  {
    id: "662",

    Identity: {
      skin_name: "A.I.M.",
      rarity: "Legendary",
    },

    Tags: ["Futuristic", "Apocalyptic", "Male", "Cyborg", "Robot"],

    SearchableTerms: ["machine"],
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

    SearchableTerms: ["Necklace", "Earrings"],
  },

  {
    id: "11910",

    Identity: {
      skin_name: "Aang",
      rarity: "Epic",
    },

    Tags: ["Young Male", "Cartoon", "Asian", "Toga"],

    SearchableTerms: ["Toga", "Monk", "Bald"],
  },

  {
    id: "6009",

    Identity: {
      skin_name: "Absenz",
      rarity: "Rare",
    },

    Tags: ["Horror", "Hood", "Male"],

    SearchableTerms: ["Leather"],
  },

  {
    id: "891",

    Identity: {
      skin_name: "Absolute Zero",
      rarity: "Rare",
    },

    Tags: ["Defualt", "Goggles", "Facial Hair", "Male"],

    SearchableTerms: ["Artic"],
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

    SearchableTerms: [""],
  },

  {
    id: "8557",

    Identity: {
      skin_name: "Abyss",
      rarity: "Epic",
    },

    Tags: ["Female", "Ponytail", "Braids", "Earrings"],

    SearchableTerms: ["eyes", "braids", "bell bottoms"],
  },

  {
    id: "9668",

    Identity: {
      skin_name: "Ace Academic",
      rarity: "Epic",
    },

    Tags: ["Cell shaded", "School", "Female", "Skirt", "Casual", "Short Hair"],

    SearchableTerms: ["Academy"],
  },

  {
    id: "16685",

    Identity: {
      skin_name: "Aces Wild Card",
      rarity: "Epic",
    },

    Tags: ["Male", "Luxury", "Suit", "Mask"],

    SearchableTerms: [""],
  },

  {
    id: "22472",

    Identity: {
      skin_name: "Adam Smasher",
      rarity: "Epic",
    },

    Tags: ["Futuristic", "Cyborg", "Male", "Robot"],

    SearchableTerms: [""],
  },

  {
    id: "11323",

    Identity: {
      skin_name: "Adanna of the Deep",
      rarity: "Rare",
    },

    Tags: ["Female", "Nose Ring", "Dreads", "Piercings", "Nails", "Dark Skin"],

    SearchableTerms: [""],
  },

  {
    id: "148",

    Identity: {
      skin_name: "Adeline",
      rarity: "Rare",
    },

    Tags: ["Hood", "Casual", "Female", "Hat", "Visor Glasses"],

    SearchableTerms: [""],
  },

  {
    id: "7877",

    Identity: {
      skin_name: "Adira",
      rarity: "Epic",
    },

    Tags: ["Tactical", "Female", "Unique Hairstyle"],

    SearchableTerms: [""],
  },

  {
    id: "9267",

    Identity: {
      skin_name: "Adonis Creed",
      rarity: "Epic",
    },

    Tags: ["Dark Skin", "Male", "Athletic", "Fade", "Shorts"],

    SearchableTerms: ["Boxing", "Boxer"],
  },

  {
    id: "10819",

    Identity: {
      skin_name: "Adventure Peely",
      rarity: "Epic",
    },

    Tags: ["Food", "Peely", "Bandanna", "Cartoon", "Goggles"],

    SearchableTerms: ["banana", "yellow", "cartoon"],
  },

  {
    id: "15577",

    Identity: {
      skin_name: "Aerial Assault Bomber",
      rarity: "Epic",
    },

    Tags: ["Military", "Pilot", "Helmet", "Jacket"],

    SearchableTerms: [""],
  },

  {
    id: "261",

    Identity: {
      skin_name: "Midas",
      rarity: "Legendary",
    },

    Tags: ["Male", "Luxury", "Gold"],

    SearchableTerms: [
      "gold chain",
      "necklace",
      "gold necklace",
      "slicked hair",
      "dress shirt",
      "watch",
      "blonde hair",
      "tattoos",
      "suit",
      "rich",
      "boss",
    ],
  },

  {
    id: "589",

    Identity: {
      skin_name: "Peely",
      rarity: "Epic",
    },

    Tags: ["Cartoon", "Food", "Male", "Peely"],

    SearchableTerms: ["banana", "yellow", "cartoon"],
  },

  {
    id: "766",

    Identity: {
      skin_name: "Drift",
      rarity: "Legendary",
    },

    Tags: ["Male", "Streetwear", "Futuristic", "Asian"],

    SearchableTerms: [
      "hoodie",
      "mask",
      "pink jacket",
      "streetwear",
      "anime hair",
      "white sneakers",
      "kitsune",
      "fox mask",
      "jacket",
      "sun glasses",
    ],
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

    SearchableTerms: ["short hair", "red hair"],
  },
];

if (typeof module !== "undefined") {
  module.exports = skins;
}

if (typeof window !== "undefined") {
  window.skins = skins;
}
