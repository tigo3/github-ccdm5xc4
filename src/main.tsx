import { createRoot } from 'react-dom/client';
import App from './App'; // Ensure the path is correct
import './assets/index.css';

createRoot(document.getElementById('root')!).render(
  // <StrictMode> // StrictMode removed again to suppress findDOMNode warnings from react-quill
    <App />
  // </StrictMode>
);
