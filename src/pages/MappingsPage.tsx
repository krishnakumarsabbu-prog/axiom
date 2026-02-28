import React from 'react';
import { Card } from '../components/ui';

export const MappingsPage: React.FC = () => {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Mappings</h1>
        <p className="text-neutral-600 mt-2">Define data transformations and mappings</p>
      </div>

      <Card>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🗺️</div>
          <h3 className="text-xl font-semibold text-neutral-900 mb-2">No mappings defined</h3>
          <p className="text-neutral-600 mb-6">Create your first mapping to transform data between systems</p>
        </div>
      </Card>
    </div>
  );
};
