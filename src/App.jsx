import React, { useState, useEffect } from "react";
import {
  generateRandomLeidenLocation,
  calculateDistance,
  calculateScore,
} from "./utils/locationUtils";
import highScoresService from "./services/highScoresService";
import StreetView from "./components/StreetView";
import GuessMap from "./components/GuessMap";
import NameEntry from "./components/NameEntry";
import HighScores from "./components/HighScores";
import HighScoresDisplay from "./components/HighScoresDisplay";
import GameControls from "./components/GameControls";
import SetupModal from "./components/SetupModal";

const App = () => {
  const [apiKey, setApiKey] = useState("");
  const [gameState, setGameState] = useState("loading");
  const [currentLocation, setCurrentLocation] = useState(null);
  const [actualStreetViewLocation, setActualStreetViewLocation] =
    useState(null);
  const [streetViewReady, setStreetViewReady] = useState(false);
  const [streetViewError, setStreetViewError] = useState(false);
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

  useEffect(() => {
    if (!apiKey) return;

    const existingScripts = document.querySelectorAll(
      `script[src*="maps.googleapis.com"]`
    );
    existingScripts.forEach((script) => script.remove());

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly&libraries=geometry`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      console.log("Google Maps API loaded successfully");
      setGameState("loading");
      setTimeout(() => {
        if (window.google && window.google.maps) {
          console.log("Google Maps is ready");
          setMapsLoaded(true);
          startNewRound();
        } else {
          console.error("Google Maps not properly initialized");
          alert(
            "Google Maps failed to initialize properly. Please check your API key and try again."
          );
          setGameState("setup");
          setMapsLoaded(false);
        }
      }, 500);
    };

    script.onerror = () => {
      console.error("Failed to load Google Maps API");
      alert(
        "Failed to load Google Maps API. Please check your API key and internet connection."
      );
      setGameState("setup");
      setMapsLoaded(false);
    };

    document.head.appendChild(script);

    return () => {
      const existingScript = document.querySelector(
        `script[src*="maps.googleapis.com"]`
      );
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [apiKey]);

  useEffect(() => {
    let interval = null;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((timeLeft) => timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerActive) {
      setTimerActive(false);

      if (guessLocation && currentLocation) {
        const calculatedDistance = calculateDistance(
          currentLocation.lat,
          currentLocation.lng,
          guessLocation.lat,
          guessLocation.lng
        );

        const calculatedScore = calculateScore(calculatedDistance);

        setDistance(calculatedDistance);
        setRoundScore(calculatedScore);
        setScore((prev) => prev + calculatedScore);
        setTotalDistance((prev) => prev + calculatedDistance);
      } else {
        const penaltyDistance = 2000;
        setDistance(penaltyDistance);
        setRoundScore(0);
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

  useEffect(() => {
    const envApiKey = process.env.GOOGLEAPIKEY;
    if (envApiKey && envApiKey !== "your_actual_api_key_here" && envApiKey !== "your_google_maps_api_key_here") {
      setApiKey(envApiKey);
      setMapsLoaded(false);
      setGameState("loading"); // Changed from "guessing" to "loading" to trigger the maps loading
    } else {
      // If no API key from environment, show setup modal
      setGameState("setup");
    }
  }, []);

  const selectRandomLocation = () => {
    const randomLocation = generateRandomLeidenLocation();
    console.log("🎲 NEW LOCATION GENERATED:", {
      lat: randomLocation.lat,
      lng: randomLocation.lng,
      latFormatted: randomLocation.lat.toFixed(6),
      lngFormatted: randomLocation.lng.toFixed(6),
      name: randomLocation.name,
    });
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
    setRoundScore(0);
    setTimeLeft(30);
    setTimerActive(true);

  };

  const handleGuess = () => {
    if (!guessLocation || !currentLocation) return;

    setTimerActive(false);

    // Only use actual Street View location - this is the real position
    if (!actualStreetViewLocation) {
      console.warn(
        "⚠️ No actual Street View location available, using generated location as fallback"
      );
    }

    const actualLocation = actualStreetViewLocation || currentLocation;

    const calculatedDistance = calculateDistance(
      actualLocation.lat,
      actualLocation.lng,
      guessLocation.lat,
      guessLocation.lng
    );

    const calculatedScore = calculateScore(calculatedDistance);

    console.log("📏 DISTANCE CALCULATION:", {
      actualLocation: {
        lat: actualLocation.lat,
        lng: actualLocation.lng,
        source: actualStreetViewLocation ? "STREET_VIEW" : "GENERATED",
      },
      guessLocation: {
        lat: guessLocation.lat,
        lng: guessLocation.lng,
      },
      distance: calculatedDistance,
      score: calculatedScore,
      usingActualStreetView: !!actualStreetViewLocation,
      streetViewReady: streetViewReady,
    });

    setDistance(calculatedDistance);
    setRoundScore(calculatedScore);
    setScore((prev) => prev + calculatedScore);
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
    try {
      const result = await highScoresService.addHighScore(
        playerName,
        score,
        totalDistance,
        3
      );
      if (result.success) {
        setShowNameEntry(false);
        setGameComplete(true);
        setShowHighScores(true);
      } else {
        console.error("Failed to save high score:", result.error);
        setShowNameEntry(false);
        setGameComplete(true);
      }
    } catch (error) {
      console.error("Error saving high score:", error);
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
    setGameState("loading");
    setMapsLoaded(false);
    setTimeLeft(30);
    setTimerActive(false);

    setTimeout(() => {
      if (window.google && window.google.maps) {
        console.log("Google Maps is ready for new game");
        setMapsLoaded(true);
        startNewRound();
      } else {
        console.error("Google Maps not ready for new game");
        setTimeout(() => {
          if (window.google && window.google.maps) {
            setMapsLoaded(true);
            startNewRound();
          } else {
            console.error("Google Maps still not ready, starting anyway");
            setMapsLoaded(true);
            startNewRound();
          }
        }, 1000);
      }
    }, 100);
  };

  if (gameComplete && !showNameEntry) {
    return (
      <div className="min-h-screen bg-red-500 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Spel Afgelopen!
          </h1>
          <p className="text-xl text-gray-600 mb-2">Eindscore: {score}</p>
          <p className="text-lg text-gray-600 mb-6">
            Totale Afstand: {Math.round(totalDistance)} m
          </p>
          <div className="space-y-3">
            <button
              onClick={handleNewGame}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Opnieuw Spelen
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === "loading") {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Google Maps laden...
          </h2>
          <p className="text-gray-600">
            Even wachten terwijl we het spel initialiseren.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      {gameState === "setup" && (
        <SetupModal
          onStartGame={(key) => {
            setApiKey(key);
            setMapsLoaded(false);
            setGameState("guessing");
          }}
        />
      )}

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

      <HighScores
        isVisible={showHighScores}
        onClose={() => setShowHighScores(false)}
      />

      {gameState !== "setup" && (
        <>
          {/* Desktop Layout */}
          <div className="hidden md:flex h-screen h-full">
            <div className="flex-1 p-2 pace-y-4 h-full ">
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

            <div className="w-64 p-2 flex flex-col space-y-4 h-full justify-between">
              <div className="p-4">
                <img
                  src="logo_leiden.jpg"
                  alt="Leiden Logo"
                  className="w-full rounded-lg "
                />
              </div>

              <HighScoresDisplay
                onShowFullHighScores={() => setShowHighScores(true)}
              />
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
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="md:hidden flex flex-col h-screen overflow-hidden">
            {/* Mobile Header with Logo and Leaderboard Button */}
            <div className="flex justify-between items-center p-2 bg-white shadow-sm z-20">
              <img
                src="logo_leiden.jpg"
                alt="Leiden Logo"
                className="w-8 h-8 rounded-full object-cover"
              />
              <button
                onClick={() => setShowHighScores(true)}
                className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium shadow-md"
              >
                Leaderboard
              </button>
            </div>

            {/* Main Game Area - 50/50 split */}
            <div className="flex-1 flex flex-col">
              {/* Street View - 50% */}
              <div className="h-1/2">
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

              {/* Map - 50% */}
              <div className="h-1/2">
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
            </div>

            {/* Mobile Bottom Controls */}
            <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-30">
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
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default App;
