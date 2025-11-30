'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao fazer login');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      router.push('/products');

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 p-4">
      <div 
        className="w-full max-w-md p-8 rounded-2xl shadow-2xl backdrop-blur-lg bg-white/10 border border-white/20"
        data-testid="login-card"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2" id="login-title">
            QA Automation Shop
          </h1>
          <p className="text-white/80">Plataforma de Testes</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
              Email
            </label>
            <input
              id="email"
              data-testid="email-input"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
              Senha
            </label>
            <input
              id="password"
              data-testid="password-input"
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-white text-sm" role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            data-testid="login-button"
            disabled={loading}
            className="w-full py-3 px-6 rounded-lg bg-white text-purple-600 font-semibold hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-white/80 text-sm">
            Não tem conta?{' '}
            <a href="/register" className="text-white font-semibold hover:underline" data-testid="register-link">
              Cadastre-se
            </a>
          </p>
        </div>

        <div className="mt-6 p-4 rounded-lg bg-white/10 border border-white/20">
          <p className="text-white/90 text-xs font-semibold mb-2">Credenciais de Teste:</p>
          <p className="text-white/80 text-xs">
            Email: admin@qatest.com<br/>
            Senha: Teste@123
          </p>
        </div>
      </div>
    </div>
  );
}