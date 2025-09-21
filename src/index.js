import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

console.log("🚀 REACT APP STARTING");
console.log("Root element found:", !!document.getElementById('root'));
console.log("React version:", React.version);
console.log("ReactDOM version:", ReactDOM.version);

const root = ReactDOM.createRoot(document.getElementById('root'));
console.log("🎯 RENDERING APP TO ROOT");
root.render(<App />);
console.log("✅ APP RENDERED TO DOM");
