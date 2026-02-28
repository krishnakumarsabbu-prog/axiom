import React from 'react';
import { Card } from '../components/ui';

export const ConnectorsPage: React.FC = () => {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Connectors</h1>
        <p className="text-neutral-600 mt-2">Connect to external services and APIs</p>
      </div>

      <Card>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔌</div>
          <h3 className="text-xl font-semibold text-neutral-900 mb-2">No connectors configured</h3>
          <p className="text-neutral-600 mb-6">Add your first connector to integrate external services</p>
        </div>
      </Card>
    </div>
  );
};
