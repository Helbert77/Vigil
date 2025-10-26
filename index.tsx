import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { SessionProvider } from '@/contexts/SessionContext';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { PresenceProvider } from './src/contexts/PresenceContext';
import ErrorBoundary from './src/components/common/ErrorBoundary';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <ErrorBoundary>
    <SessionProvider>
      <PresenceProvider>
        <ToastProvider>
          <ThemeProvider>
            <App />
            <SpeedInsights />
          </ThemeProvider>
        </ToastProvider>
      </PresenceProvider>
    </SessionProvider>
  </ErrorBoundary>
);

// Marca o body como carregado assim que o React renderizar
document.body.classList.add('loaded');