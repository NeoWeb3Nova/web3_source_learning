import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.minimal.tsx';
import './index.css';
import { registerServiceWorker } from './utils/pwa';
import { initializeMonitoring } from './utils/monitoring';
import { initSentry } from './utils/sentry';
initSentry();
initializeMonitoring();
if (process.env.NODE_ENV === 'production') {
    registerServiceWorker();
}
ReactDOM.createRoot(document.getElementById('root')).render(_jsx(React.StrictMode, { children: _jsx(App, {}) }));
