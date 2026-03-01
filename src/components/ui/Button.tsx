import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:shadow-glow disabled:opacity-40 disabled:cursor-not-allowed';

  const variantStyles = {
    primary: 'bg-brand-base text-bg-base hover:bg-fg-base shadow-subtle hover:shadow-soft',
    secondary: 'bg-bg-panel2 text-fg-base border border-border-base hover:border-border-subtle hover:bg-bg-panel shadow-subtle',
    ghost: 'text-fg-base hover:bg-bg-panel2',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-subtle'
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm h-8',
    md: 'px-4 py-2 text-sm h-10',
    lg: 'px-6 py-3 text-base h-12'
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
