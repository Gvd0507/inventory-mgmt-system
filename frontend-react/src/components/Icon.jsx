import React from 'react';

const Icon = ({ name, size = 20, className = '' }) => {
  return (
    <img 
      src={`/icons/${name}.svg`} 
      alt={name}
      width={size}
      height={size}
      className={`icon ${className}`}
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    />
  );
};

export default Icon;
