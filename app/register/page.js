// app/register/page.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const router = useRouter();

  // Validações em tempo real
  const validateField = (name, value) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case 'full_name':
        if (!value.trim()) {
          newErrors.full_name = 'Nome completo é obrigatório';
        } else if (value.trim().length < 3) {
          newErrors.full_name = 'Nome deve ter no mínimo 3 caracteres';
        } else if (value.trim().length > 100) {
          newErrors.full_name = 'Nome deve ter no máximo 100 caracteres';
        } else if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(value.trim())) {
          newErrors.full_name = 'Nome deve conter apenas letras e espaços';
        } else {
          delete newErrors.full_name;
        }
        break;
        
      case 'email':
        if (!value.trim()) {
          newErrors.email = 'E-mail é obrigatório';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          newErrors.email = 'E-mail inválido';
        } else if (value.trim().length > 255) {
          newErrors.email = 'E-mail deve ter no máximo 255 caracteres';
        } else {
          delete newErrors.email;
        }
        break;
        
      case 'password':
        if (!value) {
          newErrors.password = 'Senha é obrigatória';
        } else if (value.length < 8) {
          newErrors.password = 'Senha deve ter no mínimo 8 caracteres';
        } else if (value.length > 128) {
          newErrors.password = 'Senha deve ter no máximo 128 caracteres';
        } else if (!/(?=.*[a-z])/.test(value)) {
          newErrors.password = 'Senha deve ter pelo menos uma letra minúscula';
        } else if (!/(?=.*[A-Z])/.test(value)) {
          newErrors.password = 'Senha deve ter pelo menos uma letra maiúscula';
        } else if (!/(?=.*\d)/.test(value)) {
          newErrors.password = 'Senha deve ter pelo menos um número';
        } else if (!/(?=.*[@$!%*?&])/.test(value)) {
          newErrors.password = 'Senha deve ter pelo menos um caractere especial (@$!%*?&)';
        } else if (/(\w)\1{2,}/.test(value)) {
          newErrors.password = 'Senha não pode ter 3 ou mais caracteres repetidos';
        } else {
          delete newErrors.password;
        }
        
        // Valida confirmação de senha se já foi preenchida
        if (formData.confirmPassword && value !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Senhas não conferem';
        } else if (formData.confirmPassword && value === formData.confirmPassword) {
          delete newErrors.confirmPassword;
        }
        break;
        
      case 'confirmPassword':
        if (!value) {
          newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
        } else if (value !== formData.password) {
          newErrors.confirmPassword = 'Senhas não conferem';
        } else {
          delete newErrors.confirmPassword;
        }
        break;
    }
    
    setErrors(newErrors);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Validação em tempo real
    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Validação final de todos os campos
    const currentErrors = {};
    Object.keys(formData).forEach(field => {
      // Simular validação final
      const value = formData[field];
      switch (field) {
        case 'full_name':
          if (!value.trim()) {
            currentErrors.full_name = 'Nome completo é obrigatório';
          } else if (value.trim().length < 3) {
            currentErrors.full_name = 'Nome deve ter no mínimo 3 caracteres';
          } else if (value.trim().length > 100) {
            currentErrors.full_name = 'Nome deve ter no máximo 100 caracteres';
          } else if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(value.trim())) {
            currentErrors.full_name = 'Nome deve conter apenas letras e espaços';
          } else if (/\s{2,}/.test(value.trim())) {
            currentErrors.full_name = 'Nome não pode ter espaços duplicados';
          }
          break;
        case 'email':
          if (!value.trim()) {
            currentErrors.email = 'E-mail é obrigatório';
          } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
            currentErrors.email = 'E-mail inválido';
          } else if (value.trim().length > 255) {
            currentErrors.email = 'E-mail deve ter no máximo 255 caracteres';
          }
          break;
        case 'password':
          if (!value) {
            currentErrors.password = 'Senha é obrigatória';
          } else if (value.length < 8) {
            currentErrors.password = 'Senha deve ter no mínimo 8 caracteres';
          } else if (value.length > 128) {
            currentErrors.password = 'Senha deve ter no máximo 128 caracteres';
          } else if (!/(?=.*[a-z])/.test(value)) {
            currentErrors.password = 'Senha deve ter pelo menos uma letra minúscula';
          } else if (!/(?=.*[A-Z])/.test(value)) {
            currentErrors.password = 'Senha deve ter pelo menos uma letra maiúscula';
          } else if (!/(?=.*\d)/.test(value)) {
            currentErrors.password = 'Senha deve ter pelo menos um número';
          } else if (!/(?=.*[@$!%*?&])/.test(value)) {
            currentErrors.password = 'Senha deve ter pelo menos um caractere especial (@$!%*?&)';
          } else if (/(\w)\1{2,}/.test(value)) {
            currentErrors.password = 'Senha não pode ter 3 ou mais caracteres repetidos';
          }
          break;
        case 'confirmPassword':
          if (!value) {
            currentErrors.confirmPassword = 'Confirmação de senha é obrigatória';
          } else if (value !== formData.password) {
            currentErrors.confirmPassword = 'Senhas não conferem';
          }
          break;
      }
    });

    // Atualizar erros e verificar se há problemas
    setErrors(currentErrors);

    // Verifica se há erros após atualização
    if (Object.keys(currentErrors).length > 0) {
      setLoading(false);
      toast.error('Corrija os erros antes de continuar');
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.full_name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          confirmPassword: formData.confirmPassword
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Cadastro realizado com sucesso! Redirecionando...');
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else {
        // Tratamento específico de erros do backend
        if (data.mensagens && Array.isArray(data.mensagens)) {
          data.mensagens.forEach(msg => toast.error(msg));
        } else if (data.message) {
          toast.error(data.message);
        } else {
          toast.error('Erro ao cadastrar. Tente novamente.');
        }
      }
    } catch (error) {
      console.error('Erro no registro:', error);
      toast.error('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    return (
      formData.full_name.trim() &&
      formData.email.trim() &&
      formData.password &&
      formData.confirmPassword &&
      Object.keys(errors).length === 0
    );
  };

