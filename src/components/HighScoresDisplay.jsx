import React, { useState, useEffect } from 'react';
import highScoresService from '../services/highScoresService';
import './HighScoresDisplay.scss';

const HighScoresDisplay = ({ onShowFullHighScores }) => {
    const [highScores, setHighScores] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadHighScores();
    }, []);

    const loadHighScores = async () => {
        setLoading(true);
        try {
            const scores = await highScoresService.getFormattedHighScores();
            setHighScores(scores.slice(0, 20));
        } catch (error) {
            console.error('Error loading high scores:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="high-scores-display">
            <div className="high-scores-display__header">
                <h3 className="high-scores-display__title">🏆 Top Glibbers</h3>
            </div>

            {loading ? (
                <div className="high-scores-display__loading">
                    <div className="high-scores-display__loading-spinner"></div>
                </div>
            ) : highScores.length === 0 ? (
                <div className="high-scores-display__empty">
                    <p className="high-scores-display__empty-text">Nog geen scores!</p>
                </div>
            ) : (
                <div className="high-scores-display__list">
                    {highScores.map((score, index) => (
                        <div
                            key={score.id}
                            className={`high-scores-display__item ${
                                index === 0 ? 'high-scores-display__item--rank-1' :
                                index === 1 ? 'high-scores-display__item--rank-2' :
                                index === 2 ? 'high-scores-display__item--rank-3' :
                                'high-scores-display__item--other'
                            }`}
                        >
                            <div className="high-scores-display__item-left">
                                <div className={`high-scores-display__rank ${
                                    index === 0 ? 'high-scores-display__rank--rank-1' :
                                    index === 1 ? 'high-scores-display__rank--rank-2' :
                                    index === 2 ? 'high-scores-display__rank--rank-3' :
                                    'high-scores-display__rank--other'
                                }`}>
                                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                                </div>
                                <div className="high-scores-display__player">
                                    <p className="high-scores-display__player-name">{score.playerName}</p>
                                </div>
                            </div>
                            <div className="high-scores-display__item-right">
                                <p className="high-scores-display__score">{Math.round(score.totalDistance)} m</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default HighScoresDisplay;
