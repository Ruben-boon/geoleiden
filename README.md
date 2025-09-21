# PlaceChase - GeoGuessr Clone

A single-file React web application that emulates the core functionality of GeoGuessr. Players are presented with Google Street View panoramas and must guess the location by placing a marker on a world map.

## Features

- **Street View Integration**: View 360-degree panoramas from around the world
- **Interactive World Map**: Click to place your location guess
- **Distance Calculation**: See how far off your guess was
- **Scoring System**: Earn points based on accuracy (5000 points for perfect guess)
- **5-Round Game**: Complete 5 rounds to get your final score
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Clean interface built with Tailwind CSS

## Setup Instructions

### 1. Google Maps API Key

You'll need a Google Maps API key with the following APIs enabled:

1. **Maps JavaScript API**
2. **Street View API** 
3. **Geocoding API**

#### How to get an API key:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the APIs listed above
4. Go to "Credentials" and create an API key
5. (Optional) Restrict the API key to your domain for security

### 2. Running the Application

1. Download both files (`index.html` and `app.jsx`) to the same directory
2. Open `index.html` in a web browser
3. Enter your Google Maps API key when prompted
4. Start playing!

## How to Play

1. **Start**: Enter your Google Maps API key and click "Start Game"
2. **View**: Examine the Street View panorama shown at the top of the screen
3. **Guess**: Click anywhere on the world map below to place your guess marker
4. **Submit**: Click "Make Guess" to submit your answer
5. **Results**: See the actual location (red marker), your guess (blue marker), and the distance between them
6. **Score**: Earn points based on accuracy - closer guesses earn more points
7. **Continue**: Click "Next Round" to continue to the next location
8. **Finish**: After 5 rounds, see your final score and play again!

## Scoring System

- **Perfect Guess**: 5000 points
- **Distance Penalty**: -2 points per kilometer
- **Minimum Score**: 0 points (no negative scores)

## Technical Details

- **Framework**: React 18 with functional components and hooks
- **Maps**: Google Maps JavaScript API
- **Styling**: Tailwind CSS
- **Architecture**: Single-file application for easy deployment
- **Responsive**: Mobile-friendly design

## File Structure

```
PlaceChase/
├── index.html          # Main HTML file with CDN dependencies
├── app.jsx            # Complete React application
└── README.md          # This file
```

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Troubleshooting

### API Key Issues
- Ensure all required APIs are enabled in Google Cloud Console
- Check that your API key is correct
- Verify billing is set up (Google Maps APIs require billing)

### Street View Not Loading
- Some locations may not have Street View coverage
- Try refreshing the page
- Check your internet connection

### Map Not Interactive
- Ensure JavaScript is enabled in your browser
- Check browser console for any error messages

## Customization

You can easily customize the game by modifying the `LOCATIONS` array in `app.jsx`:

```javascript
const LOCATIONS = [
    { lat: 40.7128, lng: -74.0060, name: "New York City, USA" },
    // Add your own locations here
];
```

## License

This project is open source and available under the MIT License.

## Credits

- Built with React and Google Maps Platform
- Inspired by GeoGuessr
- Styled with Tailwind CSS
