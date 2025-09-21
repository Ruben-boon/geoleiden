const fs = require('fs');
const path = require('path');


function readEnvFile() {
    try {
        const envPath = path.join(__dirname, '.env');
        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf8');
            const lines = envContent.split('\n');
            
            for (const line of lines) {
                const [key, value] = line.split('=');
                if (key === 'GOOGLEAPIKEY' && value) {
                    return value.trim();
                }
            }
        }
    } catch (error) {
        console.error('Error reading .env file:', error.message);
    }
    return null;
}

function updateConfig(apiKey) {
    if (!apiKey) {
        console.log('No API key found in .env file');
        return;
    }

    const configContent = `// Configuration file for PlaceChase
// Auto-generated from .env file
window.PLACECHASE_CONFIG = {
    GOOGLE_API_KEY: '${apiKey}'
};
`;

    try {
        fs.writeFileSync('config.js', configContent);
        console.log('✅ config.js updated with API key from .env');
        console.log('🚀 You can now open index.html in your browser!');
    } catch (error) {
        console.error('Error writing config.js:', error.message);
    }
}

// Main execution
const apiKey = readEnvFile();
updateConfig(apiKey);
