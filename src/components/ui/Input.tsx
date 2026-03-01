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
        <label className="block text-sm font-medium text-foreground mb-2">
          {label}
        </label>
      )}
      <input
        className={`w-full h-10 px-3 bg-card border rounded-[var(--radius)] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:ring-offset-1 focus:ring-offset-background transition-colors duration-150 ${
          error ? 'border-destructive' : 'border-input'
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-sm text-destructive">{error}</p>
      )}
    </div>
  );
};
