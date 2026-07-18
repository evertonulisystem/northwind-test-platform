'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { Building2, Plus, Edit, Trash2, Search, X, Mail, Phone, User, MapPin, Building, Unlink, Eye } from 'lucide-react';
import UnlinkSupplierModal from '@/components/UnlinkSupplierModal.jsx';

export default function SuppliersPage() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showUnlinkModal, setShowUnlinkModal] = useState(false);
  const [unlinkingSupplier, setUnlinkingSupplier] = useState(null);

  const [formData, setFormData] = useState({
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
    cnpj: '',
    uf: ''
  });

  const [errors, setErrors] = useState({
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
    cnpj: '',
    uf: ''
  });

  // Reset seguro do formulário
  const resetForm = () => {
    setFormData({
      company_name: '',
      contact_name: '',
      email: '',
      phone: '',
      cnpj: '',
      uf: ''
    });
    setErrors({
      company_name: '',
      contact_name: '',
      email: '',
      phone: '',
      cnpj: '',
      uf: ''
    });
  };

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const res = await fetch('/api/v1/suppliers', { headers });
      const result = await res.json();
      
      console.log('🔍 DEBUG - suppliers API result:', result);
      
      if (!res.ok) {
        toast.error(result.mensagens?.[0] || 'Erro ao carregar fornecedores');
        return;
      }
      
      setSuppliers(result.data || []);
    } catch (error) {
      toast.error('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpa erro ao digitar
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Company Name
    if (!formData.company_name?.trim()) {
      newErrors.company_name = 'Nome da empresa é obrigatório';
    } else if (formData.company_name.length < 3 || formData.company_name.length > 100) {
      newErrors.company_name = 'Deve ter entre 3 e 100 caracteres';
    }

    // Contact Name
    if (!formData.contact_name?.trim()) {
      newErrors.contact_name = 'Nome do contato é obrigatório';
    } else if (formData.contact_name.length < 5 || formData.contact_name.length > 80) {
      newErrors.contact_name = 'Deve ter entre 5 e 80 caracteres';
    }

    // Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email?.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    // Phone
    const phoneRegex = /^\([0-9]{2}\) [0-9]{5}-[0-9]{4}$/;
    if (!formData.phone?.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Formato: (11) 98765-4321';
    }

    // CNPJ
    const cnpjRegex = /^[0-9]{14}$/;
    if (!formData.cnpj?.trim()) {
      newErrors.cnpj = 'CNPJ é obrigatório';
    } else if (!cnpjRegex.test(formData.cnpj.replace(/\D/g, ''))) {
      newErrors.cnpj = 'CNPJ deve ter 14 dígitos';
    }

    // UF
    const ufRegex = /^[A-Z]{2}$/;
    if (!formData.uf?.trim()) {
      newErrors.uf = 'UF é obrigatório';
    } else if (!ufRegex.test(formData.uf.toUpperCase())) {
      newErrors.uf = 'UF deve ter 2 letras maiúsculas (ex: SP)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🔍 DEBUG - handleSubmit chamado');

    if (!validateForm()) {
      toast.error('Corrija os erros antes de salvar');
      return;
    }

    setLoading(true);

    const payload = {
      ...formData,
      cnpj: formData.cnpj.replace(/\D/g, ''), // Remove formatação
      uf: formData.uf.toUpperCase()
    };

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Você precisa estar logado');
        setLoading(false);
        return;
      }
      
      const res = await fetch('/api/v1/suppliers', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.mensagens?.[0] || 'Erro ao cadastrar');
        setLoading(false);
        return;
      }

      toast.success('Fornecedor cadastrado com sucesso!');
      fetchSuppliers();
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      toast.error('Erro de rede');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    // Garantir que formData não tenha valores null
    const safeFormData = {
      company_name: formData.company_name || '',
      contact_name: formData.contact_name || '',
      email: formData.email || '',
      phone: formData.phone || '',
      cnpj: formData.cnpj || '',
      uf: formData.uf || ''
    };

    if (!validateForm()) {
      toast.error('Corrija os erros antes de salvar');
      return;
    }

    setLoading(true);

    const payload = {
      ...safeFormData,
      cnpj: safeFormData.cnpj.replace(/\D/g, ''), // Remove formatação
      uf: safeFormData.uf.toUpperCase()
    };

    console.log('🔍 DEBUG - Enviando para API:', payload);
    console.log('🔍 DEBUG - ID do fornecedor:', editingSupplier.id);

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Você precisa estar logado');
        setLoading(false);
        return;
      }
      
      const res = await fetch(`/api/v1/suppliers/${editingSupplier.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      console.log('🔍 DEBUG - Status da resposta:', res.status);
      const result = await res.json();
      console.log('🔍 DEBUG - Resposta da API:', result);

      if (!res.ok) {
        toast.error(result.mensagens?.[0] || 'Erro ao atualizar');
        setLoading(false);
        return;
      }

      toast.success('Fornecedor atualizado com sucesso!');
      fetchSuppliers();
      setShowEditModal(false);
      setEditingSupplier(null);
      resetForm();
    } catch (error) {
      console.error('🔍 DEBUG - Erro na requisição:', error);
      toast.error('Erro de rede');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Você precisa estar logado');
        return;
      }
      
      const res = await fetch(`/api/v1/suppliers/${deleteId}`, { 
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await res.json();
      
      if (!res.ok) {
        // Mensagem específica para fornecedor em uso
        if (result.mensagens?.[0]?.includes('usado por produtos')) {
          // Encontrar o fornecedor para abrir modal de desvincular
          const supplier = suppliers.find(s => s.id === deleteId);
          if (supplier) {
            setShowConfirm(false);
            setDeleteId(null);
            setUnlinkingSupplier(supplier);
            setShowUnlinkModal(true);
            return;
          }
        } else {
          toast.error(result.mensagens?.[0] || 'Erro ao excluir fornecedor');
        }
        setShowConfirm(false);
        setDeleteId(null);
        return;
      }
      
      toast.success('Fornecedor excluído com sucesso!');
      fetchSuppliers();
      setShowConfirm(false);
      setDeleteId(null);
    } catch (error) {
      toast.error('Erro de conexão ao excluir fornecedor');
      setShowConfirm(false);
      setDeleteId(null);
    }
  };

  const handleUnlinkSuccess = () => {
    fetchSuppliers();
    setShowUnlinkModal(false);
    setUnlinkingSupplier(null);
    toast.success('Agora você pode excluir o fornecedor!');
  };

  const formatCNPJ = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .slice(0, 18);
  };

  const formatPhone = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .slice(0, 15);
  };

  const displayPhone = (phone) => {
    if (!phone) return '';
    const clean = phone.replace(/\D/g, '');
    return formatPhone(clean);
  };

  const displayCNPJ = (cnpj) => {
    if (!cnpj) return '';
    const clean = cnpj.replace(/\D/g, '');
    return clean
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .slice(0, 18);
  };

  const ITEMS_PER_PAGE = 8;
  const [currentPage, setCurrentPage] = useState(1);

  const filteredSuppliers = suppliers.filter(supplier => {
    console.log('🔍 DEBUG - supplier:', supplier);
    console.log('🔍 DEBUG - searchTerm:', searchTerm);
    const matches = supplier.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email?.toLowerCase().includes(searchTerm.toLowerCase());
    console.log('🔍 DEBUG - matches:', matches);
    return matches;
  });

  const totalPages = Math.ceil(filteredSuppliers.length / ITEMS_PER_PAGE);
  const paginatedSuppliers = filteredSuppliers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 p-6">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-5xl font-extrabold text-white mb-3">Gestão de Fornecedores</h1>
            <p className="text-xl text-blue-200 mb-6">Cadastro e administração de fornecedores</p>
            
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg transition transform hover:scale-105 flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Novo Fornecedor
              </button>
              
              <button
                onClick={() => window.open('/products', '_blank')}
                className="bg-slate-700 hover:bg-slate-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg transition flex items-center gap-2"
              >
                <Building2 className="w-5 h-5" />
                Voltar para Produtos
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Buscar fornecedores..."
                  className="w-full pl-11 pr-4 py-3 bg-slate-800/50 backdrop-blur border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Suppliers Grid */}
          {loading ? (
            <div className="text-center text-slate-400 py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p>Carregando fornecedores...</p>
            </div>
          ) : filteredSuppliers.length === 0 ? (
            <div className="text-center text-slate-400 py-12">
              <Building2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-xl mb-4">
                {searchTerm ? 'Nenhum fornecedor encontrado' : 'Nenhum fornecedor cadastrado'}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
                >
                  Cadastrar primeiro fornecedor
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedSuppliers.map((supplier) => {
                  console.log('🔍 DEBUG - supplier data:', supplier);
                  return (
                  <div
                    key={supplier.id}
                    className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700 p-6 hover:border-blue-500 transition-all hover:shadow-xl hover:shadow-blue-500/20 flex flex-col h-full"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-500/20 p-3 rounded-lg">
                          <Building2 className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold text-lg line-clamp-1" title={supplier.company_name}>
                            {supplier.company_name}
                          </h3>
                          <p className="text-slate-400 text-sm line-clamp-1" title={supplier.contact_name}>
                            {supplier.contact_name}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4 flex-grow">
                      <div className="flex items-center gap-2 text-slate-300">
                        <Mail className="w-4 h-4 shrink-0" />
                        <span className="text-sm truncate" title={supplier.email}>
                          {supplier.email}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <Phone className="w-4 h-4 shrink-0" />
                        <span className="text-sm">
                          {displayPhone(supplier.phone)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <MapPin className="w-4 h-4 shrink-0" />
                        <span className="text-sm">
                          {supplier.uf}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <Building className="w-4 h-4 shrink-0" />
                        <span className="text-sm">
                          {displayCNPJ(supplier.cnpj)}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-700 mt-auto">
                      <button
                        onClick={() => router.push(`/suppliers/${supplier.id}/products`)}
                        className="flex-1 min-w-[100px] bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-2 rounded-lg transition flex items-center justify-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        Ver Produtos
                      </button>
                      <button
                        onClick={() => {
                          setEditingSupplier(supplier);
                          setFormData({
                            company_name: supplier.company_name,
                            contact_name: supplier.contact_name,
                            email: supplier.email,
                            phone: supplier.phone,
                            cnpj: supplier.cnpj,
                            uf: supplier.uf
                          });
                          setShowEditModal(true);
                        }}
                        className="flex-1 min-w-[100px] bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition flex items-center justify-center gap-1"
                      >
                        <Edit className="w-4 h-4" />
                        Editar
                      </button>
                      <button
                        onClick={() => {
                          setUnlinkingSupplier(supplier);
                          setShowUnlinkModal(true);
                        }}
                        className="flex-1 min-w-[100px] bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-lg transition flex items-center justify-center gap-1"
                        title="Desvincular produtos deste fornecedor"
                      >
                        <Unlink className="w-4 h-4" />
                        Desvincular
                      </button>
                      <button
                        onClick={() => {
                          setDeleteId(supplier.id);
                          setShowConfirm(true);
                        }}
                        className="flex-1 min-w-[100px] bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition flex items-center justify-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        Excluir
                      </button>
                    </div>
                  </div>
                );})}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Anterior
                  </button>
                  <span className="text-slate-300">
                    Página <span className="font-bold text-white">{currentPage}</span> de <span className="font-bold text-white">{totalPages}</span>
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Próxima
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md bg-slate-800 rounded-xl border border-slate-700 shadow-2xl">
            <div className="p-6 border-b border-slate-700">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Plus className="w-6 h-6 text-blue-400" />
                Novo Fornecedor
              </h2>
            </div>

            <div className="p-6 space-y-4">
              {/* Company Name */}
              <div>
                <label className="flex items-center gap-2 text-slate-300 text-sm font-medium mb-1">
                  <Building className="w-4 h-4" />
                  Nome da Empresa <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
                  placeholder="Tech Solutions Ltda"
                />
                {errors.company_name && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.company_name}
                  </p>
                )}
              </div>

              {/* Contact Name */}
              <div>
                <label className="flex items-center gap-2 text-slate-300 text-sm font-medium mb-1">
                  <User className="w-4 h-4" />
                  Nome do Contato <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="contact_name"
                  value={formData.contact_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
                  placeholder="João Silva"
                />
                {errors.contact_name && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.contact_name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="flex items-center gap-2 text-slate-300 text-sm font-medium mb-1">
                  <Mail className="w-4 h-4" />
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
                  placeholder="joao@techsolutions.com"
                />
                {errors.email && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="flex items-center gap-2 text-slate-300 text-sm font-medium mb-1">
                  <Phone className="w-4 h-4" />
                  Telefone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={(e) => {
                    const formatted = formatPhone(e.target.value);
                    setFormData(prev => ({ ...prev, phone: formatted }));
                  }}
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
                  placeholder="(11) 98765-4321"
                />
                {errors.phone && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* CNPJ */}
              <div>
                <label className="flex items-center gap-2 text-slate-300 text-sm font-medium mb-1">
                  <Building className="w-4 h-4" />
                  CNPJ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="cnpj"
                  value={formData.cnpj || ''}
                  onChange={(e) => {
                    const formatted = formatCNPJ(e.target.value);
                    setFormData(prev => ({ ...prev, cnpj: formatted }));
                  }}
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
                  placeholder="12.345.678/0001-90"
                />
                {errors.cnpj && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.cnpj}
                  </p>
                )}
              </div>

              {/* UF */}
              <div>
                <label className="flex items-center gap-2 text-slate-300 text-sm font-medium mb-1">
                  <MapPin className="w-4 h-4" />
                  Estado (UF) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="uf"
                  value={formData.uf}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase().slice(0, 2);
                    setFormData(prev => ({ ...prev, uf: value }));
                  }}
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition uppercase"
                  placeholder="SP"
                  maxLength={2}
                />
                {errors.uf && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.uf}
                  </p>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-slate-700 flex gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  console.log('🔍 DEBUG - Botão salvar clicado');
                  handleSubmit(e);
                }}
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50"
              >
                {loading ? 'Salvando...' : 'Salvar'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="flex-1 bg-slate-700 text-white py-3 rounded-lg hover:bg-slate-600 transition font-semibold"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md bg-slate-800 rounded-xl border border-slate-700 shadow-2xl">
            <div className="p-6 border-b border-slate-700">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Edit className="w-6 h-6 text-blue-400" />
                Editar Fornecedor
              </h2>
            </div>

            <div className="p-6 space-y-4">
              {/* Company Name */}
              <div>
                <label className="flex items-center gap-2 text-slate-300 text-sm font-medium mb-1">
                  <Building className="w-4 h-4" />
                  Nome da Empresa <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
                  placeholder="Tech Solutions Ltda"
                />
                {errors.company_name && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.company_name}
                  </p>
                )}
              </div>

              {/* Contact Name */}
              <div>
                <label className="flex items-center gap-2 text-slate-300 text-sm font-medium mb-1">
                  <User className="w-4 h-4" />
                  Nome do Contato <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="contact_name"
                  value={formData.contact_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
                  placeholder="João Silva"
                />
                {errors.contact_name && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.contact_name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="flex items-center gap-2 text-slate-300 text-sm font-medium mb-1">
                  <Mail className="w-4 h-4" />
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
                  placeholder="joao@techsolutions.com"
                />
                {errors.email && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="flex items-center gap-2 text-slate-300 text-sm font-medium mb-1">
                  <Phone className="w-4 h-4" />
                  Telefone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={(e) => {
                    const formatted = formatPhone(e.target.value);
                    setFormData(prev => ({ ...prev, phone: formatted }));
                  }}
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
                  placeholder="(11) 98765-4321"
                />
                {errors.phone && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* CNPJ */}
              <div>
                <label className="flex items-center gap-2 text-slate-300 text-sm font-medium mb-1">
                  <Building className="w-4 h-4" />
                  CNPJ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="cnpj"
                  value={formData.cnpj || ''}
                  onChange={(e) => {
                    const formatted = formatCNPJ(e.target.value);
                    setFormData(prev => ({ ...prev, cnpj: formatted }));
                  }}
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
                  placeholder="12.345.678/0001-90"
                />
                {errors.cnpj && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.cnpj}
                  </p>
                )}
              </div>

              {/* UF */}
              <div>
                <label className="flex items-center gap-2 text-slate-300 text-sm font-medium mb-1">
                  <MapPin className="w-4 h-4" />
                  Estado (UF) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="uf"
                  value={formData.uf}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase().slice(0, 2);
                    setFormData(prev => ({ ...prev, uf: value }));
                  }}
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition uppercase"
                  placeholder="SP"
                  maxLength={2}
                />
                {errors.uf && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.uf}
                  </p>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-slate-700 flex gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  console.log('🔍 DEBUG - Botão atualizar clicado');
                  handleUpdate();
                }}
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50"
              >
                {loading ? 'Atualizando...' : 'Atualizar'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingSupplier(null);
                  resetForm();
                }}
                className="flex-1 bg-slate-700 text-white py-3 rounded-lg hover:bg-slate-600 transition font-semibold"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-sm bg-slate-800 rounded-xl border border-slate-700 shadow-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Confirmar Exclusão</h3>
            <p className="text-slate-300 mb-6">Tem certeza que deseja excluir este fornecedor?</p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition font-semibold"
              >
                Excluir
              </button>
              <button
                onClick={() => {
                  setShowConfirm(false);
                  setDeleteId(null);
                }}
                className="flex-1 bg-slate-700 text-white py-2 rounded-lg hover:bg-slate-600 transition font-semibold"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unlink Supplier Modal */}
      {showUnlinkModal && (
        <UnlinkSupplierModal
          supplier={unlinkingSupplier}
          onClose={() => {
            setShowUnlinkModal(false);
            setUnlinkingSupplier(null);
          }}
          onSuccess={handleUnlinkSuccess}
        />
      )}
    </>
  );
}
