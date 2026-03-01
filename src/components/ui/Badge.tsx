import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'primary';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = ''
}) => {
  const variantStyles = {
    default:  'bg-muted text-muted-foreground border-border',
    primary:  'bg-primary/10 text-primary border-primary/20',
    success:  'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400',
    warning:  'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400',
    danger:   'bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400',
    info:     'bg-sky-500/10 text-sky-600 border-sky-500/20 dark:text-sky-400',
  };

  const sizeStyles = {
    sm: 'px-1.5 py-0.5 text-[10px]',
    md: 'px-2 py-0.5 text-xs',
  };

  return (
    <span className={`inline-flex items-center rounded-md font-medium border ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}>
      {children}
    </span>
  );
};
