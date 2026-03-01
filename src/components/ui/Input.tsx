import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-fg-base mb-2">
          {label}
        </label>
      )}
      <input
        className={`w-full px-3 py-2.5 bg-bg-panel2 border rounded-lg text-fg-base placeholder:text-fg-muted focus:outline-none focus:border-brand-base focus:shadow-glow transition-all duration-200 ${
          error ? 'border-red-500' : 'border-border-base'
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-sm text-red-400">{error}</p>
      )}
    </div>
  );
};
