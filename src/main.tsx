import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

if (import.meta.env.PROD) {
  const noop = () => {};
  console.log = noop;
  console.info = noop;
  console.debug = noop;
  // Preserve error but sanitize it (avoid logging full objects)
  const originalError = console.error;
  console.error = (...args) => {
    // Basic sanitization: convert objects to generic messages or just log strings
    const sanitizedArgs = args.map(arg => {
      if (arg instanceof Error) return arg.message;
      if (typeof arg === 'object' && arg !== null) return '[Redacted Object]';
      return arg;
    });
    originalError.apply(console, sanitizedArgs);
  };
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
