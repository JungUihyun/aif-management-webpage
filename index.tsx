import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// HTML 파일의 root 엘리먼트를 찾습니다.
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

// React 애플리케이션을 마운트하고 렌더링합니다.
// StrictMode는 개발 모드에서 잠재적인 문제를 감지하기 위해 사용됩니다.
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
