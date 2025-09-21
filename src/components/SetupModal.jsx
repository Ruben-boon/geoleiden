import React from 'react';

const SetupModal = ({ onStartGame }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
                <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
                    PlaceChase
                </h1>
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-800">
                                API Key Required
                            </h3>
                            <div className="mt-2 text-sm text-yellow-700">
                                <p>No Google Maps API key found in environment variables.</p>
                                <p className="mt-1">Please enter your API key below to continue.</p>
                            </div>
                        </div>
                    </div>
                </div>
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
