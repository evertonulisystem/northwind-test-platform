// app/login/page.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');

    try {
      console.log('🐛 DEBUG LOGIN - Enviando requisição...');
      
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log('🐛 DEBUG LOGIN - Resposta:', data);

      if (res.ok && data.data?.token) {
        // Salvar token no localStorage
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        
        console.log('✅ Login bem-sucedido, redirecionando...');
        toast.success('Login realizado com sucesso!');
        
        // Redirecionar para products
        router.push('/products');
      } else {
        console.error('❌ Erro no login:', data.mensagens || 'Erro desconhecido');
        toast.error(data.mensagens?.[0] || 'Erro ao fazer login');
      }
    } catch (error) {
      console.error('❌ Erro na requisição:', error);
      toast.error('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center p-6">
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-10 max-w-md w-full border border-white/20">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">QA Automation Shop</h1>
          <p className="text-pink-100">Plataforma de Testes</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-white mb-2">Email</label>
            <input
              name="email"
              type="email"
              defaultValue="admin@qatest.com"
              required
              className="w-full px-4 py-3 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-white placeholder-pink-200 focus:outline-none focus:ring-2 focus:ring-white"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="block text-white mb-2">Senha</label>
            <input
              name="password"
              type="password"
              defaultValue="Teste@123"
              required
              className="w-full px-4 py-3 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-white placeholder-pink-200 focus:outline-none focus:ring-2 focus:ring-white"
              placeholder="••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-purple-600 font-bold py-3 rounded-xl hover:bg-pink-50 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-center text-pink-200 mt-6 text-sm">
          Não tem conta? <a href="/register" className="text-white underline">Cadastre-se</a>
        </p>

        <div className="mt-8 p-4 bg-white/10 rounded-xl text-sm text-pink-100">
          <p className="font-semibold">Credenciais de Teste:</p>
          <p>Email: admin@qatest.com</p>
          <p>Senha: Teste@123</p>
        </div>
      </div>
    </div>
  );
}