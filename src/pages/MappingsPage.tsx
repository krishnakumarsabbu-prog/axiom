import React from 'react';
import { Card } from '../components/ui';
import { EmptyState } from '../components/ui/EmptyState';

export const MappingsPage: React.FC = () => {
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-foreground">Mappings</h1>
        <p className="text-sm text-muted-foreground mt-1">Define data transformations and mappings</p>
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
