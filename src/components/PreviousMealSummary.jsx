import React from 'react';
import Bar from './Bar';

const PreviousMealSummary = ({ mealName, items, nutrients, remainingTarget, mealColor = '#4ade80' }) => {
  return (
    <div className="animate-fadeUp" style={{
      background: '#0d1520',
      borderRadius: '14px',
      border: '1.5px solid #1a3350',
      padding: '16px',
      marginBottom: '16px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '14px'
      }}>
        <span style={{ fontSize: '16px' }}>🍽️</span>
        <span style={{
          fontSize: '14px',
          fontWeight: 700,
          color: '#dde6f0'
        }}>
          {mealName} Nutrition Summary
        </span>
      </div>
      
      {/* Items */}
      <div style={{
        background: '#070d17',
        borderRadius: '8px',
        padding: '10px 12px',
        marginBottom: '12px'
      }}>
        <span style={{ color: '#4a6280', fontSize: '11px' }}>Items: </span>
        <span style={{ color: '#dde6f0', fontSize: '12px' }}>{items}</span>
      </div>
      
      {/* Mini Nutrition Bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#4a6280', fontSize: '11px', width: '55px' }}>Calories:</span>
          <span style={{ color: mealColor, fontSize: '12px', fontWeight: 700 }}>{nutrients?.calories || 0} kcal</span>
        </div>
        <Bar value={nutrients?.protein || 0} max={50} label="Protein" color="#f87171" height={6} />
        <Bar value={nutrients?.carbs || 0} max={150} label="Carbs" color="#f59e0b" height={6} />
        <Bar value={nutrients?.fat || 0} max={60} label="Fat" color="#818cf8" height={6} />
      </div>
      
      {/* Remaining Target */}
      {remainingTarget && (
        <div style={{
          background: `${mealColor}12`,
          borderRadius: '8px',
          padding: '10px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '12px' }}>✅</span>
          <span style={{ color: '#dde6f0', fontSize: '12px' }}>
            Good start! Your {remainingTarget.meal} target: <strong style={{ color: mealColor }}>~{remainingTarget.calories} kcal remaining</strong>
          </span>
        </div>
      )}
    </div>
  );
};

export default PreviousMealSummary;
