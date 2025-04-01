import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App'; // Ensure the path is correct
import './assets/index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
