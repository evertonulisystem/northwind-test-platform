// components/EditProductModal.js
'use client';

import { useState, useEffect } from 'react';
import CustomSelect from '@/components/CustomSelect';

export default function EditProductModal({ product, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    name: product.name || '',
    price: product.price || 0,
    stock_quantity: product.stock_quantity || 0,
    sku: product.sku || '',
    category_id: product.category_id || '',
    supplier_id: product.supplier_id || '',
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
    const res = await fetch(`/api/products/${product.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        category_id: formData.category_id || null,
        supplier_id: formData.supplier_id || null,
      }),
    });

    if (res.ok) {
      onUpdate?.();
      onClose();
    } else {
      alert('Erro ao salvar');
    }
  };
return (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="w-full max-w-sm mx-auto max-h-[90vh] overflow-hidden bg-slate-800 rounded-xl border border-slate-700 shadow-2xl flex flex-col">
      <div className="p-5 border-b border-slate-700">
        <h2 className="text-xl font-bold text-white">Editar Produto</h2>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* TODOS OS CAMPOS IGUAIS AO ADD */}
      </form>

      <div className="p-4 border-t border-slate-700 flex gap-3 bg-slate-800">
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={loading}
          className="flex-1 bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 transition font-medium text-base"
        >
          {loading ? '...' : 'Salvar'}
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