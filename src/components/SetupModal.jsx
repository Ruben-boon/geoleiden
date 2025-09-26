import React from 'react';
import './SetupModal.scss';

const SetupModal = ({ onStartGame }) => {
    return (
        <div className="setup-modal">
            <div className="setup-modal__content">
                <h1 className="setup-modal__title">
                    PlaceChase
                </h1>
                <div className="setup-modal__warning">
                    <svg className="setup-modal__warning-icon" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div className="setup-modal__warning-content">
                        <h3 className="setup-modal__warning-title">
                            API Key Required
                        </h3>
                        <p className="setup-modal__warning-text">No Google Maps API key found in environment variables.</p>
                        <p className="setup-modal__warning-text">Please enter your API key below to continue.</p>
                    </div>
                </div>
                <p className="setup-modal__description">
                    Welkom bij PlaceChase! Raad de locatie in Street View door op de kaart te klikken. Je hebt 30 seconden per ronde!
                </p>
                <div className="setup-modal__form">
                    <div className="setup-modal__input-group">
                        <label className="setup-modal__input-group-label">
                            Google Maps API Sleutel
                        </label>
                        <input
                            type="password"
                            placeholder="Voer je API sleutel in"
                            className="setup-modal__input-group-input"
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
                        className="setup-modal__button"
                    >
                        Spel Starten
                    </button>
                </div>
                <p className="setup-modal__disclaimer">
                    Je hebt een Google Maps API sleutel nodig met Maps JavaScript API, Street View API, en Geocoding API ingeschakeld.
                </p>
            </div>
        </div>
    );
};

export default SetupModal;
