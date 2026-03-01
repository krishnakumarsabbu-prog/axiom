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

  const hoverStyles = hover
    ? 'hover:border-primary/30 hover:shadow-card-md cursor-pointer transition-all duration-200'
    : '';

  return (
    <div className={`bg-card border border-border rounded-[var(--radius)] shadow-card ${paddingStyles[padding]} ${hoverStyles} ${className}`}>
      {children}
    </div>
  );
};
