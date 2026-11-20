import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AudioProvider } from './context/AudioContext';
import { SurpriseProvider } from './context/SurpriseContext';
import { ExperienceProvider } from './context/ExperienceContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AudioProvider>
      <SurpriseProvider>
        <ExperienceProvider>
          <App />
        </ExperienceProvider>
      </SurpriseProvider>
    </AudioProvider>
  </React.StrictMode>,
);
