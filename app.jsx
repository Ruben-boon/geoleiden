const { useState, useEffect, useRef } = React;

// Leiden city boundaries for random location generation
const LEIDEN_BOUNDS = {
    north: 52.1750, // Northern boundary
    south: 52.1500, // Southern boundary  
    east: 4.5200,   // Eastern boundary
    west: 4.4700    // Western boundary
};

// Function to generate random location within Leiden
function generateRandomLeidenLocation() {
    const lat = Math.random() * (LEIDEN_BOUNDS.north - LEIDEN_BOUNDS.south) + LEIDEN_BOUNDS.south;
    const lng = Math.random() * (LEIDEN_BOUNDS.east - LEIDEN_BOUNDS.west) + LEIDEN_BOUNDS.west;
    
    return {
        lat: parseFloat(lat.toFixed(6)),
        lng: parseFloat(lng.toFixed(6)),
        name: `Random Location in Leiden (${lat.toFixed(4)}, ${lng.toFixed(4)})`
    };
}

// Haversine formula for calculating distance between two points
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Returns distance in meters
}

// Scoring function (distance in meters)
function calculateScore(distance) {
    // Convert meters to a score where closer guesses get higher scores
    // Max score of 5000 for perfect guess, decreasing by distance
    return Math.max(0, Math.round(5000 - (distance / 10))); // 10 meters = 1 point deduction
}

// StreetView Component
function StreetView({ currentLocation, apiKey }) {
    const streetViewRef = useRef(null);
    const panoramaRef = useRef(null);

    useEffect(() => {
        if (!currentLocation || !apiKey || !streetViewRef.current || !window.google) return;

        // Force refresh Street View for new location
        if (panoramaRef.current) {
            // Clear the existing panorama
            panoramaRef.current.setMap(null);
            panoramaRef.current = null;
        }

        // Small delay to ensure cleanup, then create new panorama
        setTimeout(() => {
            try {
                            panoramaRef.current = new google.maps.StreetViewPanorama(
                streetViewRef.current,
                {
                    position: currentLocation,
                    pov: {
                        heading: 34,
                        pitch: 10
                    },
                    addressControl: false,
                    linksControl: false,
                    fullscreenControl: false,
                    motionTracking: false,
                    motionTrackingControl: false,
                    zoomControl: false,
                    panControl: false,
                    scrollwheel: false,
                    clickToGo: false,
                    enableCloseButton: false,
                    streetViewControl: false,
                    mapTypeControl: false,
                    scaleControl: false,
                    rotateControl: false,
                    tiltControl: false,
                    keyboardShortcuts: false,
                    disableDefaultUI: true,
                    visible: true,
                    // Hide street names and labels
                    imageDateControl: false,
                    showRoadLabels: false,
                    options: {
                        addressControl: false,
                        fullscreenControl: false,
                        linksControl: false,
                        motionTracking: false,
                        motionTrackingControl: false,
                        panControl: false,
                        scrollwheel: false,
                        zoomControl: false,
                        clickToGo: false,
                        streetViewControl: false,
                        mapTypeControl: false,
                        scaleControl: false,
                        rotateControl: false,
                        tiltControl: false,
                        keyboardShortcuts: false,
                        disableDefaultUI: true,
                        imageDateControl: false,
                        showRoadLabels: false
                    }
                }
            );
            } catch (error) {
                console.error('Error initializing Street View:', error);
            }
        }, 100); // Small delay to ensure proper cleanup
    }, [currentLocation, apiKey]);

    return (
        <div className="relative">
            <div 
                ref={streetViewRef} 
                className="street-view-container w-full rounded-lg shadow-lg"
                style={{ minHeight: '400px' }}
            />
            {!currentLocation && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Street View laden...</p>
                    </div>
                </div>
            )}
            <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-md text-sm">
                Ronde {currentLocation ? 'Actief' : 'Laden...'}
            </div>
        </div>
    );
}

