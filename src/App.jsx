import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuditProvider } from './context/AuditContext';
import Home from './pages/Home';
import LocationType from './pages/LocationType';
import Capture from './pages/Capture';
import Checklist from './pages/Checklist';
import HeatScore from './pages/HeatScore';
import Summary from './pages/Summary';

function App() {
  return (
    <AuditProvider>
      <div className="app-container">
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/location-type" element={<LocationType />} />
            <Route path="/capture" element={<Capture />} />
            <Route path="/checklist" element={<Checklist />} />
            <Route path="/heat-score" element={<HeatScore />} />
            <Route path="/summary" element={<Summary />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </div>
    </AuditProvider>
  );
}

export default App;
