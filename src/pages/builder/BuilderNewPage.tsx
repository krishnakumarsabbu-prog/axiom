import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboardStore, useTenantStore } from '../../stores';
import { Button, Card, Input, Spinner } from '../../components/ui';
import { CreateDashboardSchema } from '../../domain';

export const BuilderNewPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentTenant } = useTenantStore();
  const { create, isSaving } = useDashboardStore();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = CreateDashboardSchema.safeParse({ name, description: description || undefined });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        fieldErrors[issue.path[0] as string] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    if (!currentTenant) return;
    try {
      const d = await create(currentTenant.id, result.data);
      navigate(`/app/builder/${d.id}/edit`);
    } catch {
      setErrors({ name: 'Failed to create dashboard' });
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      <button
        onClick={() => navigate('/app/builder')}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
        </svg>
        Back to Dashboards
      </button>

      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-foreground">New Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Create a new custom dashboard for this tenant</p>
      </div>

      <Card padding="md">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Dashboard Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={name}
              onChange={e => { setName(e.target.value); setErrors({}); }}
              placeholder="e.g. Checkout Experiment Overview"
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
            <Input
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Optional description"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" type="button" onClick={() => navigate('/app/builder')}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={isSaving}>
              {isSaving ? <><Spinner size="sm" /><span className="ml-2">Creating...</span></> : 'Create & Edit'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