// GuessMap Component
function GuessMap({ 
    gameState, 
    currentLocation, 
    guessLocation, 
    onGuessLocation, 
    apiKey 
}) {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersRef = useRef([]);
    const polylineRef = useRef(null);

    useEffect(() => {
        if (!apiKey || !mapRef.current || !window.google) return;

        // Initialize map
        if (!mapInstanceRef.current) {
            try {
                console.log('Initializing map...');
                mapInstanceRef.current = new google.maps.Map(mapRef.current, {
                    center: { lat: 52.1601, lng: 4.4970 }, // Center of Leiden
                    zoom: 13, // Zoomed in on Leiden
                    mapTypeId: google.maps.MapTypeId.ROADMAP,
                    streetViewControl: false,
                    mapTypeControl: false,
                    fullscreenControl: false,
                    zoomControl: true,
                    gestureHandling: 'cooperative',
                    minZoom: 11, // Prevent zooming out too far from Leiden
                    maxZoom: 18, // Allow detailed zoom for precise guessing
                    clickableIcons: false, // Disable POI clicks
                    styles: [
                        {
                            featureType: 'poi',
                            elementType: 'labels',
                            stylers: [{ visibility: 'off' }]
                        },
                        {
                            featureType: 'transit',
                            elementType: 'labels',
                            stylers: [{ visibility: 'off' }]
                        },
                        {
                            featureType: 'landscape',
                            elementType: 'labels',
                            stylers: [{ visibility: 'off' }]
                        }
                    ]
                });
                console.log('Map initialized successfully');
            } catch (error) {
                console.error('Error initializing map:', error);
                return;
            }
        }

        // Clear previous markers and polyline
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];
        if (polylineRef.current) {
            polylineRef.current.setMap(null);
        }

        // Add simple click listener for guessing
        if (gameState === 'guessing' && mapInstanceRef.current) {
            const clickListener = mapInstanceRef.current.addListener('click', (event) => {
                try {
                    const position = event.latLng;
                    if (position) {
                        onGuessLocation({ lat: position.lat(), lng: position.lng() });
                        
                        // Clear previous guess markers
                        markersRef.current.forEach(marker => marker.setMap(null));
                        markersRef.current = [];
                        
                        // Add new guess marker
                        const guessMarker = new google.maps.Marker({
                            position: position,
                            map: mapInstanceRef.current,
                            icon: {
                                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="12" cy="12" r="10" fill="#3B82F6" stroke="white" stroke-width="2"/>
                                        <circle cx="12" cy="12" r="4" fill="white"/>
                                    </svg>
                                `),
                                scaledSize: new google.maps.Size(24, 24),
                                anchor: new google.maps.Point(12, 12)
                            },
                            title: 'Jouw Gok'
                        });
                        markersRef.current.push(guessMarker);
                    }
                } catch (error) {
                    console.error('Error handling map click:', error);
                }
            });
            
            return () => google.maps.event.removeListener(clickListener);
        }
    }, [gameState, apiKey, onGuessLocation]);

    // Show results
    useEffect(() => {
        if (gameState === 'result' && currentLocation && guessLocation && mapInstanceRef.current && window.google) {
            try {
                // Add actual location marker
                const actualMarker = new google.maps.Marker({
                    position: currentLocation,
                    map: mapInstanceRef.current,
                    icon: {
                        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="10" fill="#EF4444" stroke="white" stroke-width="2"/>
                                <circle cx="12" cy="12" r="4" fill="white"/>
                            </svg>
                        `),
                        scaledSize: new google.maps.Size(24, 24),
                        anchor: new google.maps.Point(12, 12)
                    },
                    title: 'Actual Location'
                });
                markersRef.current.push(actualMarker);

                // Add guess marker if not already present
                if (markersRef.current.length === 1) {
                    const guessMarker = new google.maps.Marker({
                        position: guessLocation,
                        map: mapInstanceRef.current,
                        icon: {
                            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="12" cy="12" r="10" fill="#3B82F6" stroke="white" stroke-width="2"/>
                                    <circle cx="12" cy="12" r="4" fill="white"/>
                                </svg>
                            `),
                            scaledSize: new google.maps.Size(24, 24),
                            anchor: new google.maps.Point(12, 12)
                        },
                        title: 'Your Guess'
                    });
                    markersRef.current.push(guessMarker);
                }

                // Draw line between points
                polylineRef.current = new google.maps.Polyline({
                    path: [currentLocation, guessLocation],
                    geodesic: true,
                    strokeColor: '#FF6B6B',
                    strokeOpacity: 1.0,
                    strokeWeight: 3,
                    map: mapInstanceRef.current
                });

                // Fit bounds to show both markers
                const bounds = new google.maps.LatLngBounds();
                bounds.extend(currentLocation);
                bounds.extend(guessLocation);
                mapInstanceRef.current.fitBounds(bounds);
            } catch (error) {
                console.error('Error showing results:', error);
            }
        }
    }, [gameState, currentLocation, guessLocation]);

    return (
        <div className="relative">
            <div 
                ref={mapRef} 
                className="map-container w-full rounded-lg shadow-lg"
                style={{ pointerEvents: 'auto' }}
            />
            <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-md text-sm">
                {gameState === 'guessing' ? 'Klik om je gok te plaatsen' : 'Resultaten'}
            </div>
        </div>
    );
}

// NameEntry Component
function NameEntry({ isVisible, score, totalDistance, onSubmit, onSkip }) {
    const [playerName, setPlayerName] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (playerName.trim()) {
            onSubmit(playerName.trim());
        }
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Spel Afgelopen!</h2>
                <div className="text-center mb-6">
                    <p className="text-lg text-gray-600 mb-2">Eindscore: {score}</p>
                    <p className="text-md text-gray-600">Totale Afstand: {Math.round(totalDistance)} m</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Voer je naam in als Leidse glibber:
                        </label>
                        <input
                            type="text"
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                            placeholder="Leidse glibber"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            maxLength={20}
                            autoFocus
                        />
                    </div>
                    <div className="flex space-x-3">
                        <button
                            type="submit"
                            disabled={!playerName.trim()}
                            className={`flex-1 py-2 px-4 rounded-md transition-colors ${
                                playerName.trim() 
                                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                        >
                            Score Opslaan
                        </button>
                        <button
                            type="button"
                            onClick={onSkip}
                            className="flex-1 py-2 px-4 rounded-md bg-gray-600 text-white hover:bg-gray-700 transition-colors"
                        >
                            Overslaan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// HighScores Component
function HighScores({ isVisible, onClose }) {
    const [highScores, setHighScores] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isVisible) {
            loadHighScores();
        }
    }, [isVisible]);

    const loadHighScores = async () => {
        setLoading(true);
        try {
            const scores = await window.highScoresService.getFormattedHighScores();
            setHighScores(scores);
        } catch (error) {
            console.error('Error loading high scores:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">Top Leidse Glibbers</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                        ×
                    </button>
                </div>
                
                {loading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p className="text-gray-600">Scores laden...</p>
                    </div>
                ) : highScores.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-600">Nog geen scores!</p>
                        <p className="text-sm text-gray-500 mt-2">Wees de eerste die een record zet!</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {highScores.map((score, index) => (
                            <div 
                                key={score.id}
                                className={`flex justify-between items-center p-3 rounded-lg ${
                                    index === 0 ? 'bg-yellow-50 border-2 border-yellow-200' :
                                    index === 1 ? 'bg-gray-50 border-2 border-gray-200' :
                                    index === 2 ? 'bg-orange-50 border-2 border-orange-200' :
                                    'bg-gray-50'
                                }`}
                            >
                                <div className="flex items-center space-x-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                        index === 0 ? 'bg-yellow-400 text-white' :
                                        index === 1 ? 'bg-gray-400 text-white' :
                                        index === 2 ? 'bg-orange-400 text-white' :
                                        'bg-gray-300 text-gray-700'
                                    }`}>
                                        {index + 1}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800">{score.playerName}</p>
                                        <p className="text-xs text-gray-500">{score.formattedDate}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-lg text-gray-800">{Math.round(score.totalDistance)} m</p>
                                    <p className="text-xs text-gray-500">{score.rounds} rounds</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// Compact HighScoresDisplay Component for sidebar
function HighScoresDisplay({ onShowFullHighScores }) {
    const [highScores, setHighScores] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadHighScores();
    }, []);

    const loadHighScores = async () => {
        setLoading(true);
        try {
            const scores = await window.highScoresService.getFormattedHighScores();
            setHighScores(scores.slice(0, 5)); // Show top 5 only
        } catch (error) {
            console.error('Error loading high scores:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-4 w-full">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-gray-800">Top Glibbers</h3>
                <button
                    onClick={onShowFullHighScores}
                    className="text-sm text-blue-600 hover:text-blue-800"
                >
                    Bekijk Alles
                </button>
            </div>
            
            {loading ? (
                <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                </div>
            ) : highScores.length === 0 ? (
                <div className="text-center py-4">
                    <p className="text-sm text-gray-600">Nog geen scores!</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {highScores.map((score, index) => (
                        <div 
                            key={score.id}
                            className={`flex justify-between items-center p-2 rounded ${
                                index === 0 ? 'bg-yellow-50' :
                                index === 1 ? 'bg-gray-50' :
                                index === 2 ? 'bg-orange-50' :
                                'bg-gray-50'
                            }`}
                        >
                            <div className="flex items-center space-x-2">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                    index === 0 ? 'bg-yellow-400 text-white' :
                                    index === 1 ? 'bg-gray-400 text-white' :
                                    index === 2 ? 'bg-orange-400 text-white' :
                                    'bg-gray-300 text-gray-700'
                                }`}>
                                    {index + 1}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-800">{score.playerName}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-gray-800">{Math.round(score.totalDistance)} m</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// GameControls Component for right sidebar
function GameControls({ 
    gameState, 
    score, 
    round, 
    distance, 
    roundScore, 
    totalDistance,
    timeLeft,
    onGuess, 
    onNextRound, 
    onNewGame,
    guessLocation,
    onShowHighScores
}) {
    return (
        <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-lg p-4">
                <div className="text-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">Score: {score}</h2>
                    <p className="text-sm text-gray-600">Ronde {round}/3</p>
                    {totalDistance > 0 && (
                        <p className="text-xs text-gray-500">Totale Afstand: {Math.round(totalDistance)} m</p>
                    )}
                    {gameState === 'guessing' && (
                        <p className={`text-sm font-bold ${timeLeft <= 5 ? 'text-red-600' : 'text-blue-600'}`}>
                            Tijd: {timeLeft}s
                        </p>
                    )}
                </div>
                
                {gameState === 'guessing' && (
                    <div className="space-y-2">
                        {guessLocation && (
                            <p className="text-sm text-green-600 text-center">
                                ✓ Gok geplaatst! Timer gebruikt automatisch je gok.
                            </p>
                        )}
                        <button
                            onClick={onGuess}
                            disabled={!guessLocation}
                            className={`w-full py-2 px-4 rounded-md transition-colors ${
                                guessLocation 
                                    ? 'bg-green-600 text-white hover:bg-green-700' 
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                        >
                            {guessLocation ? 'Gok Nu Bevestigen' : 'Plaats eerst een gok op de kaart'}
                        </button>
                    </div>
                )}
                
                {gameState === 'result' && (
                    <div className="space-y-3">
                        <div className="text-center">
                            <p className="text-sm text-gray-600">Afstand</p>
                            <p className="text-lg font-semibold text-gray-800">
                                {distance ? `${Math.round(distance)} m` : 'Berekenen...'}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-600">Punten</p>
                            <p className="text-lg font-semibold text-green-600">
                                +{roundScore}
                            </p>
                        </div>
                        <button
                            onClick={onNextRound}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                        >
                            {round < 3 ? 'Volgende Ronde' : 'Spel Afmaken'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

// Setup Modal Component
function SetupModal({ onStartGame }) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
                <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
                    PlaceChase
                </h1>
                <p className="text-gray-600 text-center mb-6">
                    Welkom bij PlaceChase! Raad de locatie in Street View door op de kaart te klikken. Je hebt 30 seconden per ronde!
                </p>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Google Maps API Sleutel
                        </label>
                        <input
                            type="password"
                            placeholder="Voer je API sleutel in"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            id="apiKeyInput"
                        />
                    </div>
                    <button
                        onClick={() => {
                            const apiKey = document.getElementById('apiKeyInput').value;
                            if (apiKey.trim()) {
                                onStartGame(apiKey);
                            } else {
                                alert('Voer een geldige API sleutel in');
                            }
                        }}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Spel Starten
                    </button>
                </div>
                <p className="text-xs text-gray-500 mt-4 text-center">
                    Je hebt een Google Maps API sleutel nodig met Maps JavaScript API, Street View API, en Geocoding API ingeschakeld.
                </p>
            </div>
        </div>
    );
}

// Main App Component
function App() {
    const [apiKey, setApiKey] = useState('');
    const [gameState, setGameState] = useState('setup'); // 'setup', 'loading', 'guessing', 'result'
    const [currentLocation, setCurrentLocation] = useState(null);
    const [guessLocation, setGuessLocation] = useState(null);
    const [score, setScore] = useState(0);
    const [round, setRound] = useState(1);
    const [distance, setDistance] = useState(null);
    const [roundScore, setRoundScore] = useState(0);
    const [totalDistance, setTotalDistance] = useState(0);
    const [usedLocations, setUsedLocations] = useState([]);
    const [gameComplete, setGameComplete] = useState(false);
    const [mapsLoaded, setMapsLoaded] = useState(false);
    const [showNameEntry, setShowNameEntry] = useState(false);
    const [showHighScores, setShowHighScores] = useState(false);
    const [timeLeft, setTimeLeft] = useState(30);
    const [timerActive, setTimerActive] = useState(false);

    // Load Google Maps API
    useEffect(() => {
        if (!apiKey) return;

        // Remove any existing Google Maps scripts
        const existingScripts = document.querySelectorAll(`script[src*="maps.googleapis.com"]`);
        existingScripts.forEach(script => script.remove());

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly&libraries=geometry`;
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
            console.log('Google Maps API loaded successfully');
            setGameState('loading');
            // Wait for Google Maps to fully initialize
            setTimeout(() => {
                if (window.google && window.google.maps) {
                    console.log('Google Maps is ready');
                    setMapsLoaded(true);
                    startNewRound();
                } else {
                    console.error('Google Maps not properly initialized');
                    alert('Google Maps failed to initialize properly. Please check your API key and try again.');
                    setGameState('setup');
                    setMapsLoaded(false);
                }
            }, 500);
        };
        
        script.onerror = () => {
            console.error('Failed to load Google Maps API');
            alert('Failed to load Google Maps API. Please check your API key and internet connection.');
            setGameState('setup');
            setMapsLoaded(false);
        };
        
        document.head.appendChild(script);

        return () => {
            const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
            if (existingScript) {
                existingScript.remove();
            }
        };
    }, [apiKey]);

    // Timer effect
    useEffect(() => {
        let interval = null;
        if (timerActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(timeLeft => timeLeft - 1);
            }, 1000);
        } else if (timeLeft === 0 && timerActive) {
            // Tijd is op - check of er al een gok is geplaatst
            setTimerActive(false);
            
            if (guessLocation && currentLocation) {
                // Er is al een gok geplaatst, gebruik die
                const calculatedDistance = calculateDistance(
                    currentLocation.lat, currentLocation.lng,
                    guessLocation.lat, guessLocation.lng
                );
                
                const calculatedScore = calculateScore(calculatedDistance);
                
                setDistance(calculatedDistance);
                setRoundScore(calculatedScore);
                setScore(prev => prev + calculatedScore);
                setTotalDistance(prev => prev + calculatedDistance);
            } else {
                // Geen gok geplaatst, geef penalty
                const penaltyDistance = 2000; // 2000 meter penalty
                setDistance(penaltyDistance);
                setRoundScore(0);
                setTotalDistance(prev => prev + penaltyDistance);
            }
            
            setGameState('result');
        }
        return () => clearInterval(interval);
    }, [timerActive, timeLeft, guessLocation, currentLocation]);

    // Global function to start game
    window.startGame = (key) => {
        setApiKey(key);
        setMapsLoaded(false);
        setGameState('guessing');
    };

    // Auto-start with API key from config if available
    useEffect(() => {
        // Try to get API key from config
        const configApiKey = window.PLACECHASE_CONFIG?.GOOGLE_API_KEY;
        if (configApiKey && configApiKey !== 'your_actual_api_key_here') {
            setApiKey(configApiKey);
            setMapsLoaded(false);
            setGameState('guessing');
        }
    }, []);

    const selectRandomLocation = () => {
        // Generate a completely random location within Leiden
        const randomLocation = generateRandomLeidenLocation();
        
        // Add to used locations to avoid exact duplicates (very unlikely but possible)
        setUsedLocations(prev => [...prev, randomLocation]);
        
        return randomLocation;
    };

    const startNewRound = () => {
        const newLocation = selectRandomLocation();
        setCurrentLocation(newLocation);
        setGuessLocation(null);
        setGameState('guessing');
        setDistance(null);
        setRoundScore(0);
        setTimeLeft(30);
        setTimerActive(true);
    };

    const handleGuess = () => {
        if (!guessLocation || !currentLocation) return;

        setTimerActive(false); // Stop de timer

        const calculatedDistance = calculateDistance(
            currentLocation.lat, currentLocation.lng,
            guessLocation.lat, guessLocation.lng
        );
        
        const calculatedScore = calculateScore(calculatedDistance);
        
        setDistance(calculatedDistance);
        setRoundScore(calculatedScore);
        setScore(prev => prev + calculatedScore);
        setTotalDistance(prev => prev + calculatedDistance);
        setGameState('result');
    };

    const handleNextRound = () => {
        if (round >= 3) {
            setShowNameEntry(true);
            setGameState('complete');
        } else {
            setRound(prev => prev + 1);
            startNewRound();
        }
    };

    const handleNameSubmit = async (playerName) => {
        try {
            const result = await window.highScoresService.addHighScore(playerName, score, totalDistance, 3);
            if (result.success) {
                setShowNameEntry(false);
                setGameComplete(true);
                setShowHighScores(true);
            } else {
                console.error('Failed to save high score:', result.error);
                setShowNameEntry(false);
                setGameComplete(true);
            }
        } catch (error) {
            console.error('Error saving high score:', error);
            setShowNameEntry(false);
            setGameComplete(true);
        }
    };

    const handleNewGame = () => {
        setScore(0);
        setRound(1);
        setTotalDistance(0);
        setUsedLocations([]);
        setGameComplete(false);
        setShowNameEntry(false);
        setShowHighScores(false);
        setGameState('loading');
        setMapsLoaded(false);
        setTimeLeft(30);
        setTimerActive(false);
        
        // Wait for Google Maps to be ready, then start a new round
        setTimeout(() => {
            if (window.google && window.google.maps) {
                console.log('Google Maps is ready for new game');
                setMapsLoaded(true);
                startNewRound();
            } else {
                console.error('Google Maps not ready for new game');
                // Retry after a short delay
                setTimeout(() => {
                    if (window.google && window.google.maps) {
                        setMapsLoaded(true);
                        startNewRound();
                    } else {
                        console.error('Google Maps still not ready, starting anyway');
                        setMapsLoaded(true);
                        startNewRound();
                    }
                }, 1000);
            }
        }, 100);
    };

    if (gameComplete && !showNameEntry) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4 text-center">
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">Spel Afgelopen!</h1>
                    <p className="text-xl text-gray-600 mb-2">Eindscore: {score}</p>
                    <p className="text-lg text-gray-600 mb-6">Totale Afstand: {Math.round(totalDistance)} m</p>
                    <div className="space-y-3">
                        <button
                            onClick={handleNewGame}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Opnieuw Spelen
                        </button>
                        <button
                            onClick={() => {
                                setScore(0);
                                setRound(1);
                                setTotalDistance(0);
                                setUsedLocations([]);
                                setGameComplete(false);
                                setShowNameEntry(false);
                                setShowHighScores(false);
                                setGameState('setup');
                                setApiKey('');
                                setMapsLoaded(false);
                                setTimeLeft(30);
                                setTimerActive(false);
                            }}
                            className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
                        >
                            Terug naar Setup
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Show loading state
    if (gameState === 'loading') {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Google Maps laden...</h2>
                    <p className="text-gray-600">Even wachten terwijl we het spel initialiseren.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Setup Modal */}
            {gameState === 'setup' && (
                <SetupModal onStartGame={(key) => {
                    setApiKey(key);
                    setMapsLoaded(false);
                    setGameState('guessing');
                }} />
            )}
            
            {/* Name Entry Modal */}
            <NameEntry 
                isVisible={showNameEntry}
                score={score}
                totalDistance={totalDistance}
                onSubmit={handleNameSubmit}
                onSkip={() => {
                    setShowNameEntry(false);
                    setGameComplete(true);
                }}
            />
            
            {/* High Scores Modal */}
            <HighScores 
                isVisible={showHighScores}
                onClose={() => setShowHighScores(false)}
            />
            
            {/* Main Game Layout */}
            {gameState !== 'setup' && (
                <div className="flex h-screen">
                    {/* Left Side - Street View and Map */}
                    <div className="flex-1 p-4 space-y-4">
                    {mapsLoaded && currentLocation && (
                        <>
                            <StreetView 
                                currentLocation={currentLocation} 
                                apiKey={apiKey} 
                            />
                            <GuessMap
                                gameState={gameState}
                                currentLocation={currentLocation}
                                guessLocation={guessLocation}
                                onGuessLocation={setGuessLocation}
                                apiKey={apiKey}
                            />
                        </>
                    )}
                </div>
                
                    {/* Right Side - Controls and High Scores */}
                    <div className="w-80 p-4 flex flex-col space-y-4">
                        <GameControls
                            gameState={gameState}
                            score={score}
                            round={round}
                            distance={distance}
                            roundScore={roundScore}
                            totalDistance={totalDistance}
                            timeLeft={timeLeft}
                            onGuess={handleGuess}
                            onNextRound={handleNextRound}
                            onNewGame={handleNewGame}
                            guessLocation={guessLocation}
                            onShowHighScores={() => setShowHighScores(true)}
                        />
                        
                        <HighScoresDisplay 
                            onShowFullHighScores={() => setShowHighScores(true)}
                        />
                        
                        {/* Leiden Logo */}
                        <div className="mt-auto">
                            <img 
                                src="logo_leiden.jpg" 
                                alt="Leiden Logo" 
                                className="w-full rounded-lg shadow-sm"
                />
            </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Render the app with React 18 createRoot
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
