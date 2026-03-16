import React from 'react';

const StepCard = ({ step, total, title, children, mealColor }) => {
  return (
    <div style={{
      background: '#0d1520',
      borderRadius: '12px',
      border: `1.5px solid ${mealColor}44`,
      marginBottom: '16px',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        background: `${mealColor}12`,
        borderBottom: `1px solid ${mealColor}33`
      }}>
        <div style={{
          fontSize: '10px',
          fontWeight: 800,
          color: mealColor,
          textTransform: 'uppercase',
          letterSpacing: '1px',
          marginBottom: '4px'
        }}>
          📋 STEP {step} of {total}
        </div>
        <div style={{
          fontSize: '14px',
          fontWeight: 700,
          color: '#dde6f0'
        }}>
          {title}
        </div>
      </div>
      
      {/* Content */}
      <div style={{ padding: '16px' }}>
        {children}
      </div>
    </div>
  );
};

export default StepCard;
