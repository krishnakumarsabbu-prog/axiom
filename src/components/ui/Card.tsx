import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  hover = false
}) => {
  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const hoverStyles = hover ? 'hover:border-muted-foreground/20 transition-colors duration-150 cursor-pointer' : '';

  return (
    <div className={`bg-card border border-border rounded-[var(--radius)] shadow-[0_1px_3px_rgba(0,0,0,0.3)] ${paddingStyles[padding]} ${hoverStyles} ${className}`}>
      {children}
    </div>
  );
};
