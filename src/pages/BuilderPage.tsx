import React from 'react';
import { Card } from '../components/ui';
import { EmptyState } from '../components/ui/EmptyState';

export const BuilderPage: React.FC = () => {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground">Builder</h1>
        <p className="text-muted-foreground mt-2">Visual workflow and configuration builder</p>
      </div>

      <Card>
        <EmptyState
          icon="🔨"
          title="Builder coming soon"
          description="A powerful visual builder for creating and managing complex workflows and configurations"
        />
      </Card>
    </div>
  );
};
