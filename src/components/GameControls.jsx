import React from "react";
import { Target, MapPin, ArrowRight, FileText } from "lucide-react";

const GameControls = ({
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
  onShowHighScores,
}) => {
  return (
    <>
      {/* Desktop Layout */}
      <div className="hidden md:block space-y-4 mt-auto mb-10">
        <div className="bg-white rounded-lg p-2">
          <div className="text-center mb-4">
            {gameState === "guessing" && (
              <p
                className={`text-xl font-bold ${
                  timeLeft <= 5 ? "text-red-600" : "text-blue-600"
                }`}
              >
                {timeLeft}s
              </p>
            )}
            <p className="text-lg text-gray-600">Ronde {round}/3</p>
            {totalDistance > 0 && (
              <p className="text-xs text-gray-500">
                Totale Afstand: {Math.round(totalDistance)} m
              </p>
            )}
          </div>

          {gameState === "guessing" && (
            <div className="space-y-2">
              <button
                onClick={onGuess}
                disabled={!guessLocation}
                className={`w-full py-2 px-4 rounded-lg transition-colors ${
                  guessLocation
                    ? "text-white hover:opacity-90"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
                style={guessLocation ? { backgroundColor: '#D62410' } : {}}
              >
                {guessLocation ? (
                  <div className="flex items-center justify-center">
                    <Target className="w-4 h-4 mr-2" />
                    Gok Nu Bevestigen
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    Kies een locatie
                  </div>
                )}
              </button>
            </div>
          )}

          {gameState === "result" && (
            <div className="space-y-3">
              <div className="text-center">
                <p className="text-sm text-gray-600">Afstand</p>
                <p className="text-lg font-semibold text-gray-800">
                  {distance ? `${Math.round(distance)} m` : "Berekenen..."}
                </p>
              </div>

              <button
                onClick={onNextRound}
                className="w-full text-white py-2 px-4 rounded-lg hover:opacity-90 transition-colors"
                style={{ backgroundColor: '#D62410' }}
              >
                {round < 3 ? (
                  <div className="flex items-center justify-center">
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Volgende Ronde
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Naam invullen
                  </div>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden p-4 pb-6">
        {/* Mobile Timer and Round Info */}
        <div className="flex justify-between items-center mb-4">
          <div className="text-center flex-1">
            {gameState === "guessing" && (
              <div
                className={`text-2xl font-bold ${
                  timeLeft <= 5 ? "text-red-600" : "text-blue-600"
                }`}
              >
                {timeLeft}s
              </div>
            )}
          </div>
          <div className="text-center flex-1">
            <div className="text-lg font-semibold text-gray-800">Ronde {round}/3</div>
            {totalDistance > 0 && (
              <div className="text-xs text-gray-500">
                Totale Afstand: {Math.round(totalDistance)} m
              </div>
            )}
          </div>
          {gameState === "result" && distance && (
            <div className="text-center flex-1">
              <div className="text-xs text-gray-600">Afstand</div>
              <div className="text-lg font-bold text-gray-800">
                {Math.round(distance)} m
              </div>
            </div>
          )}
        </div>

        {/* Mobile Action Buttons */}
        {gameState === "guessing" && (
          <button
            onClick={onGuess}
            disabled={!guessLocation}
            className={`w-full py-4 px-6 rounded-lg text-lg font-semibold shadow-lg transition-all duration-200 ${
              guessLocation
                ? "text-white hover:opacity-90 active:scale-95"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            style={guessLocation ? { backgroundColor: '#D62410' } : {}}
          >
            {guessLocation ? (
              <div className="flex items-center justify-center">
                <Target className="w-4 h-4 mr-2" />
                Gok Nu Bevestigen
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <MapPin className="w-4 h-4 mr-2" />
                Kies een locatie
              </div>
            )}
          </button>
        )}

        {gameState === "result" && (
          <div className="space-y-2">
            <button
              onClick={onNextRound}
              className="w-full text-white py-2 px-4 rounded-lg text-sm font-semibold hover:opacity-90 active:scale-95 transition-all duration-200"
              style={{ backgroundColor: '#D62410' }}
            >
              {round < 3 ? (
                <div className="flex items-center justify-center">
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Volgende Ronde
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Naam invullen
                </div>
              )}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default GameControls;
