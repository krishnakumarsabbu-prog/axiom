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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-neutral-100">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-600 mb-2">Experiment Proxy Portal</h1>
          <p className="text-neutral-600">Enterprise Multi-Tenant Platform</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <div className="p-3 bg-error-50 border border-error-200 rounded-lg">
              <p className="text-sm text-error-700">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-neutral-200">
          <p className="text-sm text-neutral-600 text-center">Demo Credentials:</p>
          <div className="mt-3 space-y-2 text-xs text-neutral-500">
            <div className="bg-neutral-50 p-2 rounded">
              <strong>Admin:</strong> admin@acme.com / admin123
            </div>
            <div className="bg-neutral-50 p-2 rounded">
              <strong>User:</strong> user@techstart.com / user123
            </div>
            <div className="bg-neutral-50 p-2 rounded">
              <strong>Viewer:</strong> viewer@global.com / viewer123
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
