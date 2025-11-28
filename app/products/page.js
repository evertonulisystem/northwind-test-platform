// app/products/page.js (ou similar)
'use client';

import { useState, useEffect } from 'react';
import AddProductModal from '@/components/AddProductModal';
import EditProductModal from '@/components/EditProductModal';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const res = await fetch('/api/products');
    const data = await res.json();
    setProducts(data.products || []);
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza?')) return;
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
    fetchProducts();
  };

  const handleAdd = async () => {
  await fetchProducts(); // recarrega com dados completos
  setShowAddModal(false);
};

  return (
    <>
      {/* CONTAINER GRANDE E DOMINANTE */}
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-orange-700 p-6">
        <div className="max-w-7xl mx-auto">
          {/* HEADER */}
          <div className="mb-8 text-center">
            <h1 className="text-5xl font-extrabold text-white mb-2">QA Automation Shop</h1>
            <p className="text-xl text-pink-100">Lista de Produtos (Admin View)</p>
          </div>

          {/* BOTÃO ADICIONAR */}
          <div className="flex justify-end mb-6">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition font-semibold shadow-lg flex items-center gap-2"
            >
              Adicionar Produto
            </button>
          </div>

          {/* TABELA GRANDE E RESPONSIVA */}
          <div className="bg-slate-800/90 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-700/50 border-b border-slate-600">
                 <tr>
    <th className="px-4 py-3 text-slate-200 font-semibold text-sm min-w-[60px]">ID</th>
    <th className="px-4 py-3 text-slate-200 font-semibold text-sm min-w-[200px]">Nome</th>
    <th className="px-4 py-3 text-slate-200 font-semibold text-sm min-w-[100px]">Preço</th>
    <th className="px-4 py-3 text-slate-200 font-semibold text-sm min-w-[120px]">Categoria</th>
    <th className="px-4 py-3 text-slate-200 font-semibold text-sm min-w-[140px]">Fornecedor</th>
    <th className="px-4 py-3 text-slate-200 font-semibold text-sm min-w-[120px] text-center">Ações</th>
  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} className="border-b border-slate-700 hover:bg-slate-700/30 transition">
                     <td className="px-4 py-2 text-slate-300 font-mono text-sm">{p.id}</td>
  <td className="px-4 py-2 text-white font-medium text-sm">{p.name}</td>
  <td className="px-4 py-2 text-green-400 font-semibold text-sm">
                        R$ {parseFloat(p.price).toFixed(2)}
                      </td>
                     <td className="px-4 py-2 text-slate-300 text-sm">{p.category?.name || '-'}</td>
  <td className="px-4 py-2 text-slate-300 text-sm">{p.supplier?.company_name || '-'}</td>
  <td className="px-4 py-2 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => {
                              setEditingProduct(p);
                              setShowEditModal(true);
                            }}
                            className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700 transition"
        title="Editar"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                        className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700 transition"
        title="Excluir"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* MODAIS */}
      {showAddModal && (
        // no modal
<AddProductModal onClose={() => setShowAddModal(false)} onAdd={handleAdd} />
      )}
      {showEditModal && editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={() => {
            setShowEditModal(false);
            setEditingProduct(null);
          }}
          onUpdate={fetchProducts}
        />
      )}
    </>
  );
}