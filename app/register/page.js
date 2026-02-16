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
          router.push('/login');
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
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white drop-shadow-lg">
            Criar Conta
          </h2>
          <p className="mt-2 text-center text-sm text-white/90">
            Ou{' '}
            <a href="/login" className="font-medium text-white hover:text-yellow-200 transition-colors duration-200">
              faça login na sua conta existente
            </a>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Nome Completo */}
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-white">
                Nome Completo <span className="text-yellow-300">*</span>
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                required
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm bg-white/90 backdrop-blur text-gray-900 placeholder-gray-500 ${
                  errors.full_name ? 'border-red-400 bg-red-50/50' : 'border-white/30'
                }`}
                placeholder="João Silva"
                value={formData.full_name}
                onChange={handleChange}
                data-testid="full-name-input"
              />
              {errors.full_name && (
                <p className="mt-1 text-sm text-red-200" data-testid="full-name-error">
                  {errors.full_name}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white">
                E-mail <span className="text-yellow-300">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm bg-white/90 backdrop-blur text-gray-900 placeholder-gray-500 ${
                  errors.email ? 'border-red-400 bg-red-50/50' : 'border-white/30'
                }`}
                placeholder="joao@exemplo.com"
                value={formData.email}
                onChange={handleChange}
                data-testid="email-input"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-200" data-testid="email-error">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Senha */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white">
                Senha <span className="text-yellow-300">*</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm bg-white/90 backdrop-blur text-gray-900 placeholder-gray-500 ${
                  errors.password ? 'border-red-400 bg-red-50/50' : 'border-white/30'
                }`}
                placeholder="SenhaForte@123"
                value={formData.password}
                onChange={handleChange}
                data-testid="password-input"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-200" data-testid="password-error">
                  {errors.password}
                </p>
              )}
              <div className="mt-1 text-xs text-white/80">
                <p>Requisitos da senha:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li className={formData.password.length >= 8 ? 'text-green-300' : 'text-white/60'}>
                    Mínimo 8 caracteres
                  </li>
                  <li className={/(?=.*[a-z])/.test(formData.password) ? 'text-green-300' : 'text-white/60'}>
                    Uma letra minúscula
                  </li>
                  <li className={/(?=.*[A-Z])/.test(formData.password) ? 'text-green-300' : 'text-white/60'}>
                    Uma letra maiúscula
                  </li>
                  <li className={/(?=.*\d)/.test(formData.password) ? 'text-green-300' : 'text-white/60'}>
                    Um número
                  </li>
                  <li className={/(?=.*[@$!%*?&])/.test(formData.password) ? 'text-green-300' : 'text-white/60'}>
                    Um caractere especial (@$!%*?&)
                  </li>
                </ul>
              </div>
            </div>

            {/* Confirmação de Senha */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-white">
                Confirme a Senha <span className="text-yellow-300">*</span>
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm bg-white/90 backdrop-blur text-gray-900 placeholder-gray-500 ${
                  errors.confirmPassword ? 'border-red-400 bg-red-50/50' : 'border-white/30'
                }`}
                placeholder="SenhaForte@123"
                value={formData.confirmPassword}
                onChange={handleChange}
                data-testid="confirm-password-input"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-200" data-testid="confirm-password-error">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          {/* Botão de Submit */}
          <div>
            <button
              type="submit"
              disabled={!isFormValid() || loading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white transition-colors duration-200 ${
                isFormValid() && !loading
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 shadow-lg'
                  : 'bg-gray-500 cursor-not-allowed opacity-50'
              }`}
              data-testid="register-button"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Cadastrando...
                </span>
              ) : (
                'Cadastrar'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
