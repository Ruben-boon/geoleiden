# PlaceChase - React Edition

A GeoGuessr-like game built with React, where players guess locations in Leiden using Street View.

## Features

- Street View integration with Google Maps API
- Interactive map for location guessing
- Score tracking and high scores
- Firebase integration for persistent high scores
- Responsive design with Tailwind CSS

## Project Structure

```
src/
├── components/          # React components
│   ├── StreetView.jsx
│   ├── GuessMap.jsx
│   ├── NameEntry.jsx
│   ├── HighScores.jsx
│   ├── HighScoresDisplay.jsx
│   ├── GameControls.jsx
│   └── SetupModal.jsx
├── services/           # External services
│   └── highScoresService.js
├── utils/              # Utility functions
│   ├── constants.js
│   └── locationUtils.js
├── App.jsx            # Main application component
├── index.js           # Application entry point
└── index.css          # Global styles
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure your Google Maps API key in `.env` file as `GOOGLEAPIKEY=your_api_key_here`

3. Start the development server:
```bash
npm start
```

## Build for Production

```bash
npm run build
```

## Components

- **App**: Main application component managing game state
- **StreetView**: Displays Google Street View panorama
- **GuessMap**: Interactive map for location guessing
- **GameControls**: Game controls and score display
- **HighScores**: High scores modal
- **HighScoresDisplay**: Compact high scores sidebar
- **NameEntry**: Player name input modal
- **SetupModal**: Initial setup and API key input

## Services

- **highScoresService**: Manages high scores with Firebase and localStorage fallback

## Utilities

- **locationUtils**: Location generation and distance calculations
- **constants**: Game constants and configuration