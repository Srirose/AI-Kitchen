import React from 'react';

// Loading Card - shown while AI is processing
export const LoadingCard = ({ message = 'Generating recipes...' }) => (
  <div className="animate-fadeUp" style={{
    background: '#0d1520',
    borderRadius: '12px',
    border: '1px solid #1a3350',
    padding: '16px',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  }}>
    <div style={{
      width: '36px',
      height: '36px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #4ade80 0%, #0ea5e9 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div className="animate-spin" style={{
        width: '18px',
        height: '18px',
        border: '2px solid #fff',
        borderTopColor: 'transparent',
        borderRadius: '50%'
      }} />
    </div>
    <div>
      <div style={{ color: '#dde6f0', fontSize: '13px', fontWeight: 600 }}>🌿 NutriAI</div>
      <div style={{ color: '#4a6280', fontSize: '12px' }}>{message}</div>
    </div>
  </div>
);

// Recipes Ready Card - announcement banner
export const RecipesReadyCard = ({ count, mealColor = '#4ade80' }) => (
  <div className="animate-popIn" style={{
    background: `linear-gradient(135deg, ${mealColor}22 0%, ${mealColor}08 100%)`,
    borderRadius: '12px',
    border: `1.5px solid ${mealColor}44`,
    padding: '14px 16px',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <span style={{ fontSize: '20px' }}>🍳</span>
      <div>
        <div style={{ color: mealColor, fontSize: '14px', fontWeight: 800 }}>
          {count} Recipe{count > 1 ? 's' : ''} Ready!
        </div>
        <div style={{ color: '#4a6280', fontSize: '11px' }}>
          Scroll down to view
        </div>
      </div>
    </div>
    <span style={{ color: mealColor, fontSize: '18px' }}>↓</span>
  </div>
);

// User Query Card - right-aligned blue bubble
export const UserQueryCard = ({ query, imgPreview }) => (
  <div className="animate-fadeUp" style={{
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: '12px'
  }}>
    <div style={{
      maxWidth: '85%',
      background: '#0ea5e920',
      borderRadius: '14px 14px 4px 14px',
      border: '1px solid #0ea5e933',
      padding: '12px 14px'
    }}>
      {imgPreview && (
        <img 
          src={imgPreview} 
          alt="Attached" 
          style={{
            width: '100%',
            maxWidth: '180px',
            borderRadius: '8px',
            marginBottom: '8px'
          }}
        />
      )}
      <div style={{ color: '#dde6f0', fontSize: '13px', lineHeight: 1.5 }}>
        {query}
      </div>
    </div>
  </div>
);

// AI Answer Card - left-aligned with avatar
export const AIAnswerCard = ({ answer }) => (
  <div className="animate-fadeUp" style={{
    display: 'flex',
    gap: '10px',
    marginBottom: '12px'
  }}>
    <div style={{
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #4ade80 0%, #0ea5e9 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '14px',
      flexShrink: 0
    }}>
      🌿
    </div>
    <div style={{
      maxWidth: '85%',
      background: '#111e2e',
      borderRadius: '4px 14px 14px 14px',
      border: '1px solid #1a3350',
      padding: '12px 14px'
    }}>
      <div style={{
        color: '#4ade80',
        fontSize: '11px',
        fontWeight: 700,
        marginBottom: '6px'
      }}>
        NutriAI
      </div>
      <div style={{
        color: '#dde6f0',
        fontSize: '13px',
        lineHeight: 1.6,
        whiteSpace: 'pre-wrap'
      }}>
        {answer}
      </div>
    </div>
  </div>
);

export default { LoadingCard, RecipesReadyCard, UserQueryCard, AIAnswerCard };
