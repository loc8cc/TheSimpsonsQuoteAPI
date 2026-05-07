# TheSimpsonsQuoteAPI

A simple API that serves random quotes from The Simpsons with character images.

![](./public/images/simpsons.PNG)

## Overview

This is a Node.js Express API that serves Simpsons quotes from a local JSON file with character images served locally. No external dependencies required.

## Features

- Get random quotes
- Filter by character name
- Get multiple quotes at once
- Convert character images to ASCII art
- List all available characters
- CORS enabled
- Health check endpoint
- Docker support

## Running Locally

### Prerequisites
- Node.js 14.x or higher

### Installation

```bash
npm install
npm start
```

The API will start on `http://localhost:3000`

## API Endpoints

### Get a Random Quote
```
GET /quotes
```

Returns a single random quote:
```json
{
  "quote": "They taste like...burning.",
  "character": "Ralph Wiggum",
  "image": "/images/RalphWiggum.png",
  "characterDirection": "Left"
}
```

### Get Multiple Quotes
```
GET /quotes?count=5
```

Returns an array of 5 random quotes.

### Filter by Character
```
GET /quotes?character=homer
```

Returns a quote from a character matching "homer" (case-insensitive, partial match supported):
```json
{
  "quote": "I believe the children are the future... Unless we stop them now!",
  "character": "Homer Simpson",
  "image": "/images/HomerSimpson.png",
  "characterDirection": "Right"
}
```

### Combine Filters
```
GET /quotes?count=10&character=bart
```

Get 10 quotes from Bart Simpson.

### ASCII Art Conversion
```
GET /quotes?ascii=true
```

Returns a quote with the character image converted to ASCII art:
```json
{
  "quote": "They taste like...burning.",
  "character": "Ralph Wiggum",
  "asciiImage": "@@@@@@@@@@@@@@@\n@@@@@@@@@@@@@@@\n...ASCII ART...",
  "characterDirection": "Left"
}
```

#### ASCII Options
- `asciiWidth`: Set ASCII art width (default: 80)
- `asciiHeight`: Set ASCII art height (optional, maintains aspect ratio)
- `asciiComplex`: Use complex character set for better detail (default: false)

Examples:
```
GET /quotes?ascii=true&asciiWidth=120
GET /quotes?ascii=true&asciiComplex=true
GET /quotes?character=homer&ascii=true&asciiWidth=100&asciiHeight=50
```

### Get All Available Characters
```
GET /characters
```

Returns an array of all character names available:
```json
["Apu Nahasapeemapetilon", "Bart Simpson", "Chief Wiggum", ...]
```

### Health Check
```
GET /health
```

Returns API status and quote count:
```json
{
  "status": "healthy",
  "quotes": 45
}
```

## Docker

### Build the Image

```bash
cd ..
docker build -t simpsons-quote-api .
```

### Run the Container

```bash
docker run -p 3000:3000 simpsons-quote-api
```

Then access the API at `http://localhost:3000/quotes`

### Docker Compose (optional)

Create a `docker-compose.yml`:
```yaml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - PORT=3000
```

Run with:
```bash
docker-compose up
```

## Project Structure

```
TheSimpsonsQuoteAPI/
├── app.js                 # Express server
├── quotes.json           # Quote database
├── package.json          # Dependencies
├── public/
│   └── images/           # Character images (served statically)
└── README.md
```

## Response Format

All quote responses include:
- **quote**: The quote text
- **character**: Name of the character who said it
- **image**: Path to the character image (relative to `/public/images`)
- **characterDirection**: Direction the character faces ("Left" or "Right")

## Development

To add more quotes, edit `quotes.json` and restart the server.

Image files should be placed in `public/images/` and referenced in quotes.json like:
```json
{
  "quote": "...",
  "character": "Character Name",
  "image": "/images/CharacterName.png",
  "characterDirection": "Left"
}
```

## License

ISC

`npm install @hpaulson/simpsons-quotes  --registry=https://npm.pkg.github.com/hpaulson`

```js
const simpsons = require('@hpaulson/simpsons-quotes')

simpsons.getQuotes("0")
    .then((q) => {
        console.log(q)
    }).catch((e) => {
        console.error(e)
    })

```
Data Structure:

```js
require('@hpaulson/simpsons-quotes')
    .getQuotes("#") // Promise<Array, QuoteObject>

QuoteObject = {
    quote // String<Quote>
    image // String<ImageLink>
    character // String<Character>
    characterDirection // String<left | right>
}
```

# GoLang
https://github.com/HPaulson/Go-Simpsons-Quotes/
### Usage

`go get https://github.com/HPaulson/Go-Simpsons-Quotes/src`

```go
package main
import (
	"fmt"
	"log"
	simpsons "simpsons/simpsons"
)

func main() {
	data, err := simpsons.GetQuotes("0")
	if err != nil {
		log.Println(err)
	}
	fmt.Println(data[0].Quote)
}
```
Data Structure:

```go
simpsons {
	GetQuotes("<INT>") // Array<{data}>
}
	
data {
	Quote // String<Quote>
	Image // String<IMG_URL>
	Character // String<Character>
	CharacterDirection // String<Left | Right>
}
```
