// app/products/page.js
'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import RulesModal from '@/components/RulesModal';
import ConfirmModal from '@/components/ConfirmModal';
import AddProductModal from '@/components/AddProductModal';
import EditProductModal from '@/components/EditProductModal';
import { AlertTriangle } from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRules, setShowRules] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

const fetchProducts = async () => {
  try {
    setLoading(true);

    const res = await fetch('/api/products', { cache: 'no-store' });

    // 1. VERIFICA SE A RESPOSTA É OK
    if (!res.ok) {
      const text = await res.text();
      console.error('API retornou erro:', res.status, text);
      throw new Error(`Erro ${res.status}: ${text || 'Resposta inválida'}`);
    }

    // 2. TENTA FAZER PARSE DO JSON
    let result;
    try {
      result = await res.json();
    } catch (jsonError) {
      const text = await res.text();
      console.error('JSON inválido recebido:', text);
      throw new Error('Resposta da API não é JSON válido');
    }

    // 3. VALIDA O FORMATO
    if (!result || typeof result !== 'object') {
      throw new Error('Formato de resposta inválido');
    }

    setProducts(result.data || []);
  } catch (error) {
    toast.error(error.message || 'Falha ao carregar produtos');
    console.error('Erro completo:', error);
    setProducts([]);
  } finally {
    setLoading(false);
  }
};
  useEffect(() => {
    fetchProducts();
  }, []);

  const openConfirm = (id) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    const deletedProduct = products.find(p => p.id === deleteId);
    if (!deletedProduct) return;

    setProducts(prev => prev.filter(p => p.id !== deleteId));

    try {
      const res = await fetch(`/api/products/${deleteId}`, {
        method: 'DELETE',
        cache: 'no-store',
      });
      const result = await res.json();

      if (!res.ok) {
        setProducts(prev => [...prev, deletedProduct]);
        toast.error(result.message);
      } else {
        toast.success(result.message);
      }
    } catch (error) {
      setProducts(prev => [...prev, deletedProduct]);
      toast.error('Erro ao excluir');
    } finally {
      setShowConfirm(false);
      setDeleteId(null);
    }
  };

  const handleAdd = async () => {
    await fetchProducts();
    setShowAddModal(false);
    //toast.success('Produto adicionado com sucesso!');
  };

 const handleUpdate = async () => {
  await fetchProducts(); // ← ESPERA TERMINAR
  setShowEditModal(false);
  setEditingProduct(null);
  // REMOVA O TOAST AQUI!
};

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-orange-700 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-5xl font-extrabold text-white mb-3">QA Automation Shop</h1>
            <p className="text-xl text-pink-100 mb-4">Lista de Produtos (Admin View)</p>

            <button
              onClick={() => setShowRules(true)}
              className="bg-yellow-500 hover:bg-yellow-600 text-purple-900 font-bold px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 mx-auto transition transform hover:scale-105"
            >
              <AlertTriangle className="w-6 h-6" />
              Regras do Playground
            </button>
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
                      <tr key={p.id} className="border-b border-slate-700 hover:bg-slate-700/30 transition">
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
                              className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700 transition"
                              title="Editar"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => openConfirm(p.id)}
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
      <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} />
      <ConfirmModal
        isOpen={showConfirm}
        message="Tem certeza que deseja excluir este produto?"
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowConfirm(false);
          setDeleteId(null);
        }}
      />
    </>
  );
}