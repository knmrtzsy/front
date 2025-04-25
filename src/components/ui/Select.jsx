import React from 'react';

export default function Select({
  label,
  id,
  error,
  options = [],
  valueKey = 'id',
  labelKey = 'name',
  placeholder = 'Seçiniz',
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
      <select
        id={id}
        className={`
          w-full rounded-md border border-gray-300 shadow-sm py-2 pl-3 pr-10 transition-colors duration-200 appearance-none
          ${error 
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
            : 'focus:border-primary-500 focus:ring-1 focus:ring-primary-500'
          }
          bg-white bg-no-repeat bg-right
        `}
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundSize: "1.5em 1.5em" }}
        {...props}
      >
        {placeholder && (
          <option value="">{placeholder}</option>
        )}
        {options.map((option) => (
          <option key={option[valueKey]} value={option[valueKey]}>
            {option[labelKey]}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
} 