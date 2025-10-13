// Development entry point for Vite dev server
import React from 'react';
import ReactDOM from 'react-dom/client';
import { NanoVNASWRAnalyser } from './components/NanoVNASWRAnalyser';

// Simple dev page styling
const devStyles = `
  body {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
  }

  .dev-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px 20px;
  }

  .dev-header {
    text-align: center;
    color: white;
    margin-bottom: 40px;
  }

  .dev-header h1 {
    font-size: 2.5rem;
    margin-bottom: 10px;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
  }

  .dev-header p {
    font-size: 1.1rem;
    opacity: 0.95;
  }

  .analyser-container {
    background: white;
    border-radius: 12px;
    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
    overflow: hidden;
  }
`;

// Inject styles
const styleElement = document.createElement('style');
styleElement.innerHTML = devStyles;
document.head.appendChild(styleElement);

// Render the dev app
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <div className="dev-container">
      <div className="dev-header">
        <h1>NanoVNA SWR Analyser</h1>
        <p>Upload S-parameter files to visualize SWR across amateur radio bands</p>
      </div>
      <div className="analyser-container">
        <NanoVNASWRAnalyser
          showAllBands={false}
          chartHeight={350}
          onDataLoaded={(data) => {
            console.log('Data loaded:', data);
          }}
        />
      </div>
    </div>
  </React.StrictMode>
);