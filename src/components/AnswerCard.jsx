import React from 'react';

const AnswerCard = ({ answer, mealColor = '#4ade80' }) => {
  return (
    <div className="animate-popIn" style={{
      background: `${mealColor}12`,
      borderRadius: '12px',
      border: `1px solid ${mealColor}33`,
      padding: '12px 16px',
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '10px'
    }}>
      <span style={{
        fontSize: '14px',
        color: mealColor
      }}>✅</span>
      <div>
        <div style={{
          fontSize: '10px',
          fontWeight: 700,
          color: mealColor,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: '4px'
        }}>
          Your Answer
        </div>
        <div style={{
          fontSize: '13px',
          color: '#dde6f0',
          lineHeight: 1.5
        }}>
          "{answer}"
        </div>
      </div>
    </div>
  );
};

export default AnswerCard;
