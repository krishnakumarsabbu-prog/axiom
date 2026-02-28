import React from 'react';
import { Card } from '../components/ui';

export const BuilderPage: React.FC = () => {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Builder</h1>
        <p className="text-neutral-600 mt-2">Visual workflow and configuration builder</p>
      </div>

      <Card>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔨</div>
          <h3 className="text-xl font-semibold text-neutral-900 mb-2">Builder coming soon</h3>
          <p className="text-neutral-600 mb-6">Visual builder for creating complex workflows</p>
        </div>
      </Card>
    </div>
  );
};
