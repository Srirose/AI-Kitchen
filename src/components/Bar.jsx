import React from 'react';

const Bar = ({ 
  value, 
  max = 100,
  label,
  color = '#4ade80',
  height = 12,
  showValue = true
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div style={{ width: '100%' }}>
      {(label || showValue) && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '6px'
        }}>
          {label && (
            <span style={{
              fontSize: '12px',
              color: '#4a6280',
              fontWeight: 500
            }}>
              {label}
            </span>
          )}
          {showValue && (
            <span style={{
              fontSize: '12px',
              color: '#dde6f0',
              fontWeight: 600
            }}>
              {value} / {max}
            </span>
          )}
        </div>
      )}
      <div style={{
        width: '100%',
        height: `${height}px`,
        background: '#0d1520',
        borderRadius: height / 2,
        overflow: 'hidden',
        border: '1px solid #1a3350'
      }}>
        <div style={{
          width: `${percentage}%`,
          height: '100%',
          background: `linear-gradient(90deg, ${color} 0%, ${color}dd 100%)`,
          borderRadius: height / 2,
          transition: 'width 0.5s ease'
        }} />
      </div>
    </div>
  );
};

export default Bar;
