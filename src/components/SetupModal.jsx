import React from 'react';

const SetupModal = ({ onStartGame }) => {
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
                        className="w-full text-white py-2 px-4 rounded-lg hover:opacity-90 transition-colors"
                        style={{ backgroundColor: '#D62410' }}
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
};

export default SetupModal;
