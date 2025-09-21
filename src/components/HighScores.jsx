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
        <>
            {/* Desktop Modal */}
            <div className="hidden md:flex fixed inset-0 bg-black bg-opacity-50 items-center justify-center z-50">
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

            {/* Mobile Fold-out */}
            <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
                <div className="bg-white rounded-t-3xl w-full max-h-[85vh] overflow-y-auto">
                    {/* Mobile Header */}
                    <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-800">🏆 Top Leidse Glibbers</h2>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
                        >
                            ✕
                        </button>
                    </div>
                    
                    <div className="p-4">
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                <p className="text-gray-600">Scores laden...</p>
                            </div>
                        ) : highScores.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">🏆</div>
                                <p className="text-gray-600 text-lg">Nog geen scores!</p>
                                <p className="text-sm text-gray-500 mt-2">Wees de eerste die een record zet!</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {highScores.map((score, index) => (
                                    <div 
                                        key={score.id}
                                        className={`flex justify-between items-center p-4 rounded-2xl shadow-sm ${
                                            index === 0 ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 border-yellow-300' :
                                            index === 1 ? 'bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-300' :
                                            index === 2 ? 'bg-gradient-to-r from-orange-50 to-orange-100 border-2 border-orange-300' :
                                            'bg-gray-50 border border-gray-200'
                                        }`}
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold shadow-md ${
                                                index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white' :
                                                index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-white' :
                                                index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-white' :
                                                'bg-gray-300 text-gray-700'
                                            }`}>
                                                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800 text-lg">{score.playerName}</p>
                                                <p className="text-sm text-gray-500">{score.formattedDate}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-xl text-gray-800">{Math.round(score.totalDistance)} m</p>
                                            <p className="text-sm text-gray-500">{score.rounds} rounds</p>
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
