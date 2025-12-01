// app/products/page.js
'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import RulesModal from '@/components/RulesModal';
import ConfirmModal from '@/components/ConfirmModal';
import AddProductModal from '@/components/AddProductModal';
import EditProductModal from '@/components/EditProductModal';
import { AlertTriangle, Plus, Edit, Trash2 } from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // ← CORRIGIDO AQUI!!!
  const [loading, setLoading] = useState(true);
  const [showRules, setShowRules] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const ITEMS_PER_PAGE = 10;

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/products?page=${pagination.page}&limit=${ITEMS_PER_PAGE}`, {
        cache: 'no-store',
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Erro ${res.status}: ${text || 'Falha na requisição'}`);
      }

      const result = await res.json();

      if (!result?.data) {
        throw new Error('Formato de resposta inválido');
      }

      setProducts(result.data || []);
      setPagination({
        page: result.pagination?.page || 1,
        totalPages: result.pagination?.totalPages || 1,
        total: result.pagination?.total || 0,
      });
    } catch (error) {
      toast.error(error.message || 'Falha ao carregar produtos');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [pagination.page]);

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
        toast.error(result.message || 'Erro ao excluir');
      } else {
        toast.success(result.message || 'Produto excluído!');
        if (products.length === 1 && pagination.page > 1) {
          setPagination(prev => ({ ...prev, page: prev.page - 1 }));
        }
      }
    } catch (error) {
      setProducts(prev => [...prev, deletedProduct]);
      toast.error('Erro ao excluir produto');
    } finally {
      setShowConfirm(false);
      setDeleteId(null);
    }
  };

  const handleAdd = async () => {
    await fetchProducts();
    setShowAddModal(false);
  };

  const handleUpdate = async () => {
    await fetchProducts();
    setShowEditModal(false);
    setEditingProduct(null);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
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
              <Plus className="w-5 h-5" />
              Adicionar Produto
            </button>
          </div>

          <div className="bg-slate-800/90 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-700 overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-slate-400">Carregando produtos...</div>
            ) : products.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <p className="text-xl">Nenhum produto cadastrado ainda.</p>
              </div>
            ) : (
              <>
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
                                className="bg-blue-600 text-white px-3 py-1.5 rounded text-xs hover:bg-blue-700 transition flex items-center gap-1"
                                title="Editar"
                              >
                                <Edit className="w-4 h-4" />
                                Edit
                              </button>
                              <button
                                onClick={() => openConfirm(p.id)}
                                className="bg-red-600 text-white px-3 py-1.5 rounded text-xs hover:bg-red-700 transition flex items-center gap-1"
                                title="Excluir"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* PAGINAÇÃO */}
                <div className="bg-slate-900/50 px-6 py-4 border-t border-slate-700 flex items-center justify-between flex-wrap gap-4">
                  <p className="text-slate-400 text-sm">
                    Mostrando {(pagination.page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(pagination.page * ITEMS_PER_PAGE, pagination.total)} de {pagination.total} produtos
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="px-4 py-2 bg-slate-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition"
                    >
                      Anterior
                    </button>
                    <span className="text-slate-300 font-medium">
                      Página {pagination.page} de {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      className="px-4 py-2 bg-slate-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition"
                    >
                      Próxima
                    </button>
                  </div>
                </div>
              </>
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