// Firebase High Scores Service
// Handles reading and writing high scores to/from Firebase Firestore

class HighScoresService {
    constructor() {
        this.maxScores = 10; // Keep top 10 scores
        this.collectionName = 'highScores';
        this.db = null;
        this.initialized = false;
        this.initFirebase();
    }

    // Initialize Firebase
    initFirebase() {
        try {
            // Firebase configuration
            const firebaseConfig = {
                apiKey: "AIzaSyCih5-dFini_76IXvIZJAkY7KbLH4qgpZw",
                authDomain: "placechase-18b9d.firebaseapp.com",
                projectId: "placechase-18b9d",
                storageBucket: "placechase-18b9d.firebasestorage.app",
                messagingSenderId: "508531196397",
                appId: "1:508531196397:web:f7a551973298d48c7de7e4"
            };

            // Initialize Firebase
            if (!firebase.apps.length) {
                firebase.initializeApp(firebaseConfig);
            }
            
            // Initialize Firestore
            this.db = firebase.firestore();
            this.initialized = true;
            console.log('Firebase initialized successfully');
        } catch (error) {
            console.error('Error initializing Firebase:', error);
            this.initialized = false;
        }
    }

    // Wait for Firebase to be ready
    async waitForFirebase() {
        if (this.initialized && this.db) {
            return true;
        }
        
        // Wait up to 5 seconds for Firebase to initialize
        let attempts = 0;
        while (!this.initialized && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        return this.initialized && this.db;
    }

    // Load high scores from Firestore
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

    // Load high scores from localStorage (fallback)
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

    // Save high scores to localStorage (fallback)
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

    // Add a new high score
    async addHighScore(playerName, score, totalDistance, rounds = 3) {
        try {
            if (!(await this.waitForFirebase())) {
                console.warn('Firebase not ready, saving to localStorage');
                return this.addHighScoreToStorage(playerName, score, totalDistance, rounds);
            }

            const newScore = {
                playerName: playerName.trim(),
                score: score,
                totalDistance: totalDistance,
                date: firebase.firestore.Timestamp.now(),
                rounds: rounds
            };

            // Add to Firestore
            const docRef = await this.db.collection(this.collectionName).add(newScore);

            // Get updated high scores
            const highScores = await this.loadHighScores();
            
            // Find the rank of the new score
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
            return this.addHighScoreToStorage(playerName, score, totalDistance, rounds);
        }
    }

    // Add high score to localStorage (fallback)
    addHighScoreToStorage(playerName, score, totalDistance, rounds) {
        try {
            let highScores = this.loadHighScoresFromStorage();

            const newScore = {
                id: 'score_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                playerName: playerName.trim(),
                score: score,
                totalDistance: totalDistance,
                date: new Date().toISOString(),
                rounds: rounds
            };

            // Add new score and sort by distance (ascending - lower is better)
            highScores.push(newScore);
            highScores.sort((a, b) => a.totalDistance - b.totalDistance);

            // Keep only top scores
            highScores = highScores.slice(0, this.maxScores);

            // Save to localStorage
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

    // Check if a distance qualifies as a high score
    async isHighScore(totalDistance) {
        try {
            const highScores = await this.loadHighScores();

            // If we have less than max scores, any distance qualifies
            if (highScores.length < this.maxScores) {
                return true;
            }

            // Check if distance is lower than the highest (worst) high score
            const worstHighScore = highScores[highScores.length - 1];
            return totalDistance < worstHighScore.totalDistance;
        } catch (error) {
            console.error('Error checking high score:', error);
            return false;
        }
    }

    // Get formatted high scores for display
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
}

// Create global instance
window.highScoresService = new HighScoresService();
