// app/products/page.js → VERSÃO FINAL COMPLETA E FUNCIONANDO 100%
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from 'use-debounce';
import { toast } from 'react-toastify';
import RulesModal from '@/components/RulesModal.jsx';
import ConfirmModal from '@/components/ConfirmModal.jsx';
import AddProductModal from '@/components/AddProductModal.jsx';
import EditProductModal from '@/components/EditProductModal.jsx';
import { AlertTriangle, Plus, Edit, Trash2, Search, X, ChevronDown } from 'lucide-react';
import ProductDetailsModal from '@/components/ProductDetailsModal.jsx';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]); // todos os produtos carregados
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);

  // FILTRO EM CASCATA
  const [searchName, setSearchName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('');

  const [debouncedName] = useDebounce(searchName, 400);

  // Estados para categorias e fornecedores da API
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  // Funções para buscar categorias e fornecedores da API
  const fetchCategories = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const res = await fetch('/api/categories', { headers });
      const result = await res.json();
      setCategories(result.data || []);
      console.log('🐛 DEBUG CATEGORIES - Carregadas:', result.data?.length || 0);
    } catch (error) {
      console.error('🐛 DEBUG CATEGORIES - Erro:', error);
    }
  }, []);

  const fetchSuppliers = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const res = await fetch('/api/suppliers', { headers });
      const result = await res.json();
      setSuppliers(result.data || []);
      console.log('🐛 DEBUG SUPPLIERS - Carregados:', result.data?.length || 0);
    } catch (error) {
      console.error('🐛 DEBUG SUPPLIERS - Erro:', error);
    }
  }, []);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showRules, setShowRules] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [showDetails, setShowDetails] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const ITEMS_PER_PAGE = 10;

  // Carrega TODOS os produtos uma vez (poucos dados, é rápido)
  const fetchAllProducts = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🐛 DEBUG PRODUCTS - Buscando produtos...');
      
      // 🚨 DEBUGGER DEMONSTRATIVO - NUNCA DEIXE EM PRODUÇÃO! 🚨 utiizado na aula sobre debug debugger
      // debugger;
      // console.log('🔍 PONTO DE PARADA: Verifique as variáveis no DevTools');
      // console.log('📊 Estado atual:', { loading, products, pagination });
      // console.log('🎓 AULA: Este é um exemplo de POR QUE debuggers devem ser removidos!');
      // console.log('⚠️  PROBLEMAS: Bloqueia execução, expõe dados, afeta UX, causa bugs em produção!');
      
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('🐛 DEBUG PRODUCTS - Token encontrado, adicionando ao header');
      } else {
        console.log('🐛 DEBUG PRODUCTS - Nenhum token encontrado');
      }
      
      const res = await fetch('/api/products?limit=1000', { 
        cache: 'no-store',
        headers
      });
      console.log('🐛 DEBUG PRODUCTS - Response status:', res.status);
      const result = await res.json();
      console.log('🐛 DEBUG PRODUCTS - Dados recebidos:', result);
      setAllProducts(result.data || []);
      console.log('🐛 DEBUG PRODUCTS - Produtos setados:', result.data?.length || 0);
    } catch (error) {
      console.error('🐛 DEBUG PRODUCTS - Erro:', error);
      toast.error('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllProducts();
    fetchCategories();
    fetchSuppliers();
  }, [fetchAllProducts, fetchCategories, fetchSuppliers]);

  // Filtra e pagina os produtos
  useEffect(() => {
    let filtered = [...allProducts];

    if (debouncedName) {
      filtered = filtered.filter(p =>
        p.name?.toLowerCase().includes(debouncedName.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(p => p.categories?.name === selectedCategory);
    }

    if (selectedSupplier) {
      filtered = filtered.filter(p => p.suppliers?.company_name === selectedSupplier);
    }

    // Ordenação por ID ascendente
    filtered.sort((a, b) => a.id - b.id);

    const total = filtered.length;
    const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
    const start = (pagination.page - 1) * ITEMS_PER_PAGE;
    const paginated = filtered.slice(start, start + ITEMS_PER_PAGE);

    setProducts(paginated);
    setPagination(prev => ({ ...prev, total, totalPages }));
    setIsFiltering(false);
  }, [allProducts, debouncedName, selectedCategory, selectedSupplier, pagination.page]);

  // Resetar página ao mudar filtro
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [debouncedName, selectedCategory, selectedSupplier]);

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const clearFilters = () => {
    setSearchName('');
    setSelectedCategory('');
    setSelectedSupplier('');
  };

  const hasFilters = searchName || selectedCategory || selectedSupplier;

  // DELETE / ADD / UPDATE
  const openConfirm = (id) => { setDeleteId(id); setShowConfirm(true); };
  const confirmDelete = async () => {
    if (!deleteId) return;
    const deleted = products.find(p => p.id === deleteId);
    setProducts(prev => prev.filter(p => p.id !== deleteId));
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Você precisa estar logado para excluir produtos');
        setShowConfirm(false);
        setDeleteId(null);
        return;
      }
      
      const res = await fetch(`/api/products/${deleteId}`, { 
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error();
      toast.success('Produto excluído com sucesso!');
      await fetchAllProducts(); // recarrega tudo
    } catch {
      setProducts(prev => [...prev, deleted]);
      toast.error('Erro ao excluir');
    } finally {
      setShowConfirm(false);
      setDeleteId(null);
    }
  };

  const handleAdd = async () => { await fetchAllProducts(); setShowAddModal(false); };
  const handleUpdate = async () => { await fetchAllProducts(); setShowEditModal(false); setEditingProduct(null); };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-orange-700 p-6">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-5xl font-extrabold text-white mb-3">QA Automation Shop</h1>
            <p className="text-xl text-pink-100 mb-4">Lista de Produtos (Admin View)</p>
            <button onClick={() => setShowRules(true)}
              className="bg-yellow-500 hover:bg-yellow-600 text-purple-900 font-bold px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 mx-auto transition transform hover:scale-105">
              <AlertTriangle className="w-6 h-6" />
              Regras do Playground
            </button>
          </div>

          <div className="flex justify-end mb-6">
            <button onClick={() => setShowAddModal(true)}
              className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition font-semibold shadow-lg flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Adicionar Produto
            </button>
          </div>

          {/* FILTRO EM CASCATA LINDO */}
          <div className="bg-slate-800/90 backdrop-blur-md rounded-2xl p-6 mb-6 border border-slate-700 shadow-2xl">
            <div className="flex flex-wrap gap-6 items-end">

              {/* NOME */}
              <div className="flex-1 min-w-[300px]">
                <div className="relative">
                  <Search className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    placeholder="Digite o nome do produto..."
                    className="w-full pl-11 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* CATEGORIA */}
              {categories.length > 0 && (
                <div className="relative min-w-[240px]">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value || '')}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 pr-10"
                  >
                    <option value="">Todas as categorias</option>
                    {categories.map(cat => (
                      <option key={cat.id || cat.name} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-4 w-5 h-5 text-slate-400 pointer-events-none" />
                </div>
              )}

              {/* FORNECEDOR */}
              {suppliers.length > 0 && (
                <div className="relative min-w-[240px]">
                  <select
                    value={selectedSupplier}
                    onChange={(e) => setSelectedSupplier(e.target.value || '')}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 pr-10"
                  >
                    <option value="">Todos os fornecedores</option>
                    {suppliers.map(sup => (
                      <option key={sup.id || sup.company_name} value={sup.id || sup.company_name}>{sup.company_name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-4 w-5 h-5 text-slate-400 pointer-events-none" />
                </div>
              )}

              {/* LIMPAR */}
              {hasFilters && (
                <button onClick={clearFilters}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition flex items-center gap-2">
                  <X className="w-5 h-5" />
                  Limpar filtros
                </button>
              )}
            </div>
          </div>

          {/* TABELA */}
          <div className="relative bg-slate-800/90 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-700 overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-slate-400">Carregando produtos...</div>
            ) : products.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <p className="text-xl">Nenhum produto encontrado.</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-700/50 border-b border-slate-600">
                      <tr>
                        <th className="px-4 py-3 text-slate-200 font-semibold text-sm">ID</th>
                        <th className="px-4 py-3 text-slate-200 font-semibold text-sm">Nome</th>
                        <th className="px-4 py-3 text-slate-200 font-semibold text-sm">Preço</th>
                        <th className="px-4 py-3 text-slate-200 font-semibold text-sm">Categoria</th>
                        <th className="px-4 py-3 text-slate-200 font-semibold text-sm">Fornecedor</th>
                        <th className="px-4 py-3 text-slate-200 font-semibold text-sm text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p) => (
                        <tr key={p.id} className="border-b border-slate-700 hover:bg-slate-700/30 transition">
                          <td className="px-4 py-2 text-slate-300 font-mono text-sm">{p.id}</td>
                          <td className="px-4 py-2 text-white font-medium text-sm">{p.name}</td>
                          <td className="px-4 py-2 text-green-400 font-semibold text-sm">
                            R$ {parseFloat(p.price || 0).toFixed(2)}
                          </td>
                          <td className="px-4 py-2 text-slate-300 text-sm">{p.categories?.name || '-'}</td>
                          <td className="px-4 py-2 text-slate-300 text-sm">{p.suppliers?.company_name || '-'}</td>
                          <td className="px-4 py-2 text-center">
                            <div className="flex justify-center gap-2">
                              <button onClick={() => { setEditingProduct(p); setShowEditModal(true); }}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs transition flex items-center gap-1">
                                <Edit className="w-4 h-4" /> Edit
                              </button>
                              <button onClick={() => openConfirm(p.id)}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-xs transition flex items-center gap-1">
                                <Trash2 className="w-4 h-4" /> Delete
                              </button>
                              <button 
  onClick={() => { setSelectedProduct(p); setShowDetails(true); }}
  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 shadow-md">
  <Search className="w-4 h-4" /> Detalhes
</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-slate-900/50 px-6 py-4 border-t border-slate-700 flex flex-wrap items-center justify-between gap-4">
                  <p className="text-slate-400 text-sm">
                    Mostrando {(pagination.page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(pagination.page * ITEMS_PER_PAGE, pagination.total)} de {pagination.total} produtos
                  </p>
                  <div className="flex items-center gap-3">
                    <button onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="px-4 py-2 bg-slate-700 text-white rounded-lg disabled:opacity-50 hover:bg-slate-600 transition">
                      Anterior
                    </button>
                    <span className="text-slate-300 font-medium">
                      Página {pagination.page} de {pagination.totalPages || 1}
                    </span>
                    <button onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      className="px-4 py-2 bg-slate-700 text-white rounded-lg disabled:opacity-50 hover:bg-slate-600 transition">
                      Próxima
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* MODAIS */}
      {/* MODAL DE DETALHES */}
      {showDetails && (
        <ProductDetailsModal
          product={selectedProduct}
          onClose={() => {
            setShowDetails(false);
            setSelectedProduct(null);
          }}
        />
      )}
      {showAddModal && <AddProductModal onClose={() => setShowAddModal(false)} onAdd={handleAdd} />}
      {showEditModal && editingProduct && (
        <EditProductModal product={editingProduct}
          onClose={() => { setShowEditModal(false); setEditingProduct(null); }}
          onUpdate={handleUpdate} />
      )}
      <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} />
      <ConfirmModal isOpen={showConfirm}
        message="Tem certeza que deseja excluir este produto?"
        onConfirm={confirmDelete}
        onCancel={() => { setShowConfirm(false); setDeleteId(null); }} />
    </>
  );
}