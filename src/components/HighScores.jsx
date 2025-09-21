import React, { useState, useEffect } from 'react';
import highScoresService from '../services/highScoresService';

const HighScores = ({ isVisible, onClose }) => {
    const [highScores, setHighScores] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isVisible) {
            loadHighScores();
        }
    }, [isVisible]);

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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">Top Leidse Glibbers</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                        ×
                    </button>
                </div>
                
                {loading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p className="text-gray-600">Scores laden...</p>
                    </div>
                ) : highScores.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-600">Nog geen scores!</p>
                        <p className="text-sm text-gray-500 mt-2">Wees de eerste die een record zet!</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {highScores.map((score, index) => (
                            <div 
                                key={score.id}
                                className={`flex justify-between items-center p-3 rounded-lg ${
                                    index === 0 ? 'bg-yellow-50 border-2 border-yellow-200' :
                                    index === 1 ? 'bg-gray-50 border-2 border-gray-200' :
                                    index === 2 ? 'bg-orange-50 border-2 border-orange-200' :
                                    'bg-gray-50'
                                }`}
                            >
                                <div className="flex items-center space-x-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                        index === 0 ? 'bg-yellow-400 text-white' :
                                        index === 1 ? 'bg-gray-400 text-white' :
                                        index === 2 ? 'bg-orange-400 text-white' :
                                        'bg-gray-300 text-gray-700'
                                    }`}>
                                        {index + 1}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800">{score.playerName}</p>
                                        <p className="text-xs text-gray-500">{score.formattedDate}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-lg text-gray-800">{Math.round(score.totalDistance)} m</p>
                                    <p className="text-xs text-gray-500">{score.rounds} rounds</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HighScores;