return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center p-6">
    <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-10 max-w-md w-full border border-white/20">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">QA Automation Shop</h1>
        <p className="text-pink-100">Criar Nova Conta</p>
      </div>
      
      <form className="space-y-6" onSubmit={handleSubmit} noValidate autoComplete="off" spellCheck={false}>
        <div>
          <label className="block text-white mb-2">Nome Completo</label>
          <input
            name="full_name"
            type="text"
            value={formData.full_name}
            onChange={handleChange}
            formNoValidate={true}
            spellCheck={false}
            autoCorrect="off"
            data-testid="full-name-input"
            className={`w-full px-4 py-3 rounded-xl bg-white/20 backdrop-blur-md border text-white placeholder-pink-200 focus:outline-none focus:ring-2 transition ${
              errors.full_name 
                ? 'border-red-400 focus:ring-red-400' 
                : 'border-white/30 focus:ring-white'
            }`}
            placeholder="Seu nome completo"
            autoComplete="off"
          />
          {errors.full_name && (
            <p className="mt-2 text-sm text-red-300 flex items-center gap-1">
              <span className="w-1 h-1 bg-red-300 rounded-full"></span>
              {errors.full_name}
            </p>
          )}
        </div>

        <div>
          <label className="block text-white mb-2">Email</label>
          <input
            name="email"
            type="text"
            value={formData.email}
            onChange={handleChange}
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
            onChange={handleChange}
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

        <div>
          <label className="block text-white mb-2">Confirmar Senha</label>
          <input
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            data-testid="confirm-password-input"
            className={`w-full px-4 py-3 rounded-xl bg-white/20 backdrop-blur-md border text-white placeholder-pink-200 focus:outline-none focus:ring-2 transition ${
              errors.confirmPassword 
                ? 'border-red-400 focus:ring-red-400' 
                : 'border-white/30 focus:ring-white'
            }`}
            placeholder="******"
            autoComplete="new-password"
          />
          {errors.confirmPassword && (
            <p className="mt-2 text-sm text-red-300 flex items-center gap-1">
              <span className="w-1 h-1 bg-red-300 rounded-full"></span>
              {errors.confirmPassword}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !isFormValid()}
          className="w-full bg-white text-purple-600 font-bold py-3 rounded-xl hover:bg-pink-50 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Cadastrando...' : 'Criar Conta'}
        </button>
      </form>

      <p className="text-center text-pink-200 mt-6 text-sm">
        Já tem conta? <a href="/" className="text-white underline">Faça login</a>
      </p>
    </div>
  </div>
);
}
