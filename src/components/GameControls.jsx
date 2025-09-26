import React from "react";
import { Target, MapPin, ArrowRight, FileText, Trophy } from "lucide-react";
import "./GameControls.scss";

const GameControls = ({
  gameState,
  round,
  distance,
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
      <div className="game-controls__desktop">
        <div className="game-controls__panel">
          <div className="game-controls__header">
            {gameState === "guessing" && (
              <p
                className={`game-controls__timer ${
                  timeLeft <= 5 ? "game-controls__timer--danger" : "game-controls__timer--normal"
                }`}
              >
                {timeLeft}s
              </p>
            )}
            <p className="game-controls__round">Ronde {round}/3</p>
            {totalDistance > 0 && (
              <p className="game-controls__round">
                Totale Afstand: {Math.round(totalDistance)} m
              </p>
            )}
          </div>

          {gameState === "guessing" && (
            <div className="game-controls__actions">
              <button
                onClick={onGuess}
                disabled={!guessLocation}
                className="game-controls__button"
                style={guessLocation ? { backgroundColor: '#D62410' } : {}}
              >
                {guessLocation ? (
                  <>
                    <Target className="w-4 h-4 mr-2" />
                    Gok Nu Bevestigen
                  </>
                ) : (
                  <>
                    <MapPin className="w-4 h-4 mr-2" />
                    Kies een locatie
                  </>
                )}
              </button>
            </div>
          )}

          {gameState === "result" && (
            <div className="game-controls__result">
              <div className="game-controls__result-header">
                <p className="game-controls__result-stat-value game-controls__result-stat-value--distance">
                  {distance ? `${Math.round(distance)} m` : "Berekenen..."}
                </p>
              </div>

              <button
                onClick={onNextRound}
                className="game-controls__button"
                style={{ backgroundColor: '#D62410' }}
              >
                {round < 3 ? (
                  <>
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Volgende Ronde
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Naam invullen
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="game-controls__mobile">
        {/* Mobile Timer and Round Info */}
        <div className="game-controls__header">
          <div>
            {gameState === "guessing" && (
              <div
                className={`game-controls__timer ${
                  timeLeft <= 5 ? "game-controls__timer--danger" : "game-controls__timer--normal"
                }`}
              >
                {timeLeft}s
              </div>
            )}
          </div>
          <div className="game-controls__mobile-info-row">
            <div className="game-controls__round">Ronde {round}/3</div>
            {totalDistance > 0 && (
              <div className="game-controls__round">
                Totale Afstand: {Math.round(totalDistance)} m
              </div>
            )}
          </div>
          {gameState === "result" && distance && (
            <div className="game-controls__result-header">
              <div className="game-controls__result-stat-value game-controls__result-stat-value--distance">
                {Math.round(distance)} m
              </div>
            </div>
          )}
        </div>

        {/* Mobile Action Buttons */}
        {gameState === "guessing" && (
          <div className="game-controls__mobile-actions">
            <button
              onClick={onGuess}
              disabled={!guessLocation}
              className="game-controls__button"
              style={guessLocation ? { backgroundColor: '#D62410' } : {}}
            >
              {guessLocation ? (
                <>
                  <Target className="w-4 h-4 mr-2" />
                  Gok Nu Bevestigen
                </>
              ) : (
                <>
                  <MapPin className="w-4 h-4 mr-2" />
                  Kies een locatie
                </>
              )}
            </button>
            
            <button
              onClick={onShowHighScores}
              className="game-controls__mobile-leaderboard-btn"
            >
              <Trophy size={16} />
            </button>
          </div>
        )}

        {gameState === "result" && (
          <div className="game-controls__mobile-actions">
            <button
              onClick={onNextRound}
              className="game-controls__button"
              style={{ backgroundColor: '#D62410' }}
            >
              {round < 3 ? (
                <>
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Volgende Ronde
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Naam invullen
                </>
              )}
            </button>
            
            <button
              onClick={onShowHighScores}
              className="game-controls__mobile-leaderboard-btn"
            >
              <Trophy size={16} />
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default GameControls;
