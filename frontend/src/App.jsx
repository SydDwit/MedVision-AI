import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import XRay from './pages/XRay';
import RiskPrediction from './pages/RiskPrediction';
import Chatbot from './pages/Chatbot';
import Dashboard from './pages/Dashboard';
import Contact from './pages/Contact';
import './styles/globals.css';

function App() {
  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        
        {/* Main Content Area */}
        <main style={{ flexGrow: 1, backgroundColor: 'var(--background)' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/xray" element={<XRay />} />
            <Route path="/risk" element={<RiskPrediction />} />
            <Route path="/chat" element={<Chatbot />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
