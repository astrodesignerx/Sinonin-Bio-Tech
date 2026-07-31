import sharp from "sharp";

await sharp("C:/Users/Host/AppData/Local/Temp/opencode/assets/zest-launch.jpg")
  .extract({ left: 0, top: 180, width: 2048, height: 1280 })
  .resize(1280)
  .webp({ quality: 72 })
  .toFile("C:/Users/Host/Documents/Sinonin Bio Tech/public/images/zest-launch.webp");

console.log("zest-launch reprocessed");
