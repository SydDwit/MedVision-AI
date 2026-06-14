import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import Home from './pages/Home';
import XRay from './pages/XRay';
import RiskPrediction from './pages/RiskPrediction';
import Chatbot from './pages/Chatbot';
import Dashboard from './pages/Dashboard';
import Contact from './pages/Contact';
import './styles/globals.css';

function AppContent() {
  const location = useLocation();
  const isChat = location.pathname === '/chat';

  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  });

  const toggleSidebar = () => {
    setIsCollapsed(prev => {
      const newVal = !prev;
      localStorage.setItem('sidebar-collapsed', JSON.stringify(newVal));
      return newVal;
    });
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
      
      {/* Main Content Area offset by Sidebar width */}
      <div 
        style={{ 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          marginLeft: isCollapsed ? 'var(--sidebar-width-collapsed)' : 'var(--sidebar-width-expanded)',
          transition: 'var(--sidebar-transition)',
          minHeight: '100vh',
          height: isChat ? '100vh' : 'auto',
          overflow: isChat ? 'hidden' : 'visible'
        }}
      >
        <main style={{ 
          flexGrow: 1, 
          backgroundColor: 'var(--background)',
          display: isChat ? 'flex' : 'block',
          flexDirection: isChat ? 'column' : 'row',
          overflow: isChat ? 'hidden' : 'visible'
        }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/xray" element={<XRay />} />
            <Route path="/risk" element={<RiskPrediction />} />
            <Route path="/chat" element={<Chatbot />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </main>

        {!isChat && <Footer />}
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
