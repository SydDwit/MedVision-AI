import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Sparkles, Activity, FileText, CheckCircle2, ChevronRight, MessageSquare, ShieldAlert, Heart, Calendar } from 'lucide-react';
import FeatureCard from '../components/FeatureCard';

export const Home = () => {
  const navigate = useNavigate();

  return (
    <div>
      {/* Hero Section */}
      <section className="section-padding container">
        <div className="hero-split">
          {/* Left Column: Text & Badges */}
          <div className="hero-text">
            <div>
              <span className="badge-pill">
                <Shield size={14} style={{ color: 'var(--primary)' }} />
                <span>Clinical Grade Medical AI</span>
              </span>
            </div>
            
            <h1 className="hero-heading">
              AI-Powered <br />
              <span style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Pneumonia Detection
              </span>
            </h1>

            <p className="hero-subheading">
              A clinical decision support system combining deep learning chest X-ray screening, clinical risk calculations, and retrieval-augmented medical Q&A to assist physicians in diagnosing and managing community-acquired pneumonia.
            </p>

            <div className="hero-actions">
              <button onClick={() => navigate('/xray')} className="btn btn-primary">
                <Activity size={18} />
                <span>Start X-Ray Analysis</span>
              </button>
              <button onClick={() => navigate('/contact')} className="btn btn-secondary">
                <Calendar size={18} />
                <span>Book Consultation</span>
              </button>
            </div>

            {/* Trust Badges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-24)', marginTop: 'var(--space-16)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
                <span>HIPAA Compliant</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
                <span>DICOM Compatible</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
                <span>WHO & CDC Guidelines</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Visual Simulator */}
          <div className="hero-visual">
            <div className="helix-container" style={{ position: 'relative', width: '100%', height: '420px', backgroundColor: '#0B0F19', borderRadius: '24px', overflow: 'hidden', border: '1px solid #1E293B', boxShadow: 'var(--card-shadow)' }}>
              {/* Radar Rings */}
              <div className="pulse-ring" style={{ left: 'calc(50% - 160px)', top: 'calc(50% - 160px)' }}></div>
              <div className="pulse-ring" style={{ left: 'calc(50% - 160px)', top: 'calc(50% - 160px)', animationDelay: '2s' }}></div>

              {/* Grid Overlay */}
              <div style={{ position: 'absolute', inset: 0, opacity: 0.15, backgroundImage: 'linear-gradient(#7C3AED 1px, transparent 1px), linear-gradient(90deg, #7C3AED 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

              {/* Scanning Ray Line */}
              <div style={{ position: 'absolute', width: '100%', height: '2px', background: 'linear-gradient(90deg, transparent, #7C3AED, transparent)', top: '0', animation: 'scan-line 4s infinite ease-in-out' }}></div>

              {/* simulated chest X-ray SVG */}
              <svg width="240" height="240" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.7, position: 'absolute', top: 'calc(50% - 120px)', left: 'calc(50% - 120px)' }}>
                {/* Spine & ribs silhouette */}
                <path d="M50 5 V95 M50 25 C40 20, 20 25, 15 35 M50 25 C60 20, 80 25, 85 35 M50 40 C35 35, 15 42, 10 52 M50 40 C65 35, 85 42, 90 52 M50 55 C35 52, 15 60, 10 70 M50 55 C65 52, 85 60, 90 70 M50 70 C38 67, 18 78, 12 88 M50 70 C62 67, 82 78, 88 88" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
                {/* Lungs silhouette */}
                <path d="M44 20 C20 18 12 35 12 65 C12 75 22 80 40 75 C44 74 44 40 44 20 Z" fill="rgba(56, 189, 248, 0.08)" stroke="#0284C7" strokeWidth="1.5" />
                <path d="M56 20 C80 18 88 35 88 65 C88 75 78 80 60 75 C56 74 56 40 56 20 Z" fill="rgba(56, 189, 248, 0.08)" stroke="#0284C7" strokeWidth="1.5" />
                {/* Pneumonia infected patch highlight */}
                <circle cx="28" cy="52" r="10" fill="rgba(239, 68, 68, 0.25)" stroke="#EF4444" strokeWidth="1" strokeDasharray="3 3" />
                <circle cx="32" cy="58" r="6" fill="rgba(239, 68, 68, 0.3)" />
              </svg>

              {/* Floating Tech Overlay Card */}
              <div className="floating-overlay-card" style={{ left: '16px', bottom: '16px', maxWidth: '230px' }}>
                <Sparkles size={16} style={{ color: 'var(--primary)' }} />
                <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-primary)' }}>Bedside Decision Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="stats-bar-section">
        <div className="container stats-bar-grid">
          <div className="stat-item">
            <span className="stat-number">98.4%</span>
            <span className="stat-label">Diagnostic Accuracy</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">3 Models</span>
            <span className="stat-label">Trained Clinical Cores</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">10k+</span>
            <span className="stat-label">Scans Analyzed</span>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="section-padding container">
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-64)' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '16px', color: 'var(--text-primary)' }}>
            Multimodal Clinical Support Modules
          </h2>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
            Interact with our specialized clinical AI engines designed to support diagnostic and triage workflows.
          </p>
        </div>

        <div className="grid-3-col">
          <FeatureCard
            icon={Activity}
            title="Chest X-Ray Analysis"
            description="Upload patient chest X-rays to get rapid classification of NORMAL or PNEUMONIA, powered by a fine-tuned ResNet-50 CNN model."
            actionText="Analyze Scan"
            actionLink="/xray"
          />
          <FeatureCard
            icon={ShieldAlert}
            title="Severity Risk Prediction"
            description="Submit patient clinical inputs like vitals, symptoms, and comorbidities to assess mortality risk using a trained CURB-65 XGBoost model."
            actionText="Predict Risk"
            actionLink="/risk"
          />
          <FeatureCard
            icon={MessageSquare}
            title="MedBot RAG Assistant"
            description="Ask pneumonia-related questions and receive answers derived dynamically from WHO, CDC, and NIH manuals, generated by LLaMA 3."
            actionText="Consult MedBot"
            actionLink="/chat"
          />
        </div>
      </section>

      {/* Academic Credits & Development Team Section */}
      <section className="container" style={{ marginBottom: 'var(--space-80)' }}>
        <div className="gradient-section">
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-32)' }}>
            <h2 className="gradient-title">Project Development Team</h2>
            <p className="gradient-desc" style={{ maxWidth: '700px' }}>
              Developed as an academic Final Year Project. This system demonstrates the integration of computer vision, machine learning, and retrieval-augmented generation in a clinical diagnostic assistant prototype.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px', maxWidth: '800px', margin: '0 auto' }}>
            <style>{`
              .credits-grid {
                display: grid;
                grid-template-columns: 1fr;
                gap: 24px;
              }
              @media (min-width: 768px) {
                .credits-grid {
                  grid-template-columns: 1.2fr 0.8fr;
                  gap: 48px;
                }
              }
              .credits-group {
                text-align: left;
                background-color: rgba(255, 255, 255, 0.08);
                padding: 24px;
                border-radius: 12px;
                border: 1px solid rgba(255, 255, 255, 0.15);
              }
              .credits-title {
                font-size: 1.1rem;
                font-weight: 700;
                margin-bottom: 16px;
                color: #FFFFFF;
                border-bottom: 1px solid rgba(255, 255, 255, 0.2);
                padding-bottom: 8px;
                text-transform: uppercase;
                letter-spacing: 0.05em;
              }
              .credits-list {
                list-style: none;
                display: flex;
                flex-direction: column;
                gap: 12px;
              }
              .credits-item {
                display: flex;
                flex-direction: column;
                gap: 2px;
              }
              .credits-name {
                font-weight: 600;
                color: #FFFFFF;
                font-size: 0.95rem;
              }
              .credits-role {
                font-size: 0.8rem;
                color: rgba(255, 255, 255, 0.75);
              }
            `}</style>
            
            <div className="credits-grid">
              {/* Student Developers */}
              <div className="credits-group">
                <h3 className="credits-title">Student Developers</h3>
                <ul className="credits-list">
                  <li className="credits-item">
                    <span className="credits-name">Obin Bade Shrestha</span>
                    <span className="credits-role">UI / UX Designer</span>
                  </li>
                  <li className="credits-item">
                    <span className="credits-name">Siddhartha Shakya</span>
                    <span className="credits-role">Fullstack Developer</span>
                  </li>
                </ul>
              </div>

              {/* Institution / Program */}
              <div className="credits-group">
                <h3 className="credits-title">Academic Information</h3>
                <ul className="credits-list">
                  <li className="credits-item">
                    <span className="credits-name">Bachelor of Computer Applications (BCA)</span>
                    <span className="credits-role">Final Year Project</span>
                  </li>
                  <li className="credits-item" style={{ marginTop: '8px' }}>
                    <span className="credits-name" style={{ fontSize: '0.95rem' }}>Deerwalk College</span>
                    <span className="credits-role">Kathmandu, Nepal</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Keyframe Scan Line Animation */}
      <style>{`
        @keyframes scan-line {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default Home;
