import React from 'react';

function Toast({ message, type }) {
  return (
    <div className={`toast ${type}`}>
      <span style={{ fontSize: '20px' }}>
        {type === 'success' ? '✅' : '❌'}
      </span>
      <span>{message}</span>
    </div>
  );
}

export default Toast;
