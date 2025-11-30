import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');

if (!rootElement) {
  document.body.innerHTML = '<div style="color:red; padding:20px;">Error: Could not find root element to mount to.</div>';
  throw new Error("Could not find root element to mount to");
}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error("Root Render Error:", error);
  rootElement.innerHTML = `<div style="padding: 20px; color: red;"><h2>Failed to start application</h2><pre>${error instanceof Error ? error.message : String(error)}</pre></div>`;
}
