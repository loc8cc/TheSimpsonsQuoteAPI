const express = require('express');
const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');
const port = process.env.PORT || 3000;

const app = express();

// Serve static files from public directory
app.use(express.static(__dirname + '/public'));

// Load quotes from JSON file
const quotesPath = path.join(__dirname, 'quotes.json');
let quotes = [];

try {
  const quotesData = fs.readFileSync(quotesPath, 'utf8');
  quotes = JSON.parse(quotesData);
  console.log(`Loaded ${quotes.length} quotes from quotes.json`);
} catch (error) {
  console.error('Error loading quotes:', error.message);
}
function normalizeText(text) {
  return String(text || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}
// ASCII character sets for different complexity levels
const ASCII_CHARS_SIMPLE = ' .:-=+*#%@';
const ASCII_CHARS_COMPLEX = ' .\'`^",:;Il!i><~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$';

/**
 * Convert image to ASCII art using Jimp
 * @param {string} imagePath - Path to the image file
 * @param {Object} options - Conversion options
 * @returns {Promise<string>} ASCII art as string
 */
async function convertImageToAscii(imagePath, options = {}) {
  const { width = 80, height, complex = false } = options;

  try {
    // Load image with Jimp
    const image = await Jimp.read(imagePath);

    // Resize image maintaining aspect ratio
    const aspectRatio = image.getHeight() / image.getWidth();
    const newWidth = width;
    const newHeight = height || Math.round(newWidth * aspectRatio * 0.5); // *0.5 for terminal aspect ratio

    image.resize(newWidth, newHeight);

    let asciiArt = '';

    // Choose character set
    const chars = complex ? ASCII_CHARS_COMPLEX : ASCII_CHARS_SIMPLE;
    const charLength = chars.length;

    // Process each pixel
    for (let y = 0; y < newHeight; y++) {
      for (let x = 0; x < newWidth; x++) {
        const pixelColor = Jimp.intToRGBA(image.getPixelColor(x, y));
        // Calculate grayscale value
        const gray = Math.round((pixelColor.r + pixelColor.g + pixelColor.b) / 3);
        // Map to ASCII character
        const charIndex = Math.floor((gray / 255) * (charLength - 1));
        asciiArt += chars[charIndex];
      }
      asciiArt += '\n';
    }

    return asciiArt;
  } catch (error) {
    throw new Error(`Failed to convert image to ASCII: ${error.message}`);
  }
}

/**
 * Get random quotes with optional character filter and ASCII conversion
 * Query params:
 *   - count: number of quotes to return (default: 1)
 *   - character: filter by character name (partial match, case-insensitive)
 *   - ascii: if true, convert image to ASCII art (default: false)
 *   - asciiWidth: width for ASCII art (default: 80)
 *   - asciiHeight: height for ASCII art (optional)
 *   - asciiComplex: use complex character set for better detail (default: false)
 */
app.get('/quotes', async (req, res) => {
  try {
    const {
      count,
      character,
      ascii,
      asciiWidth,
      asciiHeight,
      asciiComplex
    } = req.query;

    const numOfQuotes = Number(count) || 1;
    const convertToAscii = ascii === 'true';
    const asciiOptions = {
      width: Number(asciiWidth) || 80,
      height: asciiHeight ? Number(asciiHeight) : undefined,
      complex: asciiComplex === 'true'
    };

    // Filter quotes by character if provided
    let filteredQuotes = quotes;
    if (character) {
      const normalizedCharacter = normalizeText(character);
      filteredQuotes = quotes.filter(q => normalizeText(q.character).includes(normalizedCharacter));
    }

    if (filteredQuotes.length === 0) {
      return res.status(404).json({ error: 'No quotes found for that character' });
    }

    // Get random quotes
    const result = [];
    for (let i = 0; i < Math.min(numOfQuotes, filteredQuotes.length); i++) {
      const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
      const quote = { ...filteredQuotes[randomIndex] };

      // Convert image to ASCII if requested
      if (convertToAscii) {
        try {
          const imagePath = path.join(__dirname, 'public', quote.image);
          const asciiArt = await convertImageToAscii(imagePath, asciiOptions);
          quote.asciiImage = asciiArt;
          // Remove the regular image field when ASCII is requested
          delete quote.image;
        } catch (asciiError) {
          console.error('ASCII conversion failed:', asciiError);
          // Keep original image if ASCII conversion fails
          quote.asciiError = 'Failed to convert image to ASCII';
        }
      }

      result.push(quote);
      // Remove the quote from the pool to avoid duplicates
      filteredQuotes.splice(randomIndex, 1);
    }

    // Set CORS headers
    res.setHeader('Content-Type', 'application/json');
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept'
    );

    // Return single quote if count=1, array otherwise
    if (Number(count) === 1 || !count) {
      res.send(result[0]);
    } else {
      res.send(result);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', quotes: quotes.length });
});

/**
 * Get all available characters
 */
app.get('/characters', (req, res) => {
  const characters = [...new Set(quotes.map(q => q.character))].sort();
  res.json(characters);
});

app.listen(port, () => {
  console.log(`Simpsons Quote API listening on port ${port}`);
  console.log(`Available endpoints:`);
  console.log(`  GET /quotes - Get a random quote`);
  console.log(`  GET /quotes?count=5 - Get 5 random quotes`);
  console.log(`  GET /quotes?character=Homer - Get quotes from Homer Simpson`);
  console.log(`  GET /quotes?ascii=true - Get quote with ASCII art image`);
  console.log(`  GET /quotes?ascii=true&asciiWidth=120&asciiComplex=true - ASCII with custom options`);
  console.log(`  GET /characters - Get list of all characters`);
  console.log(`  GET /health - Health check`);
});
