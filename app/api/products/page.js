// app/products/page.js
'use client';

import { useEffect, useState } from 'react';
import DeleteButton from '@/components/DeleteButton';
import EditButton from '@/components/EditButton';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Erro na API');
      const { products } = await res.json();
      setProducts(products || []);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold text-white mb-2">QA Automation Shop</h1>
          <p className="text-pink-100 text-lg">Lista de Produtos (Admin View)</p>
        </div>

        {loading ? (
          <p className="text-center text-white text-xl">Carregando produtos...</p>
        ) : products.length === 0 ? (
          <p className="text-center text-white text-xl">Nenhum produto encontrado.</p>
        ) : (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl p-6 overflow-x-auto">
            <table className="w-full text-left text-white min-w-max">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Nome</th>
                  <th className="py-3 px-4">Preço</th>
                  <th className="py-3 px-4">Estoque</th>
                  <th className="py-3 px-4">Categoria</th>
                  <th className="py-3 px-4">Fornecedor</th>
                  <th className="py-3 px-4">Ações</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-white/10 hover:bg-white/5 transition">
                    <td className="py-3 px-4 text-sm">{product.id}</td>
                    <td className="py-3 px-4 font-medium">{product.name}</td>
                    <td className="py-3 px-4">R$ {product.price?.toFixed(2).replace('.', ',') || '0,00'}</td>
                    <td className="py-3 px-4">{product.stock_quantity || 0}</td>
                    <td className="py-3 px-4">{product.categories?.name || 'N/A'}</td>
                    <td className="py-3 px-4">{product.suppliers?.company_name || 'N/A'}</td>
                    <td className="py-3 px-4">
                      <EditButton product={product} onUpdate={fetchProducts} />
                      <DeleteButton productId={product.id} onDelete={fetchProducts} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}