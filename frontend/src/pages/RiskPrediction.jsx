import React, { useState, useEffect } from 'react';
import { ShieldAlert, Activity, Heart, AlertCircle, Sparkles } from 'lucide-react';
import medvisionApi from '../api/medvisionApi';

export const RiskPrediction = () => {
  // Main form states
  const [formData, setFormData] = useState({
    age: 45,
    gender: 1, // 0=Female, 1=Male
    temperature_celsius: 38.0,
    spo2_percent: 95,
    respiratory_rate: 18,
    wbc_count_x10: 8.0,
    cough_duration_days: 3,
    chest_pain: 0,
    smoker: 0,
    diabetes: 0,
    hypertension: 0,
    prior_pneumonia: 0,
    copd: 0,
    confusion: 0,
    blood_pressure_systolic: 120,
  });

  // CURB-65 calculated flags (for visual display & quick calculation)
  const [curbFlags, setCurbFlags] = useState({
    confusion: false,
    urea: false, // WBC > 15 in this dataset
    rr: false,    // RR >= 30
    bp: false,    // Systolic BP < 90
    age: false,   // Age >= 65
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  // Sync vitals to CURB-65 checkboxes
  useEffect(() => {
    setCurbFlags({
      confusion: formData.confusion === 1,
      urea: formData.wbc_count_x10 > 15,
      rr: formData.respiratory_rate >= 30,
      bp: formData.blood_pressure_systolic < 90,
      age: formData.age >= 65,
    });
  }, [formData.age, formData.confusion, formData.wbc_count_x10, formData.respiratory_rate, formData.blood_pressure_systolic]);

  // Calculate live preview CURB-65 score
  const curb65Score = Object.values(curbFlags).filter(Boolean).length;

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Sync checkboxes back to fields
  const handleCurbCheckboxChange = (flag, checked) => {
    if (flag === 'confusion') {
      handleInputChange('confusion', checked ? 1 : 0);
    } else if (flag === 'age') {
      handleInputChange('age', checked ? Math.max(65, formData.age) : Math.min(64, formData.age));
    } else if (flag === 'rr') {
      handleInputChange('respiratory_rate', checked ? Math.max(30, formData.respiratory_rate) : Math.min(29, formData.respiratory_rate));
    } else if (flag === 'bp') {
      handleInputChange('blood_pressure_systolic', checked ? Math.min(89, formData.blood_pressure_systolic) : Math.max(90, formData.blood_pressure_systolic));
    } else if (flag === 'urea') {
      handleInputChange('wbc_count_x10', checked ? Math.max(16, formData.wbc_count_x10) : Math.min(15, formData.wbc_count_x10));
    }
  };

  const handleCheckboxChange = (field, checked) => {
    handleInputChange(field, checked ? 1 : 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    // Parse values to correct type (floats and ints)
    const payload = {
      age: parseFloat(formData.age),
      gender: parseInt(formData.gender),
      temperature_celsius: parseFloat(formData.temperature_celsius),
      spo2_percent: parseFloat(formData.spo2_percent),
      respiratory_rate: parseFloat(formData.respiratory_rate),
      wbc_count_x10: parseFloat(formData.wbc_count_x10),
      cough_duration_days: parseInt(formData.cough_duration_days),
      chest_pain: parseInt(formData.chest_pain),
      smoker: parseInt(formData.smoker),
      diabetes: parseInt(formData.diabetes),
      hypertension: parseInt(formData.hypertension),
      prior_pneumonia: parseInt(formData.prior_pneumonia),
      copd: parseInt(formData.copd),
      confusion: parseInt(formData.confusion),
      blood_pressure_systolic: parseFloat(formData.blood_pressure_systolic),
    };

    try {
      const response = await medvisionApi.predictRisk(payload);
      setResult(response);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail || 
        'Could not complete prediction. Check if the backend is running and the XGBoost models are trained.'
      );
    } finally {
      setLoading(false);
    }
  };

  const getCurbRecommendation = (score) => {
    if (score <= 1) return { text: 'Low mortality risk. Outpatient management is typically safe and recommended.', style: 'badge-success' };
    if (score === 2) return { text: 'Moderate risk. Consider short-stay inpatient treatment or close outpatient monitoring.', style: 'badge-pill' };
    return { text: 'Severe risk of mortality. Urgent hospital admission and assessment for intensive care (ICU) support is indicated.', style: 'badge-danger' };
  };

  const recommendation = getCurbRecommendation(curb65Score);

  return (
    <div className="section-padding container">
      {/* Page Title */}
      <div style={{ textAlign: 'left', marginBottom: 'var(--space-48)' }}>
        <span className="badge-pill" style={{ marginBottom: '16px' }}>
          <ShieldAlert size={14} style={{ color: 'var(--primary)' }} />
          <span>Patient Triage Risk Scoring</span>
        </span>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '8px' }}>
          Severity & Risk Prediction
        </h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', maxWidth: '700px' }}>
          Evaluate a patient's pneumonia prognosis. Enter diagnostic vitals and medical history to calculate severe risk probabilities.
        </p>
      </div>

      <div className="grid-2-col">
        {/* Left Column: Form */}
        <form onSubmit={handleSubmit} className="card" style={{ gap: '16px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>
            Clinical Parameters Form
          </h2>

          {/* Section 1: Demographics & Vitals */}
          <div>
            <div className="form-section-header">Demographics & Vitals</div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Age (years)</label>
                <input 
                  type="number" 
                  min="0" max="120"
                  className="form-input" 
                  value={formData.age} 
                  onChange={(e) => handleInputChange('age', parseInt(e.target.value) || 0)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select 
                  className="form-input"
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', parseInt(e.target.value))}
                >
                  <option value="1">Male</option>
                  <option value="0">Female</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label">Temperature (°C)</label>
                  <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--primary)' }}>{formData.temperature_celsius} °C</span>
                </div>
                <input 
                  type="range" 
                  step="0.1" min="35" max="42"
                  className="form-range" 
                  value={formData.temperature_celsius} 
                  onChange={(e) => handleInputChange('temperature_celsius', parseFloat(e.target.value) || 37.0)}
                />
              </div>
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label">Oxygen Saturation - SpO2 (%)</label>
                  <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--primary)' }}>{formData.spo2_percent}%</span>
                </div>
                <input 
                  type="range" 
                  min="50" max="100"
                  className="form-range" 
                  value={formData.spo2_percent} 
                  onChange={(e) => handleInputChange('spo2_percent', parseFloat(e.target.value) || 95)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label">Respiratory Rate (breaths/min)</label>
                  <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--primary)' }}>{formData.respiratory_rate} bpm</span>
                </div>
                <input 
                  type="range" 
                  min="5" max="60"
                  className="form-range" 
                  value={formData.respiratory_rate} 
                  onChange={(e) => handleInputChange('respiratory_rate', parseFloat(e.target.value) || 18)}
                />
              </div>
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label">Systolic Blood Pressure (mmHg)</label>
                  <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--primary)' }}>{formData.blood_pressure_systolic} mmHg</span>
                </div>
                <input 
                  type="range" 
                  min="50" max="200"
                  className="form-range" 
                  value={formData.blood_pressure_systolic} 
                  onChange={(e) => handleInputChange('blood_pressure_systolic', parseFloat(e.target.value) || 120)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label">WBC Count (×10³/µL)</label>
                  <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--primary)' }}>{formData.wbc_count_x10} ×10³/µL</span>
                </div>
                <input 
                  type="range" 
                  step="0.1" min="1" max="30"
                  className="form-range" 
                  value={formData.wbc_count_x10} 
                  onChange={(e) => handleInputChange('wbc_count_x10', parseFloat(e.target.value) || 8.0)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Cough Duration (days)</label>
                <input 
                  type="number" 
                  min="0" max="60"
                  className="form-input" 
                  value={formData.cough_duration_days} 
                  onChange={(e) => handleInputChange('cough_duration_days', parseInt(e.target.value) || 0)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 2: CURB-65 Criteria Sync */}
          <div>
            <div className="form-section-header">CURB-65 Component Flags</div>
            <div className="checkbox-grid">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={curbFlags.confusion} 
                  onChange={(e) => handleCurbCheckboxChange('confusion', e.target.checked)} 
                />
                <span>Mental Confusion</span>
              </label>
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={curbFlags.urea} 
                  onChange={(e) => handleCurbCheckboxChange('urea', e.target.checked)} 
                />
                <span>WBC &gt; 15 (Urea proxy)</span>
              </label>
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={curbFlags.rr} 
                  onChange={(e) => handleCurbCheckboxChange('rr', e.target.checked)} 
                />
                <span>Resp Rate &ge; 30 bpm</span>
              </label>
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={curbFlags.bp} 
                  onChange={(e) => handleCurbCheckboxChange('bp', e.target.checked)} 
                />
                <span>Systolic BP &lt; 90 mmHg</span>
              </label>
              <label className="checkbox-label" style={{ gridColumn: 'span 2' }}>
                <input 
                  type="checkbox" 
                  checked={curbFlags.age} 
                  onChange={(e) => handleCurbCheckboxChange('age', e.target.checked)} 
                />
                <span>Advanced Age (&ge; 65 years)</span>
              </label>
            </div>
          </div>

          {/* Section 3: Symptoms & Comorbidities */}
          <div>
            <div className="form-section-header">Symptoms & Comorbidities</div>
            <div className="checkbox-grid">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={formData.chest_pain === 1} 
                  onChange={(e) => handleCheckboxChange('chest_pain', e.target.checked)} 
                />
                <span>Chest Pain</span>
              </label>
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={formData.smoker === 1} 
                  onChange={(e) => handleCheckboxChange('smoker', e.target.checked)} 
                />
                <span>Active Smoker</span>
              </label>
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={formData.diabetes === 1} 
                  onChange={(e) => handleCheckboxChange('diabetes', e.target.checked)} 
                />
                <span>Diabetes Mellitus</span>
              </label>
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={formData.hypertension === 1} 
                  onChange={(e) => handleCheckboxChange('hypertension', e.target.checked)} 
                />
                <span>Hypertension</span>
              </label>
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={formData.copd === 1} 
                  onChange={(e) => handleCheckboxChange('copd', e.target.checked)} 
                />
                <span>COPD History</span>
              </label>
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={formData.prior_pneumonia === 1} 
                  onChange={(e) => handleCheckboxChange('prior_pneumonia', e.target.checked)} 
                />
                <span>Prior Pneumonia</span>
              </label>
            </div>
          </div>

          {/* Button placement wrapper (Centered desktop, full width mobile) */}
          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center' }}>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
              id="risk-submit-btn"
            >
              <span>Predict Severity</span>
            </button>
          </div>

          <style>{`
            #risk-submit-btn {
              width: 100%;
            }
            @media (min-width: 768px) {
              #risk-submit-btn {
                width: 260px;
              }
            }
          `}</style>
        </form>

        {/* Right Column: Calculations & Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-24)' }}>
          {/* Live Preview CURB-65 Card */}
          <div className="card" style={{ flexGrow: 0 }}>
            <div className="card-top">
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                CURB-65 Scoring Index (Preview)
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Standardized clinical criteria score for pneumonia-associated mortality.
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '16px' }}>
                <div style={{ fontSize: '3rem', fontWeight: '800', color: curb65Score >= 3 ? 'var(--danger)' : curb65Score === 2 ? 'var(--primary)' : 'var(--success)' }}>
                  {curb65Score}
                  <span style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', fontWeight: '500' }}>/5</span>
                </div>
                <div className={`badge-pill ${curb65Score >= 3 ? 'badge-danger' : curb65Score === 2 ? '' : 'badge-success'}`} style={{ padding: '8px 16px', borderRadius: '8px' }}>
                  {curb65Score >= 3 ? 'HIGH RISK' : curb65Score === 2 ? 'MODERATE RISK' : 'LOW RISK'}
                </div>
              </div>

              <div style={{ marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'left' }}>
                <strong>Triage Guideline:</strong> {recommendation.text}
              </div>
            </div>
          </div>

          {/* ML Model Result Card */}
          {loading && (
            <div className="card" style={{ justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
              <div className="spinner"></div>
              <p style={{ fontWeight: '700', color: 'var(--text-primary)', marginTop: '16px' }}>
                Running Severity Classifier...
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Calculating XGBoost & Random Forest probability matrices.
              </p>
            </div>
          )}

          {error && (
            <div className="card" style={{ borderColor: 'rgba(239, 68, 68, 0.2)', backgroundColor: 'rgba(239, 68, 68, 0.04)' }}>
              <div style={{ display: 'flex', gap: '12px', color: 'var(--danger)', textAlign: 'left' }}>
                <AlertCircle size={20} style={{ flexShrink: 0 }} />
                <div>
                  <h4 style={{ fontWeight: '700', fontSize: '0.95rem' }}>Prediction Failed</h4>
                  <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>{error}</p>
                </div>
              </div>
            </div>
          )}

          {result ? (
            <div className="card" style={{ borderLeft: `6px solid ${result.severity === 'Severe' ? 'var(--danger)' : 'var(--success)'}` }}>
              <div className="card-top">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                    Severity Evaluation Result
                  </h2>
                  <span className="badge-pill" style={{ textTransform: 'none' }}>
                    <Sparkles size={12} style={{ color: 'var(--primary)' }} />
                    <span>{result.model_used}</span>
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '16px' }}>
                  <span className={`badge-pill ${result.severity === 'Severe' ? 'badge-danger' : 'badge-success'}`} style={{ fontSize: '1.1rem', padding: '8px 20px', borderRadius: '8px' }}>
                    {result.severity}
                  </span>
                  <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                    {result.severe_probability}% Severe Prob
                  </span>
                </div>

                {/* Progress bar risk gauge */}
                <div style={{ marginTop: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>
                    <span>Mortality Risk Index</span>
                    <span>{result.severe_probability}%</span>
                  </div>
                  <div className="progress-container">
                    <div 
                      className="progress-fill" 
                      style={{ 
                        width: `${result.severe_probability}%`, 
                        backgroundColor: result.severity === 'Severe' ? 'var(--danger)' : 'var(--success)'
                      }}
                    ></div>
                  </div>
                </div>

                {/* Patient summary details */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Comorbidities</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-primary)' }}>{result.comorbidity_count} Active</div>
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>CURB-65 Score</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-primary)' }}>{result.curb65_score}/5</div>
                  </div>
                </div>

                {/* Medical recommendation details */}
                <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: 'var(--background-alt)', border: '1px solid var(--border)', marginTop: '8px', textAlign: 'left' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Clinical Recommendation
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {result.severity === 'Severe' 
                      ? 'RECOMMENDATION: Triage to higher care level. High risk score requires constant SPO2 monitoring, arterial blood gas studies, and initiation of intravenous empiric antibiotics in an inpatient facility.'
                      : 'RECOMMENDATION: Outpatient or short-stay observation appropriate if vitals remain stable. Schedule clinical follow-up in 48-72 hours to re-evaluate chest presentation.'
                    }
                  </p>
                </div>
              </div>
            </div>
          ) : (
            // Result placeholder before calculation
            !loading && (
              <div className="card" style={{ justifyContent: 'center', minHeight: '300px', borderStyle: 'dashed', opacity: 0.8 }}>
                <div style={{ textAlign: 'center', padding: '24px' }}>
                  <Heart size={36} style={{ color: 'var(--text-secondary)', margin: '0 auto 16px auto', opacity: 0.6 }} />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>
                    Awaiting Evaluation
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '300px', margin: '0 auto' }}>
                    Fill out the patient form and click "Predict Severity" to query models.
                  </p>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default RiskPrediction;
