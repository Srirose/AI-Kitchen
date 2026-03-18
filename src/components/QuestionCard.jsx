import React from 'react';

const QuestionCard = ({ step, total, title, question, children, mealColor = '#4ade80' }) => {
  return (
    <div className="animate-fadeUp" style={{
      background: '#0d1520',
      borderRadius: '14px',
      border: `1.5px solid ${mealColor}33`,
      marginBottom: '16px',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        background: `${mealColor}0a`,
        borderBottom: `1px solid ${mealColor}22`
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '6px'
        }}>
          <span style={{
            fontSize: '10px',
            fontWeight: 800,
            color: mealColor,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            background: `${mealColor}22`,
            padding: '3px 8px',
            borderRadius: '4px'
          }}>
            📋 STEP {step} of {total}
          </span>
        </div>
        <div style={{
          fontSize: '15px',
          fontWeight: 700,
          color: '#dde6f0'
        }}>
          {title}
        </div>
      </div>
      
      {/* Question & Content */}
      <div style={{ padding: '16px' }}>
        {question && (
          <p style={{
            color: '#dde6f0',
            fontSize: '14px',
            lineHeight: 1.6,
            margin: '0 0 16px'
          }}>
            {question}
          </p>
        )}
        {children}
      </div>
    </div>
  );
};

export default QuestionCard;
