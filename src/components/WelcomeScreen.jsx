import React from "react";
import { Play, Share2 } from "lucide-react";
import "./WelcomeScreen.scss";

const WelcomeScreen = ({ onStartGame }) => {
  return (
    <div className="welcome-screen">
      <div className="welcome-screen__container">
        {/* Welcome Title */}
        <h1 className="welcome-screen__title">
          Welkom leidse glibber
        </h1>

        {/* Game Instructions */}
        <div className="welcome-screen__instructions">
          <h2 className="welcome-screen__instructions-title">
            Hoe te spelen:
          </h2>

          <div className="welcome-screen__instructions-list">
            <div className="welcome-screen__instructions-item">
              <span className="welcome-screen__instructions-item-number">
                1
              </span>
              <p className="welcome-screen__instructions-item-text">
                Bekijk de Street View afbeelding en kijk rond door te slepen of draggen (mobiel) om te raden waar je bent in Leiden
              </p>
            </div>

            <div className="welcome-screen__instructions-item">
              <span className="welcome-screen__instructions-item-number">
                2
              </span>
              <p className="welcome-screen__instructions-item-text">
                Gebruik de Google Maps kaart om nauwkeurig je locatie te kiezen. Snelheid is niet belangrijk, nauwkeurigheid wel!
              </p>
            </div>

            <div className="welcome-screen__instructions-item">
              <span className="welcome-screen__instructions-item-number">
                3
              </span>
              <p className="welcome-screen__instructions-item-text">
                Je hebt 30 seconden per ronde. Speel 3 rondes en probeer de hoogste score te behalen!
              </p>
            </div>
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={onStartGame}
          className="welcome-screen__start-button"
        >
          <Play className="w-5 h-5" />
          Spel Starten
        </button>

        {/* Share Button */}
        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: 'GeoLeiden - Geografisch Spel',
                text: 'Test je kennis van Leiden met dit leuke spel!',
                url: window.location.href
              });
            } else {
              navigator.clipboard.writeText(window.location.href);
              alert('Link gekopieerd naar clipboard!');
            }
          }}
          className="welcome-screen__share-button"
        >
          <Share2 className="w-4 h-4" />
          Deel met vrienden
        </button>

        {/* Additional Info */}
        <p className="welcome-screen__footer-text">
          Gemaakt door <a href="https://boon-digital.nl" target="_blank" rel="noopener noreferrer" className="welcome-screen__footer-link">boon-digital</a>
        </p>
      </div>
    </div>
  );
};

export default WelcomeScreen;