// app/products/page.js
'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import AddProductModal from '@/components/AddProductModal';
import EditProductModal from '@/components/EditProductModal';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);

 const fetchProducts = async () => {
  try {
    setLoading(true);
    const res = await fetch('/api/products', { cache: 'no-store' });
    const result = await res.json(); // ← agora é { data, message }

    if (!res.ok) {
      throw new Error(result.message || 'Erro ao carregar');
    }

    setProducts(result.data || []); // ← CORRETO
  } catch (error) {
    toast.error(error.message || 'Falha ao carregar produtos');
  } finally {
    setLoading(false);
  }
};
  useEffect(() => {
    fetchProducts();
  }, []);

  // DELETE COM REMOÇÃO IMEDIATA + TOAST
  const handleDelete = async (id) => {
  if (!confirm('Tem certeza que deseja excluir este produto?')) return;

  // Guarda o produto antes de remover
  const deletedProduct = products.find(p => p.id === id);
  if (!deletedProduct) return;

  // Remove da UI
  setProducts(prev => prev.filter(p => p.id !== id));

  try {
    const res = await fetch(`/api/products/${id}`, {
      method: 'DELETE',
      cache: 'no-store',
    });
    const result = await res.json();

    if (!res.ok) {
      // Reverte
      setProducts(prev => [...prev, deletedProduct]);
      toast.error(result.message);
      return;
    }

    toast.success(result.message); // ← mensagem da API
  } catch (error) {
    setProducts(prev => [...prev, deletedProduct]);
    toast.error('Erro ao excluir');
  }
};

  const handleAdd = async () => {
  await fetchProducts();
  setShowAddModal(false);
  toast.success('Produto adicionado com sucesso!');
};

const handleUpdate = async () => {
  await fetchProducts();
  setShowEditModal(false);
  setEditingProduct(null);
  toast.success('Produto atualizado com sucesso!');
};

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-orange-700 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-5xl font-extrabold text-white mb-2">QA Automation Shop</h1>
            <p className="text-xl text-pink-100">Lista de Produtos (Admin View)</p>
          </div>

          <div className="flex justify-end mb-6">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition font-semibold shadow-lg flex items-center gap-2"
            >
              Adicionar Produto
            </button>
          </div>

          <div className="bg-slate-800/90 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-700 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-slate-400">Carregando produtos...</div>
            ) : products.length === 0 ? (
              <div className="p-8 text-center text-slate-400">Nenhum produto cadastrado.</div>
            ) : (
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
                      <tr
                        key={p.id}
                        className="border-b border-slate-700 hover:bg-slate-700/30 transition opacity-100"
                        style={{ transition: 'opacity 0.3s' }}
                      >
                        <td className="px-4 py-2 text-slate-300 font-mono text-sm">{p.id}</td>
                        <td className="px-4 py-2 text-white font-medium text-sm">{p.name}</td>
                        <td className="px-4 py-2 text-green-400 font-semibold text-sm">
                          R$ {parseFloat(p.price).toFixed(2)}
                        </td>
                        <td className="px-4 py-2 text-slate-300 text-sm">{p.categories?.name || '-'}</td>
                        <td className="px-4 py-2 text-slate-300 text-sm">{p.suppliers?.company_name || '-'}</td>
                        <td className="px-4 py-2 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => {
                                setEditingProduct(p);
                                setShowEditModal(true);
                              }}
                              className="bg-blue-600 text-white px-2 py-1 rounded text Xs hover:bg-blue-700 transition"
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
            )}
          </div>
        </div>
      </div>

      {showAddModal && (
        <AddProductModal onClose={() => setShowAddModal(false)} onAdd={handleAdd} />
      )}
      {showEditModal && editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={() => {
            setShowEditModal(false);
            setEditingProduct(null);
          }}
          onUpdate={handleUpdate}
        />
      )}
    </>
  );
}