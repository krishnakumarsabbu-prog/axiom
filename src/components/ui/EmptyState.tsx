import React from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon = '📦'
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="text-6xl mb-4 opacity-40">{icon}</div>
      <h3 className="text-xl font-display font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm text-center max-w-md mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
