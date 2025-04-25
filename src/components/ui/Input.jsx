import React from 'react';

export default function Input({
  label,
  id,
  error,
  className = '',
  ...props
}) {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-[#E9C9C9] mb-1">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`
          w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 transition-colors duration-200
          ${error 
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
            : 'focus:border-primary-500 focus:ring-1 focus:ring-primary-500'
          }
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
} 