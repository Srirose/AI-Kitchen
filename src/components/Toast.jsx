import React from 'react';

const Toast = ({ toasts, removeToast }) => {
  const getToastStyle = (type) => {
    const styles = {
      success: {
        background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
        color: '#070d17'
      },
      warn: {
        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        color: '#070d17'
      },
      error: {
        background: 'linear-gradient(135deg, #f87171 0%, #dc2626 100%)',
        color: '#fff'
      },
      info: {
        background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
        color: '#fff'
      }
    };
    return styles[type] || styles.info;
  };

  const getIcon = (type) => {
    const icons = {
      success: '✓',
      warn: '⚠',
      error: '✕',
      info: 'ℹ'
    };
    return icons[type] || 'ℹ';
  };

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      width: '90%',
      maxWidth: '400px',
      pointerEvents: 'none'
    }}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          style={{
            padding: '12px 16px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '14px',
            fontWeight: 500,
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            animation: 'slideDown 0.3s ease-out',
            pointerEvents: 'auto',
            ...getToastStyle(toast.type)
          }}
        >
          <span style={{
            width: '22px',
            height: '22px',
            borderRadius: '50%',
            background: 'rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 700
          }}>
            {getIcon(toast.type)}
          </span>
          <span style={{ flex: 1 }}>{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              opacity: 0.7,
              color: 'inherit'
            }}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toast;
