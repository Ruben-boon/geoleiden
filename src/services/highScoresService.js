class HighScoresService {
    constructor() {
        this.maxScores = 10;
        this.collectionName = 'highScores';
        this.db = null;
        this.initialized = false;
        this.initFirebase();
    }

    initFirebase() {
        try {
            // Get environment variables directly
            const apiKey = process.env.REACT_APP_FIREBASE_API_KEY;
            const authDomain = process.env.REACT_APP_FIREBASE_AUTH_DOMAIN;
            const projectId = process.env.REACT_APP_FIREBASE_PROJECT_ID;
            const storageBucket = process.env.REACT_APP_FIREBASE_STORAGE_BUCKET;
            const messagingSenderId = process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID;
            const appId = process.env.REACT_APP_FIREBASE_APP_ID;


            // Check if any variables are missing
            if (!apiKey || !authDomain || !projectId || !storageBucket || !messagingSenderId || !appId) {
                console.warn('Missing Firebase environment variables');
                console.warn('Firebase will not be initialized. High scores will be stored locally only.');
                this.initialized = false;
                return;
            }

            // All variables are present, proceed with Firebase initialization
            const firebaseConfig = {
                apiKey: apiKey,
                authDomain: authDomain,
                projectId: projectId,
                storageBucket: storageBucket,
                messagingSenderId: messagingSenderId,
                appId: appId
            };

            if (!firebase.apps.length) {
                firebase.initializeApp(firebaseConfig);
            }
            
            this.db = firebase.firestore();
            this.initialized = true;
        } catch (error) {
            console.error('Error initializing Firebase:', error);
            this.initialized = false;
        }
    }

    async waitForFirebase() {
        if (this.initialized && this.db) {
            return true;
        }
        
        let attempts = 0;
        while (!this.initialized && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        return this.initialized && this.db;
    }

    async loadHighScores() {
        try {
            if (!(await this.waitForFirebase())) {
                console.warn('Firebase not ready, falling back to localStorage');
                return this.loadHighScoresFromStorage();
            }

            const snapshot = await this.db.collection(this.collectionName)
                .orderBy('totalDistance', 'asc')
                .limit(this.maxScores)
                .get();

            const highScores = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                highScores.push({
                    id: doc.id,
                    ...data
                });
            });

            return highScores;
        } catch (error) {
            console.error('Error loading high scores from Firebase:', error);
            return this.loadHighScoresFromStorage();
        }
    }

    loadHighScoresFromStorage() {
        try {
            const stored = localStorage.getItem('placechase_highscores');
            if (stored) {
                const data = JSON.parse(stored);
                return data.highScores || [];
            }
        } catch (error) {
            console.error('Error loading high scores from storage:', error);
        }
        return [];
    }

    saveHighScoresToStorage(highScores) {
        try {
            const data = {
                highScores: highScores,
                lastUpdated: new Date().toISOString()
            };
            localStorage.setItem('placechase_highscores', JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving high scores to storage:', error);
            return false;
        }
    }

    async addHighScore(playerName, totalDistance, rounds = 3) {
        try {
            if (!(await this.waitForFirebase())) {
                console.warn('Firebase not ready, saving to localStorage');
                return this.addHighScoreToStorage(playerName, totalDistance, rounds);
            }

            const newScore = {
                playerName: playerName.trim(),
                totalDistance: totalDistance,
                date: firebase.firestore.Timestamp.now(),
                rounds: rounds
            };

            const docRef = await this.db.collection(this.collectionName).add(newScore);
            const highScores = await this.loadHighScores();
            
            const rank = highScores.findIndex(score => score.id === docRef.id) + 1;
            const isHighScore = rank === 1;

            return {
                success: true,
                newScore: {
                    id: docRef.id,
                    ...newScore,
                    date: newScore.date.toDate().toISOString()
                },
                isHighScore: isHighScore,
                rank: rank
            };
        } catch (error) {
            console.error('Error adding high score to Firebase:', error);
            return this.addHighScoreToStorage(playerName, totalDistance, rounds);
        }
    }

    addHighScoreToStorage(playerName, totalDistance, rounds) {
        try {
            let highScores = this.loadHighScoresFromStorage();

            const newScore = {
                id: 'score_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                playerName: playerName.trim(),
                totalDistance: totalDistance,
                date: new Date().toISOString(),
                rounds: rounds
            };

            highScores.push(newScore);
            highScores.sort((a, b) => a.totalDistance - b.totalDistance);
            highScores = highScores.slice(0, this.maxScores);

            this.saveHighScoresToStorage(highScores);

            const rank = highScores.findIndex(score => score.id === newScore.id) + 1;
            const isHighScore = rank === 1;

            return {
                success: true,
                newScore: newScore,
                isHighScore: isHighScore,
                rank: rank
            };
        } catch (error) {
            console.error('Error adding high score to storage:', error);
            return { success: false, error: error.message };
        }
    }

    async isHighScore(totalDistance) {
        try {
            const highScores = await this.loadHighScores();

            if (highScores.length < this.maxScores) {
                return true;
            }

            const worstHighScore = highScores[highScores.length - 1];
            return totalDistance < worstHighScore.totalDistance;
        } catch (error) {
            console.error('Error checking high score:', error);
            return false;
        }
    }

    async getFormattedHighScores() {
        try {
            const highScores = await this.loadHighScores();

            return highScores.map((score, index) => ({
                ...score,
                rank: index + 1,
                formattedDate: new Date(score.date).toLocaleDateString(),
                formattedTime: new Date(score.date).toLocaleTimeString()
            }));
        } catch (error) {
            console.error('Error getting formatted high scores:', error);
            return [];
        }
    }

    async checkAndUpdateScore(playerName, totalDistance, rounds = 3) {
        try {
            const highScores = await this.loadHighScores();
            const existingScore = highScores.find(entry => 
                entry.playerName.toLowerCase() === playerName.toLowerCase()
            );

            if (existingScore) {
                // Check if new distance is better (lower)
                if (totalDistance < existingScore.totalDistance) {
                    console.log(`Updating existing distance for ${playerName}: ${existingScore.totalDistance}m -> ${totalDistance}m`);
                    
                    if (await this.waitForFirebase()) {
                        // Update in Firebase
                        const scoreToUpdate = highScores.find(entry => entry.id === existingScore.id);
                        if (scoreToUpdate) {
                            await this.db.collection(this.collectionName).doc(scoreToUpdate.id).update({
                                totalDistance: totalDistance,
                                date: firebase.firestore.Timestamp.now(),
                                rounds: rounds
                            });
                        }
                    } else {
                        // Update in localStorage
                        const updatedScores = highScores.map(entry => 
                            entry.id === existingScore.id 
                                ? { ...entry, totalDistance, date: new Date().toISOString(), rounds }
                                : entry
                        );
                        this.saveHighScoresToStorage(updatedScores);
                    }

                    return {
                        success: true,
                        isUpdate: true,
                        oldDistance: existingScore.totalDistance,
                        newDistance: totalDistance,
                        improvement: existingScore.totalDistance - totalDistance
                    };
                } else {
                    console.log(`Existing distance for ${playerName} is better: ${existingScore.totalDistance}m vs ${totalDistance}m`);
                    return {
                        success: false,
                        isUpdate: false,
                        reason: 'existing_better',
                        existingDistance: existingScore.totalDistance,
                        newDistance: totalDistance
                    };
                }
            } else {
                // No existing score, add new one
                return await this.addHighScore(playerName, totalDistance, rounds);
            }
        } catch (error) {
            console.error('Error checking and updating distance:', error);
            return { success: false, error: error.message };
        }
    }
}

export default new HighScoresService();
