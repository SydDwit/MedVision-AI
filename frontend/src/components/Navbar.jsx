import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Activity, Calendar, Menu, X } from 'lucide-react';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'X-Ray Analysis', path: '/xray' },
    { name: 'Risk Prediction', path: '/risk' },
    { name: 'MedBot Chat', path: '/chat' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header className="header-sticky">
      <div className="container navbar-container">
        {/* Logo */}
        <NavLink to="/" className="logo-wrapper" onClick={closeMenu}>
          <Activity className="logo-icon" size={28} />
          <span>MedVision AI</span>
        </NavLink>

        {/* Desktop Links */}
        <nav className="nav-links">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Action Button (Desktop Only) */}
        <div style={{ display: 'none', gap: '16px', alignItems: 'center' }}>
          {/* We'll use media query display settings or standard styling */}
        </div>
        <NavLink
          to="/contact"
          className="btn btn-primary"
          style={{ display: 'none' }} // will display on desktop
          id="nav-cta-btn"
        >
          <Calendar size={16} />
          <span>Book Appointment</span>
        </NavLink>

        {/* CSS override to show CTA on desktop only */}
        <style>{`
          #nav-cta-btn {
            display: none !important;
          }
          @media (min-width: 768px) {
            #nav-cta-btn {
              display: inline-flex !important;
            }
          }
        `}</style>

        {/* Mobile Hamburger Button */}
        <button className="mobile-menu-btn" onClick={toggleMenu} aria-label="Toggle navigation menu">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="mobile-nav-drawer">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
              onClick={closeMenu}
              style={{ padding: '8px 0', fontSize: '1.1rem' }}
            >
              {item.name}
            </NavLink>
          ))}
          <NavLink
            to="/contact"
            className="btn btn-primary"
            onClick={closeMenu}
            style={{ marginTop: '8px', width: '100%' }}
          >
            <Calendar size={16} />
            <span>Book Appointment</span>
          </NavLink>
        </div>
      )}
    </header>
  );
};

export default Navbar;
