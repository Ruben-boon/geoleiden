import React, { useState, useEffect } from 'react';
import highScoresService from '../services/highScoresService';
import './HighScores.scss';

// Function to calculate how many items can fit based on screen size
const getMaxItemsForScreen = () => {
    return 20; // Show top 20 on both desktop and mobile
};

const HighScores = ({ isVisible, onClose }) => {
    const [highScores, setHighScores] = useState([]);
    const [loading, setLoading] = useState(false);
    const [maxItems, setMaxItems] = useState(5);

    useEffect(() => {
        if (isVisible) {
            loadHighScores();
            setMaxItems(getMaxItemsForScreen());
        }
    }, [isVisible]);

    // Update max items when window resizes
    useEffect(() => {
        const handleResize = () => {
            setMaxItems(getMaxItemsForScreen());
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const loadHighScores = async () => {
        setLoading(true);
        try {
            const scores = await highScoresService.getFormattedHighScores();
            setHighScores(scores);
        } catch (error) {
            console.error('Error loading high scores:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isVisible) return null;

    return (
        <>
            {/* Desktop Modal */}
            <div className="high-scores__desktop-overlay">
                <div className="high-scores__desktop-modal">
                    <div className="high-scores__desktop-header">
                        <h2 className="high-scores__desktop-title">🏆 Top Leidse Glibbers</h2>
                        <button
                            onClick={onClose}
                            className="high-scores__desktop-close"
                        >
                            ×
                        </button>
                    </div>

                    <div className="high-scores__desktop-content">
                        {loading ? (
                            <div className="high-scores__loading">
                                <div className="high-scores__loading-spinner"></div>
                                <p className="high-scores__loading-text">Scores laden...</p>
                            </div>
                        ) : highScores.length === 0 ? (
                            <div className="high-scores__empty">
                                <div className="high-scores__empty-icon">🏆</div>
                                <p className="high-scores__empty-title">Nog geen scores!</p>
                                <p className="high-scores__empty-subtitle">Wees de eerste die een record zet!</p>
                            </div>
                        ) : (
                            <div className="high-scores__list">
                                {highScores.slice(0, maxItems).map((score, index) => (
                                    <div
                                        key={score.id}
                                        className={`high-scores__item ${
                                            index === 0 ? 'high-scores__item--rank-1' :
                                            index === 1 ? 'high-scores__item--rank-2' :
                                            index === 2 ? 'high-scores__item--rank-3' :
                                            'high-scores__item--other'
                                        }`}
                                    >
                                        <div className="high-scores__item-left">
                                            <div className={`high-scores__rank-badge ${
                                                index === 0 ? 'high-scores__rank-badge--rank-1' :
                                                index === 1 ? 'high-scores__rank-badge--rank-2' :
                                                index === 2 ? 'high-scores__rank-badge--rank-3' :
                                                'high-scores__rank-badge--other'
                                            }`}>
                                                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                                            </div>
                                            <div className="high-scores__player-info">
                                                <p className="high-scores__player-info-name">{score.playerName}</p>
                                                <p className="high-scores__player-info-date">{score.formattedDate}</p>
                                            </div>
                                        </div>
                                        <div className="high-scores__item-right">
                                            <p className="high-scores__distance">{Math.round(score.totalDistance)} m</p>
                                            <p className="high-scores__rounds">{score.rounds} rounds</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Fold-out */}
            <div className="high-scores__mobile-overlay">
                <div className="high-scores__mobile-modal">
                    <div className="high-scores__mobile-header">
                        <h2 className="high-scores__mobile-title">🏆 Top Leidse Glibbers</h2>
                        <button
                            onClick={onClose}
                            className="high-scores__mobile-close"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="high-scores__mobile-content">
                        {loading ? (
                            <div className="high-scores__loading high-scores__loading--mobile">
                                <div className="high-scores__loading-spinner"></div>
                                <p className="high-scores__loading-text">Scores laden...</p>
                            </div>
                        ) : highScores.length === 0 ? (
                            <div className="high-scores__empty high-scores__empty--mobile">
                                <div className="high-scores__empty-icon">🏆</div>
                                <p className="high-scores__empty-title">Nog geen scores!</p>
                                <p className="high-scores__empty-subtitle">Wees de eerste die een record zet!</p>
                            </div>
                        ) : (
                            <div className="high-scores__list high-scores__list--mobile">
                                {highScores.slice(0, maxItems).map((score, index) => (
                                    <div
                                        key={score.id}
                                        className={`high-scores__item high-scores__item--mobile ${
                                            index === 0 ? 'high-scores__item--rank-1' :
                                            index === 1 ? 'high-scores__item--rank-2' :
                                            index === 2 ? 'high-scores__item--rank-3' :
                                            'high-scores__item--other'
                                        }`}
                                    >
                                        <div className="high-scores__item-left high-scores__item-left--mobile">
                                            <div className={`high-scores__rank-badge high-scores__rank-badge--mobile ${
                                                index === 0 ? 'high-scores__rank-badge--rank-1' :
                                                index === 1 ? 'high-scores__rank-badge--rank-2' :
                                                index === 2 ? 'high-scores__rank-badge--rank-3' :
                                                'high-scores__rank-badge--other'
                                            }`}>
                                                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                                            </div>
                                            <div className="high-scores__player-info">
                                                <p className="high-scores__player-info-name high-scores__player-info-name--mobile">{score.playerName}</p>
                                                <p className="high-scores__player-info-date high-scores__player-info-date--mobile">{score.formattedDate}</p>
                                            </div>
                                        </div>
                                        <div className="high-scores__item-right">
                                            <p className="high-scores__distance high-scores__distance--mobile">{Math.round(score.totalDistance)} m</p>
                                            <p className="high-scores__rounds high-scores__rounds--mobile">{score.rounds} rounds</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default HighScores;
