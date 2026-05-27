import React from 'react';
import { NavLink } from 'react-router-dom';
import { Activity, Mail, Phone, MapPin } from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand block */}
          <div>
            <NavLink to="/" className="footer-logo">
              <Activity className="logo-icon" size={24} />
              <span>MedVision AI</span>
            </NavLink>
            <p className="footer-desc" style={{ marginBottom: '16px' }}>
              A clinical decision support system combining computer vision, machine learning, and medical retrieval-augmented generation.
            </p>
            <p className="footer-desc" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Note: This is a clinical prototype. All recommendations should be medically verified by a qualified professional.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="footer-heading">Services</h4>
            <ul className="footer-links">
              <li><NavLink to="/xray">X-Ray Analysis</NavLink></li>
              <li><NavLink to="/risk">Risk Prediction</NavLink></li>
              <li><NavLink to="/chat">MedBot Medical Q&A</NavLink></li>
            </ul>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="footer-heading">Navigation</h4>
            <ul className="footer-links">
              <li><NavLink to="/">Home</NavLink></li>
              <li><NavLink to="/dashboard">Performance Dashboard</NavLink></li>
              <li><NavLink to="/contact">Contact & Locations</NavLink></li>
            </ul>
          </div>

          {/* Contact details */}
          <div>
            <h4 className="footer-heading">Contact & Support</h4>
            <div className="footer-info-item">
              <MapPin size={16} className="logo-icon" style={{ flexShrink: 0 }} />
              <span>100 Health Science Blvd, Medical City, MC 90210</span>
            </div>
            <div className="footer-info-item">
              <Phone size={16} className="logo-icon" style={{ flexShrink: 0 }} />
              <span>+1 (555) 321-4700</span>
            </div>
            <div className="footer-info-item">
              <Mail size={16} className="logo-icon" style={{ flexShrink: 0 }} />
              <span>support@medvision-ai.org</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copy">
            &copy; {currentYear} MedVision AI. Built as a clinical research final-year project. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>HIPAA Compliant</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>DICOM Compatible</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
