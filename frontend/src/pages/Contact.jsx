import React from 'react';
import { Mail, Phone, MapPin, Activity, Shield } from 'lucide-react';

export const Contact = () => {
  const locations = [
    {
      name: 'Norvic International Hospital',
      address: 'Thapathali, Kathmandu, Nepal',
      phone: '+977-1-5970032',
      email: 'info@norvichospital.com',
      image: '/images/norvic_hospital.png',
      color: '#7C3AED'
    },
    {
      name: 'Blue Cross Hospital',
      address: 'Tripureshwor, Kathmandu, Nepal',
      phone: '+977-1-4261290',
      email: 'info@bluecross.com.np',
      image: '/images/bluecross_hospital.jpg',
      color: '#8B5CF6'
    },
    {
      name: 'Grande International Hospital',
      address: 'Tokha, Kathmandu, Nepal',
      phone: '+977-1-5159266',
      email: 'info@grandehospital.com',
      image: '/images/grande_hospital.png',
      color: '#A855F7'
    },
    {
      name: 'Tribhuvan University Teaching Hospital (TUTH)',
      address: 'Maharajgunj, Kathmandu, Nepal',
      phone: '+977-1-4412505',
      email: 'info@tuth.org.np',
      image: '/images/tuth_hospital.png',
      color: '#EC4899'
    }
  ];

  return (
    <div>
      {/* Contact Split Hero Section */}
      <section className="section-padding container">
        <div className="hero-split">
          {/* Left Column: Visual (Doctors illustration silhouette in SVG) */}
          <div className="hero-visual">
            <svg width="100%" height="400" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ backgroundColor: 'var(--background-alt)', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: 'var(--card-shadow)' }}>
              {/* Decorative backgrounds */}
              <circle cx="200" cy="200" r="140" fill="rgba(124, 58, 237, 0.04)" />
              <circle cx="200" cy="200" r="100" fill="rgba(124, 58, 237, 0.06)" />
              
              {/* Waveform graphic */}
              <path d="M50 200 H120 L135 130 L155 270 L170 170 L180 220 L195 200 H350" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />

              {/* Two doctors silhouette SVG */}
              <g transform="translate(110, 110)">
                {/* Doctor 1 (Female) */}
                <circle cx="60" cy="60" r="30" fill="#E5E7EB" />
                <path d="M10 140 C10 100, 30 95, 60 95 C90 95, 110 100, 110 140 Z" fill="#9CA3AF" />
                {/* Doctor 2 (Male, foreground) */}
                <circle cx="120" cy="80" r="30" fill="#D1D5DB" />
                <path d="M70 160 C70 120, 90 115, 120 115 C150 115, 170 120, 170 160 Z" fill="#4B5563" />
                
                {/* Cross badge */}
                <circle cx="120" cy="115" r="14" fill="var(--primary)" />
                <path d="M120 109 V121 M114 115 H126" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
              </g>
            </svg>
          </div>

          {/* Right Column: Title & Description */}
          <div className="hero-text">
            <div>
              <span className="badge-pill">
                <Shield size={14} style={{ color: 'var(--primary)' }} />
                <span>Contact Channels</span>
              </span>
            </div>
            
            <h1 className="hero-heading" style={{ fontSize: '3rem' }}>
              Get in Touch with <br />
              <span style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                MedVision AI
              </span>
            </h1>

            <p className="hero-subheading">
              Our clinical research coordination centers are open for integrations, deployment consulting, and collaborative studies. Connect with one of our specialized departments below.
            </p>
          </div>
        </div>
      </section>

      {/* Location Cards Grid */}
      <section className="container" style={{ marginBottom: 'var(--space-80)' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-48)' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '8px' }}>
            Medical Institutes in Nepal
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
            Find location details and support channels for leading clinics and medical facilities in Nepal.
          </p>
        </div>

        <div className="grid-2-col" style={{ gap: '32px' }}>
          {locations.map((loc, idx) => (
            <div 
              key={idx} 
              className="card" 
              style={{ 
                padding: '0 0 24px 0', 
                overflow: 'hidden', 
                textAlign: 'left', 
                alignItems: 'stretch',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                {/* Hospital Image Visual */}
                <div style={{ width: '100%', height: '180px', overflow: 'hidden', borderBottom: '1px solid var(--border)' }}>
                  <img 
                    src={loc.image} 
                    alt={loc.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                
                {/* Info Area */}
                <div style={{ padding: '24px 24px 0 24px' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>
                    {loc.name}
                  </h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      <MapPin size={18} style={{ color: loc.color, flexShrink: 0 }} />
                      <span>{loc.address}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      <Phone size={18} style={{ color: loc.color, flexShrink: 0 }} />
                      <span>{loc.phone}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      <Mail size={18} style={{ color: loc.color, flexShrink: 0 }} />
                      <a href={`mailto:${loc.email}`} style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                        {loc.email}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Contact;
