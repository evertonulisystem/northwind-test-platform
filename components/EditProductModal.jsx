// components/EditProductModal.jsx
'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import CustomSelect from '@/components/CustomSelect';
import { Package, DollarSign, Hash, Tag, Building2, Barcode } from 'lucide-react';

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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [catRes, supRes] = await Promise.all([
          fetch('/api/categories', { cache: 'no-store' }),
          fetch('/api/suppliers', { cache: 'no-store' }),
        ]);

        const catData = await catRes.json();
        const supData = await supRes.json();

        setCategories(catData.categories || []);
        setSuppliers(supData.suppliers || []);
      } catch (error) {
        toast.error('Erro ao carregar dados');
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
  setLoading(true);

  try {
    const res = await fetch(`/api/products/${product.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        category_id: formData.category_id || null,
        supplier_id: formData.supplier_id || null,
      }),
    });

    let result;
    try {
      result = await res.json();
    } catch (jsonError) {
      const text = await res.text();
      console.error('JSON inválido:', text);
      toast.error('Erro na API: resposta inválida');
      setLoading(false);
      return;
    }

    if (!res.ok) {
      toast.error(result.message || 'Erro ao atualizar');
      setLoading(false);
      return;
    }

    toast.success(result.message || 'Produto atualizado!');
    onUpdate?.();
    onClose();

    
  } catch (error) {
    toast.error('Erro de rede');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        className="w-full max-w-md mx-auto bg-slate-800 rounded-xl border border-slate-700 shadow-2xl flex flex-col"
        data-testid="edit-product-modal"
      >
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-400" />
            Editar Produto
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          <div>
            <label className="flex items-center gap-2 text-slate-300 text-sm font-medium mb-2">
              <Tag className="w-4 h-4" />
              Nome
            </label>
            <input
              data-testid="edit-product-name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 transition"
              required
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-slate-300 text-sm font-medium mb-2">
              <Hash className="w-4 h-4" />
              Categoria
            </label>
            <CustomSelect
              data-testid="edit-product-category"
              name="category_id"
              options={categories}
              value={formData.category_id}
              onChange={handleChange}
              placeholder="Selecione"
              displayField="name"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-slate-300 text-sm font-medium mb-2">
              <Building2 className="w-4 h-4" />
              Fornecedor
            </label>
            <CustomSelect
              data-testid="edit-product-supplier"
              name="supplier_id"
              options={suppliers}
              value={formData.supplier_id}
              onChange={handleChange}
              placeholder="Selecione"
              displayField="company_name"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-slate-300 text-sm font-medium mb-2">
              <DollarSign className="w-4 h-4" />
              Preço (R$)
            </label>
            <input
              data-testid="edit-product-price"
              name="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 transition"
              required
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-slate-300 text-sm font-medium mb-2">
              <Package className="w-4 h-4" />
              Estoque
            </label>
            <input
              data-testid="edit-product-stock"
              name="stock_quantity"
              type="number"
              value={formData.stock_quantity}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 transition"
              required
            />
          </div>

          <div>
  <label className="flex items-center gap-2 text-slate-300 text-sm font-medium mb-2">
    <Barcode className="w-4 h-4" />
    SKU <span className="text-red-400">*</span>
  </label>
  <input
    data-testid="edit-product-sku"
    name="sku"
    value={formData.sku}
    onChange={handleChange}
    className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 transition"
    placeholder="MGP-2024"
    required
  />
</div>
        </form>

        <div className="p-5 border-t border-slate-700 flex gap-3 bg-slate-800">
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            data-testid="edit-product-submit"
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
          <button
            type="button"
            onClick={onClose}
            data-testid="edit-product-cancel"
            className="flex-1 bg-slate-700 text-white py-3 rounded-lg hover:bg-slate-600 transition font-semibold"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}