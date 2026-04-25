'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Building2, Package, X, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

export default function UnlinkSupplierModal({ supplier, onClose, onSuccess }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unlinking, setUnlinking] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);

  useEffect(() => {
    if (supplier) {
      fetchSupplierProducts();
    }
  }, [supplier]);

  const fetchSupplierProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // Buscar produtos vinculados ao fornecedor
      const res = await fetch(`/api/v1/products?supplier_id=${supplier.id}`, { headers });
      const result = await res.json();
      
      if (!res.ok) {
        toast.error('Erro ao carregar produtos do fornecedor');
        return;
      }
      
      setProducts(result.data || []);
      // Por padrão, seleciona todos os produtos
      setSelectedProducts((result.data || []).map(p => p.id));
    } catch (error) {
      toast.error('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  const handleProductToggle = (productId) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p.id));
    }
  };

  const handleUnlink = async () => {
    if (selectedProducts.length === 0) {
      toast.error('Selecione pelo menos um produto');
      return;
    }

    setUnlinking(true);

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Você precisa estar logado');
        setUnlinking(false);
        return;
      }

      // Usar o novo endpoint otimizado
      const res = await fetch(`/api/v1/suppliers/${supplier.id}/unlink`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          product_ids: selectedProducts
        })
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.mensagens?.[0] || 'Erro ao desvincular produtos');
        return;
      }

      const { updated_count } = result.data || {};
      toast.success(`${updated_count} produto(s) desvinculado(s) com sucesso!`);
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error('Erro ao desvincular produtos');
    } finally {
      setUnlinking(false);
    }
  };

  if (!supplier) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-3xl bg-slate-800 rounded-xl border border-slate-700 shadow-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-orange-500/20 p-3 rounded-lg">
                <Building2 className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Desvincular Fornecedor</h2>
                <p className="text-slate-400 text-sm mt-1">
                  {supplier.company_name} - Remover fornecedor dos produtos selecionados
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Alert */}
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-orange-400 font-semibold mb-1">Atenção</h3>
                <p className="text-slate-300 text-sm">
                  Ao desvincular o fornecedor, os produtos selecionados ficarão sem fornecedor associado. 
                  Você poderá atribuir um novo fornecedor posteriormente.
                </p>
              </div>
            </div>
          </div>

          {/* Products List */}
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-4" />
              <p className="text-slate-400">Carregando produtos...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 mx-auto mb-4 text-slate-600 opacity-50" />
              <p className="text-slate-400 text-lg mb-4">
                Nenhum produto vinculado a este fornecedor
              </p>
              <p className="text-slate-500 text-sm">
                Este fornecedor já pode ser excluído com segurança
              </p>
            </div>
          ) : (
            <>
              {/* Controls */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer hover:text-white transition">
                    <input
                      type="checkbox"
                      checked={selectedProducts.length === products.length}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="text-sm">
                      Selecionar todos ({products.length})
                    </span>
                  </label>
                  <span className="text-slate-400 text-sm">
                    {selectedProducts.length} selecionado(s)
                  </span>
                </div>
              </div>

              {/* Products Grid */}
              <div className="max-h-96 overflow-y-auto space-y-2">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-4 p-4 bg-slate-700/50 rounded-lg border border-slate-600 hover:border-blue-500 transition"
                  >
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={() => handleProductToggle(product.id)}
                      className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500 focus:ring-2 flex-shrink-0"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-500/20 p-2 rounded-lg">
                          <Package className="w-5 h-5 text-blue-400 flex-shrink-0" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-medium truncate">{product.name}</h4>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-green-400 text-sm font-semibold">
                              R$ {parseFloat(product.price || 0).toFixed(2)}
                            </span>
                            <span className="text-slate-400 text-sm">
                              Estoque: {product.stock_quantity || 0}
                            </span>
                            <span className="text-slate-400 text-sm">
                              SKU: {product.sku || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition font-semibold"
            >
              Cancelar
            </button>
            
            {products.length > 0 && (
              <button
                onClick={handleUnlink}
                disabled={selectedProducts.length === 0 || unlinking}
                className="flex-1 px-6 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-700 disabled:opacity-50 text-white rounded-lg transition font-semibold flex items-center justify-center gap-2"
              >
                {unlinking ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Desvinculando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Desvincular {selectedProducts.length} produto(s)
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
