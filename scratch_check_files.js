const fs = require("fs");
const path = require("path");

const filesToCheck = [
  "Gemini_Generated_Image_1sk2gw1sk2gw1sk2_1783272356379.png",
  "ce431aad_f393_4109_a573_ed3d0a78e142_1783621206050.jpg",
  "Gemini_Generated_Image_llgg0allgg0allgg_1783621212945.png",
  "2_1783272038356.png"
];

filesToCheck.forEach(filename => {
  const p = path.join("c:/Users/pc/birlikteydik/public/uploads", filename);
  console.log(`Checking ${filename}:`, fs.existsSync(p) ? "EXISTS" : "MISSING");
});

// Let's also check if public/uploads directory exists and what files are in it
const uploadDir = "c:/Users/pc/birlikteydik/public/uploads";
if (fs.existsSync(uploadDir)) {
  const allFiles = fs.readdirSync(uploadDir);
  console.log(`\nTotal files in public/uploads: ${allFiles.length}`);
  console.log("First 10 files:", allFiles.slice(0, 10));
} else {
  console.log("\npublic/uploads directory does not exist!");
}
