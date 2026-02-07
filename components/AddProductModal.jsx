// components/AddProductModal.jsx → VERSÃO FINAL COM VALIDAÇÕES FODA (TEU ESTILO 100%)
'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import CustomSelect from '@/components/CustomSelect';
import { Package, DollarSign, Hash, Tag, Building2, Barcode, AlertCircle } from 'lucide-react';

export default function AddProductModal({ onClose, onAdd }) {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock_quantity: '',
    sku: '',
    category_id: '',
    supplier_id: '',
  });

  const [errors, setErrors] = useState({
    name: '',
    price: '',
    stock_quantity: '',
    sku: '',
  });

  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const headers = {
          'Content-Type': 'application/json'
        };

        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const [catRes, supRes] = await Promise.all([
          fetch('/api/categories', { headers, cache: 'no-store' }),
          fetch('/api/suppliers', { headers, cache: 'no-store' }),
        ]);

        const catData = await catRes.json();
        const supData = await supRes.json();

        setCategories(catData.data || []);
        setSuppliers(supData.data || []);
      } catch (error) {
        toast.error('Erro ao carregar categorias/fornecedores');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

    // NOME
    const name = formData.name.trim();
    if (!name) {
      newErrors.name = 'Nome é obrigatório';
    } else if (name.length < 6) {
      newErrors.name = 'Mínimo 6 caracteres';
    } else if (name.length > 40) {
      newErrors.name = 'Máximo 40 caracteres';
    } else if (/\d/.test(name)) {
      newErrors.name = 'Não pode conter números';
    } else if (/[^a-zA-Z\s]/.test(name)) {
      newErrors.name = 'Caracteres especiais não permitidos';
    } else if (/\s{2,}/.test(name)) {
      newErrors.name = 'Não pode ter espaços duplicados';
    }

    // PREÇO
    const price = formData.price;
    if (!price) {
      newErrors.price = 'Preço é obrigatório';
    } else if (isNaN(price) || parseFloat(price) <= 0) {
      newErrors.price = 'Deve ser um valor positivo';
    }

    // ESTOQUE
    const stock = formData.stock_quantity;
    if (!stock) {
      newErrors.stock_quantity = 'Estoque é obrigatório';
    } else if (isNaN(stock) || stock < 1 || stock > 999) {
      newErrors.stock_quantity = 'Apenas números de 1 a 999';
    }

    // SKU
    const sku = formData.sku.trim().toUpperCase();
    if (!sku) {
      newErrors.sku = 'SKU é obrigatório';
    } else if (sku.length < 5 || sku.length > 20) {
      newErrors.sku = 'Deve ter entre 5 e 20 caracteres';
    } else if (!/^[A-Z0-9-]+$/.test(sku)) {
      newErrors.sku = 'Apenas letras maiúsculas, números e hífen';
    } else if (!/^[A-Z]/.test(sku)) {
      newErrors.sku = 'Deve começar com letra maiúscula';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  // retorna true se não tiver erro
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Corrija os erros antes de salvar');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.stock_quantity),
        sku: formData.sku.trim().toUpperCase(),
      };

      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Você precisa estar logado para adicionar produtos');
        setLoading(false);
        return;
      }
      
      console.log('Token enviado:', token.substring(0, 20) + '...');
      
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.message || 'Erro ao adicionar');
        setLoading(false);
        return;
      }

      toast.success('Produto adicionado com sucesso!');
      onAdd?.();
      onClose();
    } catch (error) {
      toast.error('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md mx-auto bg-gradient-to-br from-purple-600/20 via-pink-500/20 to-orange-400/20 rounded-xl border border-white/30 shadow-2xl backdrop-blur-md flex flex-col" data-testid="add-product-modal">
        
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-green-400" />
            Adicionar Produto
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* NOME */}
          <div>
            <label className="flex items-center gap-2 text-slate-300 text-sm font-medium mb-1">
              <Tag className="w-4 h-4" />
              Nome <span className="text-red-500">*</span>
            </label>
            <input
              data-testid="add-product-name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg bg-white/80 backdrop-blur text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-purple-500 focus:border-purple-500 transition"
              placeholder="Informe o nome do produto"
            />
            {errors.name && (
              <p data-testid="error-name" className="text-red-400 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.name}
              </p>
            )}
          </div>

          {/* PREÇO */}
        {/* PREÇO — VERSÃO CORRIGIDA E INDESTRUTÍVEL */}
<div>
  <label className="flex items-center gap-2 text-slate-300 text-sm font-medium mb-1">
    <DollarSign className="w-4 h-4" />
    Preço (R$) <span className="text-red-500">*</span>
  </label>
  <input
    data-testid="edit-product-price"
    name="price"
    type="number"
    step="0.01"
    min="0.01"
    max="999999.99"
    value={formData.price}
    onChange={(e) => {
      const value = e.target.value;
      // Bloqueia valores absurdos já no front
      if (value === '' || (parseFloat(value) >= 0 && parseFloat(value) <= 999999.99)) {
        handleChange(e);
      }
    }}
    className="w-full px-4 py-2.5 rounded-lg bg-white/80 backdrop-blur text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-purple-500 focus:border-purple-500 transition"
    placeholder="Informe o preço unitário do produto"
  />
  {errors.price && (
    <p data-testid="error-price" className="text-red-400 text-xs mt-1 flex items-center gap-1">
      <AlertCircle className="w-3 h-3" /> {errors.price}
    </p>
  )}
</div>

          {/* ESTOQUE */}
          <div>
            <label className="flex items-center gap-2 text-slate-300 text-sm font-medium mb-1">
              <Package className="w-4 h-4" />
              Estoque <span className="text-red-500">*</span>
            </label>
            <input
              data-testid="add-product-stock"
              name="stock_quantity"
              type="text"
              value={formData.stock_quantity}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg bg-white/80 backdrop-blur text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-purple-500 focus:border-purple-500 transition"
              placeholder="Apenas números entre 1 e 999"
            />
            {errors.stock_quantity && (
              <p data-testid="error-stock" className="text-red-400 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.stock_quantity}
              </p>
            )}
          </div>

          {/* SKU */}
          <div>
            <label className="flex items-center gap-2 text-slate-300 text-sm font-medium mb-1">
              <Barcode className="w-4 h-4" />
              SKU <span className="text-red-500">*</span>
            </label>
            <input
              data-testid="add-product-sku"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg bg-white/80 backdrop-blur text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-purple-500 focus:border-purple-500 transition uppercase"
              placeholder="Ex: MGP-2024"
            />
            {errors.sku && (
              <p data-testid="error-sku" className="text-red-400 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.sku}
              </p>
            )}
          </div>

          {/* CATEGORIA */}
          <div>
            <label className="flex items-center gap-2 text-slate-300 text-sm font-medium mb-1">
              <Hash className="w-4 h-4" />
              Categoria <span className="text-red-500">*</span>
            </label>
            <CustomSelect
              data-testid="add-product-category"
              name="category_id"
              options={categories}
              value={formData.category_id}
              onChange={handleChange}
              placeholder="Selecione a Categoria"
              displayField="name"
            />
          </div>

          {/* FORNECEDOR */}
          <div>
            <label className="flex items-center gap-2 text-slate-300 text-sm font-medium mb-1">
              <Building2 className="w-4 h-4" />
              Fornecedor <span className="text-red-500">*</span>
            </label>
            <CustomSelect
              data-testid="add-product-supplier"
              name="supplier_id"
              options={suppliers}
              value={formData.supplier_id}
              onChange={handleChange}
              placeholder="Selecione o Fornecedor"
              displayField="company_name"
            />
          </div>
        </form>

        <div className="p-5 border-t border-white/20 flex gap-3 bg-gradient-to-r from-purple-600/10 via-pink-500/10 to-orange-400/10">
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            data-testid="add-product-submit"
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition font-semibold disabled:opacity-50 shadow-lg"
          >
            {loading ? 'Adicionando...' : 'Adicionar'}
          </button>
          <button
            type="button"
            onClick={onClose}
            data-testid="add-product-cancel"
            className="flex-1 bg-white/20 backdrop-blur text-white py-3 rounded-lg hover:bg-white/30 transition font-semibold border border-white/30"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}