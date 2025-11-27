// components/AddProductModal.js
'use client';

import { useState, useEffect } from 'react';
import CustomSelect from '@/components/CustomSelect';

export default function AddProductModal({ onClose, onAdd }) {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock_quantity: '',
    sku: '',
    category_id: '',
    supplier_id: '',
  });

  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, supRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/suppliers'),
        ]);

        const catData = await catRes.json();
        const supData = await supRes.json();

        setCategories(catData.categories || []);
        setSuppliers(supData.suppliers || []);
      } catch (error) {
        console.error('Erro:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      onAdd?.();
      onClose();
    } else {
      alert('Erro ao adicionar');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      {/* MODAL CENTRALIZADO E CONTIDO */}
      <div className="w-full max-w-sm mx-auto max-h-[90vh] overflow-hidden bg-slate-800 rounded-xl border border-slate-700 shadow-2xl flex flex-col">
        {/* HEADER */}
        <div className="p-5 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">Adicionar Produto</h2>
        </div>

        {/* FORM COM SCROLL INTERNO */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-1">Nome</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white text-base placeholder-slate-400 focus:outline-none focus:border-orange-500 transition"
              placeholder="Nome do produto"
              required
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-1">Categoria</label>
            <CustomSelect
              name="category_id"
              options={categories}
              value={formData.category_id}
              onChange={handleChange}
              placeholder="Selecione"
              displayField="name"
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-1">Fornecedor</label>
            <CustomSelect
              name="supplier_id"
              options={suppliers}
              value={formData.supplier_id}
              onChange={handleChange}
              placeholder="Selecione"
              displayField="company_name"
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-1">Preço (R$)</label>
            <input
              name="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white text-base placeholder-slate-400 focus:outline-none focus:border-orange-500 transition"
              placeholder="0,00"
              required
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-1">Estoque</label>
            <input
              name="stock_quantity"
              type="number"
              value={formData.stock_quantity}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white text-base placeholder-slate-400 focus:outline-none focus:border-orange-500 transition"
              placeholder="0"
              required
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-1">SKU (opcional)</label>
            <input
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white text-base placeholder-slate-400 focus:outline-none focus:border-orange-500 transition"
              placeholder="ABC123"
            />
          </div>
        </form>

        {/* BOTÕES FIXOS */}
        <div className="p-4 border-t border-slate-700 flex gap-3 bg-slate-800">
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 transition font-medium text-base"
          >
            {loading ? '...' : 'Adicionar'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-slate-700 text-white py-2.5 rounded-lg hover:bg-slate-600 transition font-medium text-base"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}