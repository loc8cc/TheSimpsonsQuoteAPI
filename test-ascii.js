const Jimp = require('jimp');
const path = require('path');

async function testAscii() {
  try {
    const imagePath = path.join(__dirname, 'public', 'images', 'HomerSimpson.png');
    console.log('Testing ASCII conversion with:', imagePath);

    const image = await Jimp.read(imagePath);
    console.log('Image loaded successfully:', image.getWidth(), 'x', image.getHeight());

    // Simple ASCII conversion test
    image.resize(40, 20);
    let ascii = '';
    for (let y = 0; y < 20; y++) {
      for (let x = 0; x < 40; x++) {
        const color = Jimp.intToRGBA(image.getPixelColor(x, y));
        const gray = Math.round((color.r + color.g + color.b) / 3);
        ascii += gray > 128 ? '#' : '.';
      }
      ascii += '\n';
    }

    console.log('ASCII conversion successful!');
    console.log(ascii.substring(0, 200) + '...');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAscii();