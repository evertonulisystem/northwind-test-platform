// app/products/page.js
'use client';

import { useEffect, useState } from 'react';
import DeleteButton from '@/components/DeleteButton';
import EditButton from '@/components/EditButton';
import AddProductModal from '@/components/AddProductModal';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  

  const fetchProducts = async () => {
    setLoading(true);
    const res = await fetch('/api/products');
    const { products } = await res.json();
    setProducts(products);
    setLoading(false);
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
          <p className="text-center text-white">Carregando...</p>
        ) : (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl p-6 overflow-x-auto">
           <div className="flex justify-between items-center mb-6">
  <h2 className="text-2xl font-bold text-white">Produtos</h2>
  <button
    onClick={() => setShowAddModal(true)}
    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
  >
    + Adicionar Produto
  </button>
</div>

{showAddModal && (
  <AddProductModal
    onClose={() => setShowAddModal(false)}
    onAdd={fetchProducts}
  />
)}

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
                  <tr key={product.id} className="border-b border-white/10 hover:bg-white/5">
                    <td className="py-3 px-4 text-sm">{product.id}</td>
                    <td className="py-3 px-4 font-medium">{product.name}</td>
                    <td className="py-3 px-4">R$ {product.price?.toFixed(2).replace('.', ',')}</td>
                    <td className="py-3 px-4">{product.stock_quantity}</td>
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