import React from 'react';

const Ring = ({ 
  value, 
  max = 100,
  size = 80,
  strokeWidth = 8,
  color = '#4ade80',
  label
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '8px'
    }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#1a3350"
            strokeWidth={strokeWidth}
          />
          {/* Progress ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center'
        }}>
          <span style={{
            fontSize: size > 100 ? '18px' : '14px',
            fontWeight: 700,
            color: '#dde6f0'
          }}>
            {Math.round(percentage)}%
          </span>
        </div>
      </div>
      {label && (
        <span style={{
          fontSize: '12px',
          color: '#4a6280',
          fontWeight: 500
        }}>
          {label}
        </span>
      )}
    </div>
  );
};

export default Ring;
