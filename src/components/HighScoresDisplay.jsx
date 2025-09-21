import React, { useState, useEffect } from 'react';
import highScoresService from '../services/highScoresService';

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
            setHighScores(scores.slice(0, 5));
        } catch (error) {
            console.error('Error loading high scores:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg  p-4 w-full">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-gray-800">Top Glibbers</h3>
                <button
                    onClick={onShowFullHighScores}
                    className="text-sm text-blue-600 hover:text-blue-800"
                >
                    Bekijk Alles
                </button>
            </div>
            
            {loading ? (
                <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                </div>
            ) : highScores.length === 0 ? (
                <div className="text-center py-4">
                    <p className="text-sm text-gray-600">Nog geen scores!</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {highScores.map((score, index) => (
                        <div 
                            key={score.id}
                            className={`flex justify-between items-center p-2 rounded ${
                                index === 0 ? 'bg-yellow-50' :
                                index === 1 ? 'bg-gray-50' :
                                index === 2 ? 'bg-orange-50' :
                                'bg-gray-50'
                            }`}
                        >
                            <div className="flex items-center space-x-2">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                    index === 0 ? 'bg-yellow-400 text-white' :
                                    index === 1 ? 'bg-gray-400 text-white' :
                                    index === 2 ? 'bg-orange-400 text-white' :
                                    'bg-gray-300 text-gray-700'
                                }`}>
                                    {index + 1}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-800">{score.playerName}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-gray-800">{Math.round(score.totalDistance)} m</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default HighScoresDisplay;
