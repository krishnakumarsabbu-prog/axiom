import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores';
import { Button, Input, Card } from '../components/ui';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
      navigate('/app/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-base bg-gradient-radial px-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold text-brand-base mb-2 tracking-tight">Experiment Proxy Portal</h1>
          <p className="text-fg-muted">Enterprise Multi-Tenant Platform</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            type="email"
            label="Email Address"
            placeholder="admin@acme.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            type="password"
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-6"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-border-base">
          <p className="text-sm text-fg-muted text-center mb-3">Demo Credentials</p>
          <div className="space-y-2 text-xs">
            <div className="bg-bg-base p-3 rounded-lg border border-border-base">
              <span className="text-fg-muted">Admin:</span> <span className="text-fg-base font-medium">admin@acme.com</span> <span className="text-fg-muted">/ admin123</span>
            </div>
            <div className="bg-bg-base p-3 rounded-lg border border-border-base">
              <span className="text-fg-muted">User:</span> <span className="text-fg-base font-medium">user@techstart.com</span> <span className="text-fg-muted">/ user123</span>
            </div>
            <div className="bg-bg-base p-3 rounded-lg border border-border-base">
              <span className="text-fg-muted">Viewer:</span> <span className="text-fg-base font-medium">viewer@global.com</span> <span className="text-fg-muted">/ viewer123</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
