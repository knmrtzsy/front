import React from 'react';

export default function Card({ children, className = '' }) {
  return (
    <div className={`bg-[#1E4D56] rounded-lg p-6 border border-gray-200 ${className}`}>
      {children}
    </div>
  );
} 