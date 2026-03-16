import React from 'react';

const Chip = ({ 
  children, 
  active = false, 
  onClick,
  color = '#4ade80',
  disabled = false
}) => {
  const baseStyle = {
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: 500,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    border: '1px solid',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px'
  };

  const activeStyle = {
    backgroundColor: color,
    color: '#070d17',
    borderColor: color
  };

  const inactiveStyle = {
    backgroundColor: 'transparent',
    color: '#dde6f0',
    borderColor: '#1a3350'
  };

  const disabledStyle = {
    opacity: 0.4,
    backgroundColor: '#0d1520',
    color: '#4a6280',
    borderColor: '#1a3350'
  };

  const style = disabled 
    ? { ...baseStyle, ...disabledStyle }
    : active 
      ? { ...baseStyle, ...activeStyle }
      : { ...baseStyle, ...inactiveStyle };

  return (
    <button
      onClick={!disabled ? onClick : undefined}
      style={style}
      onMouseEnter={(e) => {
        if (!disabled && !active) {
          e.target.style.borderColor = color;
          e.target.style.color = color;
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !active) {
          e.target.style.borderColor = '#1a3350';
          e.target.style.color = '#dde6f0';
        }
      }}
    >
      {children}
    </button>
  );
};

export default Chip;
