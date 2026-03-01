import React from 'react';
import { Card } from '../components/ui';
import { EmptyState } from '../components/ui/EmptyState';

export const MappingsPage: React.FC = () => {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-brand-base">Mappings</h1>
        <p className="text-fg-muted mt-2">Define data transformations and mappings</p>
      </div>

      <Card>
        <EmptyState
          icon="🗺️"
          title="No mappings defined"
          description="Create your first mapping to transform and synchronize data between different systems"
          actionLabel="Create Mapping"
          onAction={() => console.log('Create mapping')}
        />
      </Card>
    </div>
  );
};
