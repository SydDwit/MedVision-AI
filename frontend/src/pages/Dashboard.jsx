import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Activity, ShieldAlert, BarChart3, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';
import StatCard from '../components/StatCard';

export const Dashboard = () => {
  // Mock data for Recharts
  const accuracyData = [
    { name: 'ResNet-50 CNN', Accuracy: 98.4, fill: '#7C3AED' },
    { name: 'XGBoost Risk', Accuracy: 96.2, fill: '#8B5CF6' },
    { name: 'Random Forest', Accuracy: 93.8, fill: '#A855F7' },
    { name: 'Clinician Baseline', Accuracy: 85.0, fill: '#9CA3AF' }
  ];

  const distributionData = [
    { name: 'Normal Scans', value: 5400, color: '#10B981' },
    { name: 'Pneumonia Scans', value: 4600, color: '#EF4444' }
  ];

  const trendData = [
    { week: 'Week 1', Confidence: 91.2 },
    { week: 'Week 2', Confidence: 92.5 },
    { week: 'Week 3', Confidence: 93.1 },
    { week: 'Week 4', Confidence: 95.8 },
    { week: 'Week 5', Confidence: 96.4 },
    { week: 'Week 6', Confidence: 98.4 }
  ];

  return (
    <div className="section-padding container">
      {/* Page Title */}
      <div style={{ display: 'flex', flexDirection: 'column', mdDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: 'var(--space-48)' }}>
        <div style={{ textAlign: 'left' }}>
          <span className="badge-pill" style={{ marginBottom: '16px' }}>
            <BarChart3 size={14} style={{ color: 'var(--primary)' }} />
            <span>AI Model Analytics</span>
          </span>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '8px' }}>
            Model Performance Dashboard
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', maxWidth: '700px' }}>
            Inspect validation metrics, dataset distribution diagnostics, and model convergence profiles for the active clinical engines.
          </p>
        </div>
      </div>

      {/* Database connection notice */}
      <div style={{ display: 'flex', gap: '12px', padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(124, 58, 237, 0.05)', border: '1px solid rgba(124, 58, 237, 0.15)', color: 'var(--primary)', marginBottom: 'var(--space-32)', textAlign: 'left', alignItems: 'center' }}>
        <AlertCircle size={20} style={{ flexShrink: 0 }} />
        <div style={{ fontSize: '0.9rem' }}>
          <strong>Clinical Integration:</strong> Currently displaying mock validation metrics and static training logs. Connect this interface to database endpoints (such as PostgreSQL or MongoDB) for real-time clinician statistics.
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid-3-col" style={{ marginBottom: 'var(--space-48)' }}>
        <StatCard
          icon={Activity}
          value="98.4%"
          label="CNN Diagnostic Accuracy"
          description="Validation score on Kaggle Chest X-Ray dataset"
        />
        <StatCard
          icon={ShieldAlert}
          value="96.2%"
          label="Risk XGBoost Accuracy"
          description="F1 validation score on CURB-65 criteria"
        />
        <StatCard
          icon={TrendingUp}
          value="10,000"
          label="Scans Cataloged"
          description="Total clinical records in historical indexes"
        />
      </div>

      {/* Chart Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-32)', alignItems: 'stretch' }}>
        
        {/* Row 1: Model comparison bar chart */}
        <div className="card" style={{ height: '400px' }}>
          <div className="card-top" style={{ marginBottom: '16px' }}>
            <h3 className="card-title">Model Accuracy Comparison</h3>
            <p className="card-description">F1 and accuracy comparison of MedVision AI models against typical clinician baselines.</p>
          </div>
          <div style={{ width: '100%', height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={accuracyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#6B7280" fontSize={12} tickLine={false} />
                <YAxis domain={[50, 100]} stroke="#6B7280" fontSize={12} tickLine={false} />
                <Tooltip formatter={(value) => [`${value}%`, 'Accuracy']} contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB' }} />
                <Bar dataKey="Accuracy" radius={[6, 6, 0, 0]} barSize={40}>
                  {accuracyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Row 2: Grid of Pie and Line */}
        <div className="grid-2-col">
          {/* Pie Chart: Scan distribution */}
          <div className="card" style={{ height: '400px' }}>
            <div className="card-top" style={{ marginBottom: '16px' }}>
              <h3 className="card-title">Chest Scan Diagnostics Ratio</h3>
              <p className="card-description">Classification breakdown across all evaluated records.</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', height: '280px' }}>
              <div style={{ width: '60%', height: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend labels */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '40%', textAlign: 'left' }}>
                {distributionData.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: item.color, flexShrink: 0 }}></div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)' }}>{item.name}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.value} scans ({(item.value / 10000 * 100).toFixed(0)}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Line Chart: Confidence convergence trend */}
          <div className="card" style={{ height: '400px' }}>
            <div className="card-top" style={{ marginBottom: '16px' }}>
              <h3 className="card-title">ResNet-50 Validation Trend</h3>
              <p className="card-description">Weekly training accuracy convergence profile under active optimization.</p>
            </div>
            <div style={{ width: '100%', height: '280px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                  <XAxis dataKey="week" stroke="#6B7280" fontSize={12} tickLine={false} />
                  <YAxis domain={[90, 100]} stroke="#6B7280" fontSize={12} tickLine={false} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Accuracy']} contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB' }} />
                  <Line 
                    type="monotone" 
                    dataKey="Confidence" 
                    stroke="var(--primary)" 
                    strokeWidth={3} 
                    dot={{ r: 6, fill: '#FFFFFF', stroke: 'var(--primary)', strokeWidth: 3 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
