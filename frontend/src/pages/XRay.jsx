import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Activity, ShieldAlert, ArrowRight, CheckCircle2, AlertCircle, FileImage, Trash2 } from 'lucide-react';
import medvisionApi from '../api/medvisionApi';

export const XRay = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  
  // Local scan history
  const [scanHistory, setScanHistory] = useState([
    { id: '1', fileName: 'patient_7734_chest.png', result: 'NORMAL', confidence: 98.7, time: '10 mins ago' },
    { id: '2', fileName: 'patient_4190_chest.png', result: 'PNEUMONIA', confidence: 94.2, time: '1 hour ago' }
  ]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setError(null);
        setResult(null);
      } else {
        setError('Only image files (JPEG, PNG) are accepted.');
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setError(null);
        setResult(null);
      } else {
        setError('Only image files (JPEG, PNG) are accepted.');
      }
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await medvisionApi.analyzeImage(selectedFile);
      setResult(response);

      // Add to local history list
      const newScan = {
        id: Date.now().toString(),
        fileName: selectedFile.name,
        result: response.label,
        confidence: response.confidence,
        time: 'Just now'
      };
      setScanHistory(prev => [newScan, ...prev]);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail || 
        'Could not complete analysis. Ensure the FastAPI backend is running and the CV model is loaded.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section-padding container">
      {/* Page Title */}
      <div style={{ textAlign: 'left', marginBottom: 'var(--space-48)' }}>
        <span className="badge-pill" style={{ marginBottom: '16px' }}>
          <Activity size={14} style={{ color: 'var(--primary)' }} />
          <span>Computer Vision Diagnosis</span>
        </span>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '8px' }}>
          Chest X-Ray Analysis
        </h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', maxWidth: '700px' }}>
          Upload a patient's anterior-posterior chest X-ray image (DICOM export, JPEG, or PNG) to detect consolidation patterns indicating pneumonia.
        </p>
      </div>

      <div className="grid-2-col">
        {/* Left Column: Upload & Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-24)' }}>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)' }}>
              Upload Chest X-Ray
            </h2>

            {!previewUrl ? (
              // Drag & Drop Area
              <div 
                className={`upload-zone ${dragActive ? 'active' : ''}`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById('xray-file-input').click()}
              >
                <input 
                  id="xray-file-input"
                  type="file" 
                  accept="image/*" 
                  style={{ display: 'none' }} 
                  onChange={handleFileChange}
                />
                <Upload className="upload-icon" />
                <div>
                  <p style={{ fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>
                    Drag & drop X-ray image here
                  </p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    or click to browse from local computer
                  </p>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', backgroundColor: 'rgba(0,0,0,0.03)', padding: '6px 12px', borderRadius: '4px' }}>
                  Supported formats: PNG, JPG, JPEG
                </div>
              </div>
            ) : (
              // Image Preview
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)', backgroundColor: '#0B0F19', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '320px' }}>
                  <img 
                    src={previewUrl} 
                    alt="Chest X-Ray Preview" 
                    style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                  />
                  <button 
                    onClick={handleClear} 
                    className="btn btn-secondary btn-icon-only"
                    style={{ position: 'absolute', right: '12px', top: '12px', border: 'none', backgroundColor: 'rgba(255, 255, 255, 0.8)', padding: '8px', color: 'var(--danger)', borderRadius: '50%' }}
                    title="Remove image"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--background-alt)' }}>
                  <FileImage size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexGrow: 1 }}>
                    {selectedFile?.name}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', flexShrink: 0 }}>
                    {(selectedFile?.size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>

                {/* Submit action */}
                {!loading && (
                  <button onClick={handleAnalyze} className="btn btn-primary" style={{ width: '100%' }}>
                    <Activity size={18} />
                    <span>Run Diagnostic Model</span>
                  </button>
                )}
              </div>
            )}

            {/* Loading Indicator */}
            {loading && (
              <div className="loader-container" style={{ border: '1px solid var(--border)', borderRadius: '12px', backgroundColor: 'var(--background-alt)' }}>
                <div className="spinner"></div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>
                    Analyzing Chest X-Ray...
                  </p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Running ResNet-50 deep learning model.
                  </p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div style={{ display: 'flex', gap: '12px', padding: '16px', borderRadius: '10px', backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--danger)' }}>
                <AlertCircle size={20} style={{ flexShrink: 0 }} />
                <div style={{ textAlign: 'left', fontSize: '0.9rem' }}>
                  <p style={{ fontWeight: '700', marginBottom: '2px' }}>Diagnostic Error</p>
                  <p>{error}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Results & Scan History */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-24)' }}>
          {/* Diagnostic Result Output */}
          {result ? (
            <div className="card" style={{ borderLeft: `6px solid ${result.label === 'PNEUMONIA' ? 'var(--danger)' : 'var(--success)'}` }}>
              <div className="card-top">
                <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                  Diagnostic Classification
                </h2>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                  <span className={`badge-pill ${result.label === 'PNEUMONIA' ? 'badge-danger' : 'badge-success'}`} style={{ fontSize: '1.1rem', padding: '8px 20px', borderRadius: '8px' }}>
                    {result.label}
                  </span>
                  <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                    {result.confidence}% Confidence
                  </span>
                </div>

                <div style={{ marginTop: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>
                    <span>Pneumonia Infiltration Probability</span>
                    <span>{result.all_probs?.PNEUMONIA || result.confidence}%</span>
                  </div>
                  <div className="progress-container">
                    <div 
                      className="progress-fill" 
                      style={{ 
                        width: `${result.all_probs?.PNEUMONIA || (result.label === 'PNEUMONIA' ? result.confidence : 100 - result.confidence)}%`,
                        backgroundColor: result.label === 'PNEUMONIA' ? 'var(--danger)' : 'var(--success)'
                      }}
                    ></div>
                  </div>
                </div>

                <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: 'var(--background-alt)', border: '1px solid var(--border)', marginTop: '8px', textAlign: 'left' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Clinical Referral Guidance
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {result.label === 'PNEUMONIA' 
                      ? 'WARNING: Consolidation patterns observed. Recommend immediate patient clinical assessment including O2 saturation levels, respiratory rate, and CURB-65 calculation to determine outpatient vs. inpatient triage.'
                      : 'NORMAL: No significant consolidation or infiltrations detected by the ResNet-50 engine. Monitor clinical presentation if chest symptoms persist.'
                    }
                  </p>
                </div>
              </div>

              {result.label === 'PNEUMONIA' && (
                <button 
                  onClick={() => navigate('/risk')} 
                  className="btn btn-secondary"
                  style={{ marginTop: '24px', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                >
                  <span>Evaluate Severity Risk</span>
                  <ArrowRight size={16} />
                </button>
              )}
            </div>
          ) : (
            // Placeholder/Instructions when no result yet
            <div className="card" style={{ justifyContent: 'center', minHeight: '260px', borderStyle: 'dashed', opacity: 0.8 }}>
              <div style={{ textAlign: 'center', padding: '24px' }}>
                <Activity size={36} style={{ color: 'var(--text-secondary)', margin: '0 auto 16px auto', opacity: 0.6 }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>
                  Awaiting Scan Analysis
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '320px', margin: '0 auto' }}>
                  Upload a chest X-ray image and click "Run Diagnostic Model" to compute classification.
                </p>
              </div>
            </div>
          )}

          {/* Recent Scans (Clinical Workflow History) */}
          <div className="card" style={{ flexGrow: 1 }}>
            <div className="card-top">
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                Recent Scan Logs
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                {scanHistory.map((scan) => (
                  <div 
                    key={scan.id}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      padding: '12px 16px', 
                      border: '1px solid var(--border)', 
                      borderRadius: '10px', 
                      backgroundColor: 'var(--background-alt)' 
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'left', overflow: 'hidden' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {scan.fileName}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {scan.time}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      <span className={`badge-pill ${scan.result === 'PNEUMONIA' ? 'badge-danger' : 'badge-success'}`} style={{ fontSize: '0.7rem', padding: '4px 8px' }}>
                        {scan.result}
                      </span>
                      <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                        {scan.confidence}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default XRay;
