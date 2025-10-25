import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/Button';
import Input from '../components/Input';
import PasswordInput from '../components/PasswordInput';
import { LoadingSpinner, ErrorMessage } from '../components/LoadingAndError';
import { User, Lock, Cloud } from 'lucide-react';
import type { LoginRequest } from '../types/api';

export const LoginPage: React.FC = () => {
  const { state, login, clearError } = useAuth();
  const [credentials, setCredentials] = useState<LoginRequest>({
    username: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      await login(credentials);
    } catch {
      // Error is handled by the context
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="text-center">
          <LoadingSpinner message="Iniciando sesión..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <Cloud className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-100 mb-2">
            NAS Cloud
          </h2>
          <p className="text-gray-400">
            Ingresa tus credenciales para acceder al sistema
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-gray-800 rounded-2xl shadow-xl p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                Usuario
              </label>
              <Input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                placeholder="Ingresa tu usuario"
                startIcon={<User className="h-5 w-5 text-gray-400" />}
                value={credentials.username}
                onChange={handleInputChange}
                disabled={state.loading}
                fullWidth
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Contraseña
              </label>
              <PasswordInput
                id="password"
                name="password"
                autoComplete="current-password"
                required
                placeholder="Ingresa tu contraseña"
                startIcon={<Lock className="h-5 w-5 text-gray-400" />}
                value={credentials.password}
                onChange={handleInputChange}
                disabled={state.loading}
                fullWidth
              />
            </div>

            {/* Error Message */}
            {state.error && (
              <ErrorMessage message={state.error} />
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={state.loading || !credentials.username || !credentials.password}
              variant="primary"
              size="lg"
              className="w-full justify-center"
            >
              {state.loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>
 
          {/* Demo Credentials */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-300 mb-3">
                Credenciales de demostración
              </h3>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="font-medium text-gray-100">Administrador</div>
                  <div className="font-mono text-xs">admin / admin123</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="font-medium text-gray-100">Usuario</div>
                  <div className="font-mono text-xs">demo / demo123</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};