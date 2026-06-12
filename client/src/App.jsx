import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import TendersPage from './pages/TendersPage';
import AnalyticsPage from './pages/AnalyticsPage';
import './index.css';

function App() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#12121c", color: "#eee" }}>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/tenders" element={<TendersPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
      </Routes>
    </div>
  );
}

export default App;
