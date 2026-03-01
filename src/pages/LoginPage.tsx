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
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground mb-2 tracking-tight">Experiment Proxy Portal</h1>
          <p className="text-muted-foreground">Enterprise Multi-Tenant Platform</p>
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
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-[var(--radius)]">
              <p className="text-sm text-destructive">{error}</p>
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

        <div className="mt-6 pt-6 border-t border-border">
          <p className="text-sm text-muted-foreground text-center mb-3">Demo Credentials</p>
          <div className="space-y-2 text-xs">
            <div className="bg-secondary p-3 rounded-[var(--radius)] border border-border">
              <span className="text-muted-foreground">Admin:</span> <span className="text-foreground font-medium">admin@acme.com</span> <span className="text-muted-foreground">/ admin123</span>
            </div>
            <div className="bg-secondary p-3 rounded-[var(--radius)] border border-border">
              <span className="text-muted-foreground">User:</span> <span className="text-foreground font-medium">user@techstart.com</span> <span className="text-muted-foreground">/ user123</span>
            </div>
            <div className="bg-secondary p-3 rounded-[var(--radius)] border border-border">
              <span className="text-muted-foreground">Viewer:</span> <span className="text-foreground font-medium">viewer@global.com</span> <span className="text-muted-foreground">/ viewer123</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
