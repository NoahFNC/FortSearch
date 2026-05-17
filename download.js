const fs = require("fs");
const https = require("https");
const path = require("path");


// =========================
// LOAD DATABASE
// =========================

const skins = require("./data.js");


// =========================
// GET IDS AUTOMATICALLY
// =========================

const skinIDs = skins.map((skin) => skin.id);


// =========================
// CREATE FOLDER IF MISSING
// =========================

const folderPath =
  path.join(__dirname, "Images", "Skins");

if (!fs.existsSync(folderPath)) {

  fs.mkdirSync(folderPath, {
    recursive: true,
  });
}


// =========================
// DOWNLOAD FUNCTION
// =========================

function downloadSkin(id) {

  return new Promise((resolve) => {

    const imageURL =
      `https://fortnite.gg/img/items/${id}/icon.jpg?6`;

    const filePath =
      path.join(folderPath, `${id}.jpg`);


    // SKIP IF ALREADY EXISTS
    if (fs.existsSync(filePath)) {

      console.log(`SKIPPED: ${id}`);

      resolve();

      return;
    }


    https
      .get(imageURL, (response) => {

        // FAILED
        if (response.statusCode !== 200) {

          console.log(`FAILED: ${id}`);

          resolve();

          return;
        }


        const file =
          fs.createWriteStream(filePath);

        response.pipe(file);


        file.on("finish", () => {

          file.close();

          console.log(`DOWNLOADED: ${id}`);

          resolve();
        });
      })

      .on("error", (error) => {

        console.log(`ERROR: ${id}`);

        console.log(error);

        resolve();
      });
  });
}


// =========================
// START DOWNLOADS
// =========================

async function startDownloads() {

  console.log("STARTING DOWNLOADS...");

  for (const id of skinIDs) {

    await downloadSkin(id);
  }

  console.log("DONE!");
}


startDownloads();