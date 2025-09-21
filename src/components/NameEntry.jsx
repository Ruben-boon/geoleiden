import React, { useState } from 'react';

const NameEntry = ({ isVisible, score, totalDistance, onSubmit, onSkip }) => {
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
};

export default NameEntry;
