import React, { useState } from 'react';
import './NameEntry.scss';
import highScoresService from '../services/highScoresService';

const NameEntry = ({ isVisible, totalDistance, onSubmit, onSkip }) => {
    const [playerName, setPlayerName] = useState('');
    const [submitResult, setSubmitResult] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (playerName.trim() && !isSubmitting) {
            setIsSubmitting(true);
            setSubmitResult(null);
            
            try {
                const result = await highScoresService.checkAndUpdateScore(
                    playerName.trim(), 
                    totalDistance, 
                    3
                );
                
                setSubmitResult(result);
                
                if (result.success) {
                    // Call the original onSubmit to proceed with the game flow
                    onSubmit(playerName.trim());
                }
            } catch (error) {
                console.error('Error submitting score:', error);
                setSubmitResult({ success: false, error: error.message });
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    if (!isVisible) return null;

    return (
        <div className="name-entry">
            <div className="name-entry__container">
                <div className="name-entry__distance-container">
                    <p className="name-entry__distance-container-distance">{Math.round(totalDistance)} m</p>
                </div>

                {submitResult && (
                    <div className={`name-entry__feedback name-entry__feedback--${submitResult.success ? 'success' : 'error'}`}>
                        {submitResult.success ? (
                            submitResult.isUpdate ? (
                                <div className="name-entry__feedback-content">
                                    <span className="name-entry__feedback-icon">🎉</span>
                                    <div className="name-entry__feedback-text">
                                        <strong>Score verbeterd!</strong>
                                        <p>Van {Math.round(submitResult.oldDistance)}m naar {Math.round(submitResult.newDistance)}m 
                                        ({Math.round(submitResult.improvement)}m beter!)</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="name-entry__feedback-content">
                                    <span className="name-entry__feedback-icon">✨</span>
                                    <div className="name-entry__feedback-text">
                                        <strong>Nieuwe score toegevoegd!</strong>
                                        <p>Welkom in de leaderboard!</p>
                                    </div>
                                </div>
                            )
                        ) : (
                            <div className="name-entry__feedback-content">
                                <span className="name-entry__feedback-icon">⚠️</span>
                                <div className="name-entry__feedback-text">
                                    <strong>Score niet opgeslagen</strong>
                                    <p>
                                        {submitResult.reason === 'existing_better' 
                                            ? `Je bestaande score van ${Math.round(submitResult.existingDistance)}m is beter dan ${Math.round(submitResult.newDistance)}m`
                                            : 'Er is een fout opgetreden. Probeer opnieuw.'
                                        }
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="name-entry__form">
                    <div className="name-entry__input-group">
                        <label className="name-entry__input-group-label">
                            Voer je naam in als Leidse glibber:
                        </label>
                        <input
                            type="text"
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                            placeholder="Leidse glibber"
                            className="name-entry__input-group-input"
                            maxLength={20}
                            autoFocus
                        />
                    </div>
                    <div className="name-entry__button-group">
                        <button
                            type="button"
                            onClick={onSkip}
                            className="name-entry__button-group-skip"
                        >
                            Overslaan
                        </button>
                        <button
                            type="submit"
                            disabled={!playerName.trim() || isSubmitting}
                            className="name-entry__button-group-submit"
                        >
                            {isSubmitting ? 'Bezig...' : 'Score Opslaan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NameEntry;
