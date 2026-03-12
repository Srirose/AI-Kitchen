import React from 'react';

const Btn = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false,
  onClick,
  type = 'button',
  style = {}
}) => {
  const variants = {
    primary: {
      background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
      color: '#070d17',
      border: 'none'
    },
    ghost: {
      background: 'transparent',
      color: '#dde6f0',
      border: '1px solid #1a3350'
    },
    danger: {
      background: 'linear-gradient(135deg, #f87171 0%, #dc2626 100%)',
      color: '#fff',
      border: 'none'
    },
    warn: {
      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      color: '#070d17',
      border: 'none'
    },
    sky: {
      background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
      color: '#fff',
      border: 'none'
    }
  };

  const sizes = {
    sm: { padding: '6px 12px', fontSize: '12px' },
    md: { padding: '10px 20px', fontSize: '14px' },
    lg: { padding: '14px 28px', fontSize: '16px' }
  };

  const baseStyle = {
    borderRadius: '10px',
    fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'all 0.2s ease',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    ...variants[variant],
    ...sizes[size],
    ...style
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={baseStyle}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
        }
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = 'translateY(0)';
        e.target.style.boxShadow = 'none';
      }}
    >
      {children}
    </button>
  );
};

export default Btn;
