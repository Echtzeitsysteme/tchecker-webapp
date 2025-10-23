import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage.tsx';
import CertificateDisplay from './pages/CertificateDisplay.tsx';
import './pages/index.css';
import './i18n';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage/>} />
        <Route path="/certificate" element={<CertificateDisplay/>} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
