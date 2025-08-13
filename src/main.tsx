import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// PWA 和监控服务
import { registerServiceWorker, unregisterServiceWorker } from './utils/pwa';
import { initializeMonitoring } from './utils/monitoring';
import { initSentry } from './utils/sentry';

// 初始化监控服务
initSentry();
initializeMonitoring();

// 注册/注销 Service Worker
if (import.meta.env.PROD) {
  registerServiceWorker();
} else {
  // 在开发环境中注销任何现有的 Service Worker
  unregisterServiceWorker();
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);