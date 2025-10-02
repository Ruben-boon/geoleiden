import React, { useState, useEffect } from "react";
import {
  generateRandomLeidenLocation,
  calculateDistance,
} from "./utils/locationUtils";
import highScoresService from "./services/highScoresService";
import StreetView from "./components/StreetView";
import GuessMap from "./components/GuessMap";
import NameEntry from "./components/NameEntry";
import HighScores from "./components/HighScores";
import HighScoresDisplay from "./components/HighScoresDisplay";
import GameControls from "./components/GameControls";
import SetupModal from "./components/SetupModal";
import WelcomeScreen from "./components/WelcomeScreen";
import DailyLimitModal from "./components/DailyLimitModal";
import "./App.scss";

const App = () => {
  const [apiKey, setApiKey] = useState("");
  const [gameState, setGameState] = useState("welcome");
  const [currentLocation, setCurrentLocation] = useState(null);
  const [actualStreetViewLocation, setActualStreetViewLocation] =
    useState(null);
  const [streetViewReady, setStreetViewReady] = useState(false);
  const [streetViewError, setStreetViewError] = useState(false);
  const [guessLocation, setGuessLocation] = useState(null);
  const [round, setRound] = useState(1);
  const [distance, setDistance] = useState(null);
  const [totalDistance, setTotalDistance] = useState(0);
  const [usedLocations, setUsedLocations] = useState([]);
  const [gameComplete, setGameComplete] = useState(false);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [showNameEntry, setShowNameEntry] = useState(false);
  const [showHighScores, setShowHighScores] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [timerActive, setTimerActive] = useState(false);

  const loadGoogleMaps = () => {
    if (!apiKey) {
      return;
    }

    const existingScripts = document.querySelectorAll(
      `script[src*="maps.googleapis.com"]`
    );
    existingScripts.forEach((script) => script.remove());
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly&libraries=geometry`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      setTimeout(() => {
        if (window.google && window.google.maps) {
          setMapsLoaded(true);
          startNewRound();
        } else {
          console.error("❌ GOOGLE MAPS NOT PROPERLY INITIALIZED");
          alert(
            "Google Maps failed to initialize properly. Please check your API key and try again."
          );
          setGameState("setup");
          setMapsLoaded(false);
        }
      }, 500);
    };

    script.onerror = () => {
      console.error("❌ FAILED TO LOAD GOOGLE MAPS API");
      alert(
        "Failed to load Google Maps API. Please check your API key and internet connection."
      );
      setGameState("setup");
      setMapsLoaded(false);
    };

    document.head.appendChild(script);
  };

  useEffect(() => {
    let interval = null;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((timeLeft) => timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerActive) {
      setTimerActive(false);

      if (guessLocation && actualStreetViewLocation) {
        const calculatedDistance = calculateDistance(
          actualStreetViewLocation.lat,
          actualStreetViewLocation.lng,
          guessLocation.lat,
          guessLocation.lng
        );

        setDistance(calculatedDistance);
        setTotalDistance((prev) => prev + calculatedDistance);
      } else {
        const penaltyDistance = 2000;
        setDistance(penaltyDistance);
        setTotalDistance((prev) => prev + penaltyDistance);
      }

      setGameState("result");
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft, guessLocation, currentLocation]);

  window.startGame = (key) => {
    setApiKey(key);
    setMapsLoaded(false);
    setGameState("guessing");
  };

  // Set up dynamic viewport height for mobile browsers
  useEffect(() => {
    const setViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setViewportHeight();
    window.addEventListener('resize', setViewportHeight);
    window.addEventListener('orientationchange', setViewportHeight);

    return () => {
      window.removeEventListener('resize', setViewportHeight);
      window.removeEventListener('orientationchange', setViewportHeight);
    };
  }, []);

  useEffect(() => {
    const envApiKey = process.env.GOOGLEAPIKEY || process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
    
    // Check if API key exists and is not a placeholder
    const isValidApiKey = envApiKey && 
      envApiKey !== "your_actual_api_key_here" && 
      envApiKey !== "your_google_maps_api_key_here" &&
      envApiKey !== "undefined" &&
      envApiKey !== "null" &&
      envApiKey.length > 10; // Basic validation for API key length
    
    if (isValidApiKey) {
      setApiKey(envApiKey);
      setMapsLoaded(false);
      // Keep welcome screen even with valid API key
    } else {
      // Still show welcome screen, but will need setup later
    }
  }, []);

  const selectRandomLocation = () => {
    const randomLocation = generateRandomLeidenLocation();
    setUsedLocations((prev) => [...prev, randomLocation]);
    return randomLocation;
  };

  const startNewRound = () => {
    const newLocation = selectRandomLocation();
    setCurrentLocation(newLocation);
    setActualStreetViewLocation(null); // Reset actual Street View location
    setStreetViewReady(false); // Reset Street View ready state
    setStreetViewError(false); // Reset error state
    setGuessLocation(null);
    setGameState("guessing");
    setDistance(null);
    setTimeLeft(30);
    setTimerActive(true);

  };

  const handleGuess = () => {
    if (!guessLocation || !currentLocation) return;

    setTimerActive(false);

    // Always use actual Street View location as the target - this is the real position
    if (!actualStreetViewLocation) {
      console.warn(
        "⚠️ No actual Street View location available, cannot proceed without Street View data"
      );
      setStreetViewError(true);
      return;
    }

    const actualLocation = actualStreetViewLocation;

    const calculatedDistance = calculateDistance(
      actualLocation.lat,
      actualLocation.lng,
      guessLocation.lat,
      guessLocation.lng
    );

    console.log("Game result:", {
      actualLocation: {
        lat: actualLocation.lat,
        lng: actualLocation.lng,
        source: "STREET_VIEW",
      },
      generatedLocation: {
        lat: currentLocation.lat,
        lng: currentLocation.lng,
        source: "GENERATED",
      },
      guessLocation: {
        lat: guessLocation.lat,
        lng: guessLocation.lng,
      },
      distance: calculatedDistance,
      usingActualStreetView: true,
      streetViewReady: streetViewReady,
      locationDifference: {
        latDiff: Math.abs(actualLocation.lat - currentLocation.lat),
        lngDiff: Math.abs(actualLocation.lng - currentLocation.lng),
        distanceBetweenGeneratedAndActual: calculateDistance(
          currentLocation.lat,
          currentLocation.lng,
          actualLocation.lat,
          actualLocation.lng
        )
      }
    });

    setDistance(calculatedDistance);
    setTotalDistance((prev) => prev + calculatedDistance);
    setGameState("result");
  };

  const handleNextRound = () => {
    if (round >= 3) {
      setShowNameEntry(true);
      setGameState("complete");
    } else {
      setRound((prev) => prev + 1);
      startNewRound();
    }
  };

  const handleNameSubmit = async (playerName) => {
    // The NameEntry component already handles score saving via checkAndUpdateScore
    // So we just need to proceed with the game flow
    setShowNameEntry(false);
    setGameComplete(true);
    setShowHighScores(true);
  };

  const handleNewGame = () => {
    setRound(1);
    setTotalDistance(0);
    setUsedLocations([]);
    setGameComplete(false);
    setShowNameEntry(false);
    setShowHighScores(false);
    setGameState("welcome");
    setMapsLoaded(false);
    setTimeLeft(30);
    setTimerActive(false);
  };

  const handleWelcomeStart = () => {
    if (!apiKey) {
      setGameState("setup");
      return;
    }

    setGameState("loading");
    setMapsLoaded(false);
    loadGoogleMaps();
  };

  if (gameComplete && !showNameEntry) {
    return (
      <div className="app__game-complete">
        <div className="app__game-complete-container">
          <h1 className="app__game-complete-title">
            Spel Afgelopen!
          </h1>
          <p className="app__game-complete-distance">
            Totale Afstand: {Math.round(totalDistance)} m
          </p>
          <div className="app__game-complete-buttons">
            <button
              onClick={handleNewGame}
              className="app__game-complete-button"
            >
              Nog een keer spelen
            </button>
          </div>
        </div>
        <div className="app__game-complete-leaderboard">
          <HighScoresDisplay />
        </div>
      </div>
    );
  }

  if (gameState === "loading") {
    return (
      <div className="app__loading">
        <div className="app__loading-container">
          <div className="app__loading-spinner"></div>
          <h2 className="app__loading-title">
            Google Maps laden...
          </h2>
          <p className="app__loading-text">
            Even wachten terwijl we het spel initialiseren.
          </p>
        </div>
      </div>
    );
  }

  
  // Add error boundary for unexpected states
  if (gameState === "loading" && !apiKey) {
    return (
      <div className="app__error">
        <div className="app__error-container">
          <div className="app__error-alert">
            <svg className="app__error-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="app__error-content">
              <h3 className="app__error-content-title">
                Configuration Error
              </h3>
              <div className="app__error-content-description">
                <p>App is in loading state but no API key is available.</p>
                <p>This indicates a configuration issue.</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setGameState("setup")}
            className="app__error-button"
          >
            Configure API Key
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Original Welcome Screen - commented out */}
      {/* {gameState === "welcome" && (
        <WelcomeScreen onStartGame={handleWelcomeStart} />
      )} */}
      
      {/* New Daily Limit Modal */}
      {gameState === "welcome" && (
        <DailyLimitModal onClose={() => {
          // For now, just show the setup modal when they try to close
          setGameState("setup");
        }} />
      )}

      {gameState === "setup" && (
        <SetupModal
          onStartGame={(key) => {
            setApiKey(key);
            setGameState("loading");
            setMapsLoaded(false);

            // Create a temporary function to load maps with the new key
            const loadMapsWithNewKey = () => {
              const existingScripts = document.querySelectorAll(
                `script[src*="maps.googleapis.com"]`
              );
              existingScripts.forEach((script) => script.remove());
              const script = document.createElement("script");
              script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&v=weekly&libraries=geometry`;
              script.async = true;
              script.defer = true;

              script.onload = () => {
                setTimeout(() => {
                  if (window.google && window.google.maps) {
                    setMapsLoaded(true);
                    startNewRound();
                  }
                }, 500);
              };

              document.head.appendChild(script);
            };

            loadMapsWithNewKey();
          }}
        />
      )}

      <NameEntry
        isVisible={showNameEntry}
        totalDistance={totalDistance}
        onSubmit={handleNameSubmit}
        onSkip={() => {
          setShowNameEntry(false);
          setGameComplete(true);
        }}
      />

      <HighScores
        isVisible={showHighScores}
        onClose={() => setShowHighScores(false)}
      />

      {gameState !== "setup" && gameState !== "welcome" && (
        <>
          {/* Desktop Layout */}
          <div className="app__desktop">
            <div className="app__desktop-main">
              {mapsLoaded && currentLocation && (
                <>
                  <StreetView
                    currentLocation={currentLocation}
                    apiKey={apiKey}
                    onPositionUpdate={setActualStreetViewLocation}
                    onStreetViewReady={setStreetViewReady}
                    actualStreetViewLocation={actualStreetViewLocation}
                    streetViewError={streetViewError}
                  />
                  <GuessMap
                    gameState={gameState}
                    currentLocation={actualStreetViewLocation || currentLocation}
                    guessLocation={guessLocation}
                    onGuessLocation={setGuessLocation}
                    apiKey={apiKey}
                  />
                </>
              )}
            </div>

            <div className="app__desktop-sidebar">
  
              <HighScoresDisplay
                onShowFullHighScores={() => setShowHighScores(true)}
              />
              <GameControls
                gameState={gameState}
                round={round}
                distance={distance}
                totalDistance={totalDistance}
                timeLeft={timeLeft}
                onGuess={handleGuess}
                onNextRound={handleNextRound}
                onNewGame={handleNewGame}
                guessLocation={guessLocation}
                onShowHighScores={() => setShowHighScores(true)}
              />
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="app__mobile">
            {/* Fixed Header - Logo on top of Street View */}
            <div className="app__mobile-header">
            </div>

            <div className="app__mobile-street-view">
              {mapsLoaded && currentLocation && (
                <StreetView
                  currentLocation={currentLocation}
                  apiKey={apiKey}
                  onPositionUpdate={setActualStreetViewLocation}
                  onStreetViewReady={setStreetViewReady}
                  actualStreetViewLocation={actualStreetViewLocation}
                  streetViewError={streetViewError}
                />
              )}
            </div>

            {/* Map - 40% height, never changes */}
            <div className="app__mobile-map">
              {mapsLoaded && currentLocation && (
                <GuessMap
                  gameState={gameState}
                  currentLocation={actualStreetViewLocation || currentLocation}
                  guessLocation={guessLocation}
                  onGuessLocation={setGuessLocation}
                  apiKey={apiKey}
                />
              )}
            </div>

            {/* Bottom Controls - Variable height, starts at ~20%, grows when round ends */}
            <div className="app__mobile-controls">
              <GameControls
                gameState={gameState}
                round={round}
                distance={distance}
                totalDistance={totalDistance}
                timeLeft={timeLeft}
                onGuess={handleGuess}
                onNextRound={handleNextRound}
                onNewGame={handleNewGame}
                guessLocation={guessLocation}
                onShowHighScores={() => setShowHighScores(true)}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default App;
