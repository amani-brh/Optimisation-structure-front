import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/global-v2.css';
import { StructureProvider } from './pages/StructureContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
  <BrowserRouter>
    <StructureProvider>
      <App />
    </StructureProvider>
  </BrowserRouter>
  </React.StrictMode>,
);
