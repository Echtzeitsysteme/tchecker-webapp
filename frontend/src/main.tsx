import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage.tsx';
import CounterexampleDisplay from './pages/CounterexampleDisplay.tsx';
import WitnessDisplay from './pages/WitnessDisplay.tsx';
import './pages/index.css';
import './i18n';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage/>} />
        <Route path="/display-counterexample" element={<CounterexampleDisplay/>} />
        <Route path="/display-witness" element={<WitnessDisplay/>} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
