// components/EditProductModal.js
'use client';

import { useState } from 'react';

export default function EditProductModal({ product, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    name: product.name || '',
    price: product.price || 0,
    stock_quantity: product.stock_quantity || 0,
    sku: product.sku || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch(`/api/products/${product.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      onUpdate?.(); // atualiza a lista
      onClose();
    } else {
      alert('Erro ao salvar');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full border border-white/30">
        <h2 className="text-2xl font-bold text-white mb-6">Editar Produto</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white mb-1">Nome</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-pink-200"
              required
            />
          </div>
          <div>
            <label className="block text-white mb-1">Preço</label>
            <input
              name="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white"
              required
            />
          </div>
          <div>
            <label className="block text-white mb-1">Estoque</label>
            <input
              name="stock_quantity"
              type="number"
              value={formData.stock_quantity}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white"
              required
            />
          </div>
          <div>
            <label className="block text-white mb-1">SKU</label>
            <input
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition"
            >
              Salvar
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}