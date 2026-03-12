import React from 'react';

const BreakfastSkippedCard = () => {
  return (
    <div className="animate-fadeUp" style={{
      background: '#1a1510',
      borderRadius: '14px',
      border: '1.5px solid #f59e0b44',
      padding: '16px',
      marginBottom: '16px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '12px'
      }}>
        <span style={{ fontSize: '18px' }}>⚠️</span>
        <span style={{
          fontSize: '15px',
          fontWeight: 800,
          color: '#f59e0b'
        }}>
          Breakfast Skipped
        </span>
      </div>
      
      <p style={{
        color: '#dde6f0',
        fontSize: '13px',
        lineHeight: 1.6,
        marginBottom: '12px',
        margin: 0,
        marginBottom: '12px'
      }}>
        Skipping breakfast can lead to:
      </p>
      
      <ul style={{
        color: '#4a6280',
        fontSize: '12px',
        lineHeight: 2,
        margin: 0,
        paddingLeft: '20px',
        marginBottom: '14px'
      }}>
        <li>Lower metabolism</li>
        <li>Overeating at lunch</li>
        <li>Low energy & concentration</li>
        <li>Blood sugar dips</li>
      </ul>
      
      <div style={{
        background: '#f59e0b15',
        borderRadius: '8px',
        padding: '10px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <span style={{ fontSize: '12px' }}>📌</span>
        <span style={{
          fontSize: '11px',
          color: '#f59e0b',
          fontStyle: 'italic'
        }}>
          Noted in your profile — we'll remind you tomorrow morning!
        </span>
      </div>
    </div>
  );
};

export default BreakfastSkippedCard;
