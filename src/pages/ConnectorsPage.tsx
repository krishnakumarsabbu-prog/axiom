import React from 'react';
import { Card } from '../components/ui';
import { EmptyState } from '../components/ui/EmptyState';

export const ConnectorsPage: React.FC = () => {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground">Connectors</h1>
        <p className="text-muted-foreground mt-2">Connect to external services and APIs</p>
      </div>

      <Card>
        <EmptyState
          icon="🔌"
          title="No connectors configured"
          description="Add your first connector to integrate external services and enable data synchronization"
          actionLabel="Add Connector"
          onAction={() => console.log('Add connector')}
        />
      </Card>
    </div>
  );
};
