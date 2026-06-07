const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, '..', 'img', 'cars');
const outFile = path.join(__dirname, '..', 'data', 'images.json');

function listImages() {
  if (!fs.existsSync(imagesDir)) {
    console.error('Images directory not found:', imagesDir);
    process.exit(2);
  }
  const files = fs.readdirSync(imagesDir).filter(f => {
    const ext = path.extname(f).toLowerCase();
    return ['.png', '.jpg', '.jpeg', '.webp', '.gif'].includes(ext);
  });
  fs.writeFileSync(outFile, JSON.stringify(files, null, 2));
  console.log('Wrote', outFile, 'with', files.length, 'entries');
}

listImages();
