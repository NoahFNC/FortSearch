const fs = require("fs");
const https = require("https");
const path = require("path");

// Load the same curated database used by FortSearch.
const skins = require("./data.js");

// data.js stores Fortnite.GG numeric IDs in `id` (or `fortniteGgId`).
// Keep only valid, unique IDs so duplicate entries/styles download once.
const skinIDs = [...new Set(
  skins
    .map((skin) => String(skin.fortniteGgId ?? skin.id ?? "").trim())
    .filter((id) => /^\d+$/.test(id))
)];

const folderPath = path.join(__dirname, "Images", "Skins");
fs.mkdirSync(folderPath, { recursive: true });

function downloadSkin(id) {
  return new Promise((resolve) => {
    const imageURL = `https://fortnite.gg/img/items/${id}/icon.jpg?6`;
    const filePath = path.join(folderPath, `${id}.jpg`);

    if (fs.existsSync(filePath)) {
      console.log(`SKIPPED (already exists): ${id}`);
      resolve();
      return;
    }

    https.get(imageURL, (response) => {
      if (response.statusCode !== 200) {
        console.log(`FAILED: ${id} (HTTP ${response.statusCode})`);
        response.resume();
        resolve();
        return;
      }

      const file = fs.createWriteStream(filePath);
      response.pipe(file);
      file.on("finish", () => {
        file.close(() => {
          console.log(`DOWNLOADED: ${id}`);
          resolve();
        });
      });
      file.on("error", (error) => {
        fs.rm(filePath, { force: true }, () => {});
        console.log(`ERROR writing ${id}: ${error.message}`);
        resolve();
      });
    }).on("error", (error) => {
      console.log(`ERROR downloading ${id}: ${error.message}`);
      resolve();
    });
  });
}

async function startDownloads() {
  console.log(`STARTING DOWNLOADS FOR ${skinIDs.length} UNIQUE SKIN ICONS...`);
  for (const id of skinIDs) await downloadSkin(id);
  console.log("DONE! Icons are saved in Images/Skins.");
}

startDownloads();
