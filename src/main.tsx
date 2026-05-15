import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

console.log('App initialization started');

// Detailed error reporting
window.onerror = function(message, source, lineno, colno, error) {
  console.error('Global Error:', { message, source, lineno, colno, error });
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `<div style="padding: 20px; color: red;">运行出错: ${message}<br/>建议：请尝试使用现代浏览器（如新版 Chrome / Edge / Safari）访问。</div>`;
  }
  return false;
};

// Clear existing SWs if any
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    for (const registration of registrations) {
      registration.unregister();
    }
  });
}

const rootElement = document.getElementById('root');
if (rootElement) {
  try {
    console.log('Attempting to render App');
    createRoot(rootElement).render(
      <App />
    );
    console.log('Render call completed');
  } catch (error) {
    console.error('Render Error:', error);
    rootElement.innerHTML = `<div style="padding: 20px; color: red;">组件渲染失败，请刷新或使用现代浏览器。</div>`;
  }
} else {
  console.error('Root element not found');
}
