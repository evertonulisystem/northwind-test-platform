'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { ArrowLeft, Package, Search, FolderOpen, Trash2 } from 'lucide-react';

export default function CategoryProductsPage() {
  const router = useRouter();
  const params = useParams();
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCategoryProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const res = await fetch(`/api/v1/categories/${params.id}/products`, { 
        headers,
        cache: 'no-store'
      });
      const result = await res.json();
      
      if (!res.ok) {
        toast.error(result.mensagens?.[0] || 'Erro ao carregar produtos');
        return;
      }
      
      setProducts(result.data || []);
      
      // Set category name from first product or from endpoint messages
      if (result.data?.[0]?.categories?.name) {
        setCategory({ name: result.data[0].categories.name, id: params.id });
      } else if (result.mensagens?.[0]) {
        // Try to extract category name from message like "X produtos encontrados para a categoria Y."
        const match = result.mensagens[0].match(/para a categoria (.+?)\./);
        if (match) {
          setCategory({ name: match[1], id: params.id });
        } else {
          setCategory({ name: 'Categoria', id: params.id });
        }
      } else {
        setCategory({ name: 'Categoria', id: params.id });
      }
    } catch (error) {
      toast.error('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromCategory = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      
      const res = await fetch(`/api/v1/products/${productId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ category_id: null })
      });

      if (res.ok) {
        toast.success('Produto removido da categoria com sucesso!');
        // Refresh the product list
        fetchCategoryProducts();
      } else {
        const result = await res.json();
        toast.error(result.mensagens?.[0] || 'Erro ao remover produto da categoria');
      }
    } catch (error) {
      toast.error('Erro de conexão');
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchCategoryProducts();
    }
  }, [params.id]);

  const filteredProducts = products.filter(product => 
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-800 to-green-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <button
            onClick={() => router.push('/categories')}
            className="inline-flex items-center gap-2 text-white hover:text-emerald-300 mb-4 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar para Categorias
          </button>
          <h1 className="text-5xl font-extrabold text-white mb-3">
            {category?.name || 'Produtos da Categoria'}
          </h1>
          <p className="text-xl text-emerald-200 mb-6">
            Lista de produtos desta categoria
          </p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar produtos..."
                className="w-full pl-11 pr-4 py-3 bg-slate-800/50 backdrop-blur border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Table View */}
        <div className="relative bg-slate-800/90 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-700 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-400">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
              Carregando produtos...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <FolderOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-xl mb-4">
                {searchTerm ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado nesta categoria'}
              </p>
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
                      <th className="px-4 py-3 text-slate-200 font-semibold text-sm">SKU</th>
                      <th className="px-4 py-3 text-slate-200 font-semibold text-sm">Fornecedor</th>
                      <th className="px-4 py-3 text-slate-200 font-semibold text-sm">Estoque</th>
                      <th className="px-4 py-3 text-slate-200 font-semibold text-sm text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="border-b border-slate-700 hover:bg-slate-700/30 transition">
                        <td className="px-4 py-2 text-slate-300 font-mono text-sm">{product.id}</td>
                        <td className="px-4 py-2 text-white font-medium text-sm">{product.name}</td>
                        <td className="px-4 py-2 text-green-400 font-semibold text-sm">
                          R$ {parseFloat(product.price || 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-2 text-slate-300 text-sm">{product.sku}</td>
                        <td className="px-4 py-2 text-slate-300 text-sm">
                          {product.suppliers?.company_name || '-'}
                        </td>
                        <td className="px-4 py-2 text-slate-300 text-sm">
                          {product.stock_quantity} unid.
                        </td>
                        <td className="px-4 py-2 text-center">
                          <button
                            onClick={() => handleRemoveFromCategory(product.id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg transition flex items-center justify-center gap-1 mx-auto"
                          >
                            <Trash2 className="w-4 h-4" />
                            Remover
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="bg-slate-900/50 px-6 py-4 border-t border-slate-700">
                <p className="text-slate-400 text-sm">
                  Total: {filteredProducts.length} produto{filteredProducts.length !== 1 ? 's' : ''}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
