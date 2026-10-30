import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SiteProvider } from './api/SiteProvider';
import { I18nProvider } from './i18n';
import { initAnalytics } from './utils/analytics';
import './index.css';

initAnalytics();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <I18nProvider>
        <SiteProvider>
          <App />
        </SiteProvider>
      </I18nProvider>
    </ErrorBoundary>
  </StrictMode>,
);
