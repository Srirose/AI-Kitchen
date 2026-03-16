import React from 'react';

const Bubble = ({ 
  message, 
  isUser = false, 
  imgPreview = null,
  timestamp
}) => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: '12px',
      animation: 'fadeUp 0.3s ease-out'
    }}>
      {!isUser && (
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #4ade80 0%, #0ea5e9 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: '8px',
          flexShrink: 0,
          fontSize: '16px'
        }}>
          🌿
        </div>
      )}
      
      <div style={{
        maxWidth: '75%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: isUser ? 'flex-end' : 'flex-start'
      }}>
        {imgPreview && (
          <div style={{
            marginBottom: '6px',
            borderRadius: '10px',
            overflow: 'hidden',
            maxWidth: '200px'
          }}>
            <img 
              src={imgPreview} 
              alt="Attached" 
              style={{
                width: '100%',
                height: 'auto',
                display: 'block'
              }}
            />
          </div>
        )}
        
        <div style={{
          padding: '12px 16px',
          borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
          background: isUser 
            ? 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)'
            : '#111e2e',
          color: '#dde6f0',
          fontSize: '14px',
          lineHeight: 1.5,
          border: isUser ? 'none' : '1px solid #1a3350'
        }}>
          {message}
        </div>
        
        {timestamp && (
          <span style={{
            fontSize: '11px',
            color: '#4a6280',
            marginTop: '4px'
          }}>
            {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
    </div>
  );
};

export default Bubble;
