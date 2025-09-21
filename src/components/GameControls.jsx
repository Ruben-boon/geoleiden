import React from 'react';

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
    onShowHighScores
}) => {
    return (
        <div className="space-y-4">
            <div className="bg-white rounded-lg  p-2">
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
};

export default GameControls;
