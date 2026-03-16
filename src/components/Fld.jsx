import React from 'react';

const Fld = ({ 
  label,
  value,
  onChange,
  placeholder = '',
  type = 'text',
  disabled = false,
  readOnly = false,
  icon = null,
  style = {}
}) => {
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    width: '100%',
    ...style
  };

  const labelStyle = {
    fontSize: '13px',
    fontWeight: 500,
    color: readOnly ? '#4a6280' : '#dde6f0',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  };

  const inputContainerStyle = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  };

  const inputStyle = {
    width: '100%',
    padding: icon ? '12px 12px 12px 40px' : '12px 14px',
    background: readOnly ? '#0a1018' : '#0d1520',
    border: `1px solid ${readOnly ? '#1a3350' : '#1a3350'}`,
    borderRadius: '10px',
    color: readOnly ? '#4a6280' : '#dde6f0',
    fontSize: '14px',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'all 0.2s ease',
    cursor: readOnly ? 'not-allowed' : 'text'
  };

  const iconStyle = {
    position: 'absolute',
    left: '12px',
    color: '#4a6280',
    fontSize: '16px'
  };

  return (
    <div style={containerStyle}>
      <label style={labelStyle}>
        {label}
        {readOnly && <span>🔒</span>}
      </label>
      <div style={inputContainerStyle}>
        {icon && <span style={iconStyle}>{icon}</span>}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled || readOnly}
          readOnly={readOnly}
          style={inputStyle}
          onFocus={(e) => {
            if (!readOnly) {
              e.target.style.borderColor = '#00ffb2';
              e.target.style.boxShadow = '0 0 0 2px rgba(0, 255, 178, 0.1)';
            }
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#1a3350';
            e.target.style.boxShadow = 'none';
          }}
        />
      </div>
    </div>
  );
};

export default Fld;
