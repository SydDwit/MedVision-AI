import React from 'react';

export const StatCard = ({ icon: Icon, value, label, description }) => {
  return (
    <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '20px' }}>
      <div className="card-icon-container" style={{ flexShrink: 0 }}>
        <Icon size={24} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
        <span style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary)', lineHeight: '1.1' }}>{value}</span>
        <span style={{ fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>{label}</span>
        {description && <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{description}</span>}
      </div>
    </div>
  );
};

export default StatCard;
