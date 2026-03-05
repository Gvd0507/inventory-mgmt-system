import React from 'react';
import Icon from './Icon';

function Toast({ message, type }) {
  return (
    <div className={`toast ${type}`}>
      <span style={{ fontSize: '20px' }}>
        {type === 'success' ? <Icon name="check" size={20} /> : <Icon name="error" size={20} />}
      </span>
      <span>{message}</span>
    </div>
  );
}

export default Toast;
