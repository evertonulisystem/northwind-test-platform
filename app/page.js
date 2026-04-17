// app/page.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const router = useRouter();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpar erro do campo ao digitar
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🔍 FRONTEND SUBMIT - Iniciando submit');
    console.log('🔍 FRONTEND SUBMIT - FormData:', formData);
    
    setLoading(true);
    setErrors({});

    try {
      console.log('🐛 DEBUG LOGIN - Enviando requisição...');
      
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      console.log('🔍 FRONTEND SUBMIT - Response status:', res.status);
      console.log('🔍 FRONTEND SUBMIT - Response ok:', res.ok);

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
        const errorMessage = Array.isArray(data.mensagens) ? data.mensagens[0] : data.mensagens;
       // console.error('❌ Erro no login:', errorMessage || 'Erro desconhecido');
        
        // Setar erro no campo específico
        if (errorMessage?.includes('email')) {
          setErrors({ email: errorMessage });
        } else if (errorMessage?.includes('senha')) {
          setErrors({ password: errorMessage });
        } else {
          setErrors({ email: errorMessage });
        }
        
        toast.error(errorMessage || 'Erro ao fazer login');
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

        <form onSubmit={handleSubmit} className="space-y-6" noValidate autoComplete="off" spellCheck={false}>
          <div>
            <label className="block text-white mb-2">Email</label>
            <input
              name="email"
              type="text"
              value={formData.email}
              onChange={handleInputChange}
              formNoValidate={true}
              spellCheck={false}
              autoCorrect="off"
              autoCapitalize="off"
              data-testid="email-input"
              className={`w-full px-4 py-3 rounded-xl bg-white/20 backdrop-blur-md border text-white placeholder-pink-200 focus:outline-none focus:ring-2 transition ${
                errors.email 
                  ? 'border-red-400 focus:ring-red-400' 
                  : 'border-white/30 focus:ring-white'
              }`}
              placeholder="seu@email.com"
              autoComplete="off"
            />
            {errors.email && (
              <p className="mt-2 text-sm text-red-300 flex items-center gap-1">
                <span className="w-1 h-1 bg-red-300 rounded-full"></span>
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label className="block text-white mb-2">Senha</label>
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              data-testid="password-input"
              className={`w-full px-4 py-3 rounded-xl bg-white/20 backdrop-blur-md border text-white placeholder-pink-200 focus:outline-none focus:ring-2 transition ${
                errors.password 
                  ? 'border-red-400 focus:ring-red-400' 
                  : 'border-white/30 focus:ring-white'
              }`}
              placeholder="******"
              autoComplete="new-password"
            />
            {errors.password && (
              <p className="mt-2 text-sm text-red-300 flex items-center gap-1">
                <span className="w-1 h-1 bg-red-300 rounded-full"></span>
                {errors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            data-testid="login-button"
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
