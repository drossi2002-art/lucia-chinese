import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const startApp = () => {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error("Could not find root element to mount to");
  }

  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

// Defer running the app until the DOM is fully loaded.
// This is a robust way to prevent issues where the script runs before the #root element is available.
if (document.readyState === 'loading') {
  // Loading hasn't finished yet
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  // `DOMContentLoaded` has already fired
  startApp();
}
