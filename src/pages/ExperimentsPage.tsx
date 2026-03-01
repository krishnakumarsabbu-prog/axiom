import React from 'react';
import { Card } from '../components/ui';
import { EmptyState } from '../components/ui/EmptyState';

export const ExperimentsPage: React.FC = () => {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground">Experiments</h1>
        <p className="text-muted-foreground mt-2">Manage your A/B tests and feature flags</p>
      </div>

      <Card>
        <EmptyState
          icon="🧪"
          title="No experiments yet"
          description="Create your first experiment to start testing features and variations with your users"
          actionLabel="Create Experiment"
          onAction={() => console.log('Create experiment')}
        />
      </Card>
    </div>
  );
};
