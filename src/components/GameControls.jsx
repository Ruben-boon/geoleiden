import React from "react";

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
                className={`w-full py-2 px-4 rounded-md transition-colors ${
                  guessLocation
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {guessLocation
                  ? "Gok Nu Bevestigen"
                  : "Kies een locatie"}
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
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                {round < 3 ? "Volgende Ronde" : "Naam invullen"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden p-4 pb-6">
        {/* Mobile Timer and Round Info */}
        <div className="flex justify-between items-center mb-4">
          <div className="text-center">
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
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-800">Ronde {round}/3</div>
            {totalDistance > 0 && (
              <div className="text-xs text-gray-500">
                Totale Afstand: {Math.round(totalDistance)} m
              </div>
            )}
          </div>
        </div>

        {/* Mobile Action Buttons */}
        {gameState === "guessing" && (
          <button
            onClick={onGuess}
            disabled={!guessLocation}
            className={`w-full py-4 px-6 rounded-2xl text-lg font-semibold shadow-lg transition-all duration-200 ${
              guessLocation
                ? "bg-green-600 text-white hover:bg-green-700 active:scale-95"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {guessLocation ? "🎯 Gok Nu Bevestigen" : "📍 Kies een locatie"}
          </button>
        )}

        {gameState === "result" && (
          <div className="space-y-4">
            <div className="text-center bg-gray-50 rounded-xl p-4">
              <div className="text-sm text-gray-600 mb-1">Afstand</div>
              <div className="text-2xl font-bold text-gray-800">
                {distance ? `${Math.round(distance)} m` : "Berekenen..."}
              </div>
            </div>

            <button
              onClick={onNextRound}
              className="w-full bg-blue-600 text-white py-4 px-6 rounded-2xl text-lg font-semibold shadow-lg hover:bg-blue-700 active:scale-95 transition-all duration-200"
            >
              {round < 3 ? "➡️ Volgende Ronde" : "📝 Naam invullen"}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default GameControls;
