import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium',
  disabled = false,
  loading = false,
  onClick,
  ...props 
}) => {
  const className = `btn btn--${variant} btn--${size} ${disabled || loading ? 'btn--disabled' : ''}`;

  return (
    <button 
      className={className}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
};

export default Button;