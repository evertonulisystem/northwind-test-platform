// app/components/ProductDetailsModal.jsx
import { X, Search, ShoppingCart, Plus, Minus, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';

export default function ProductDetailsModal({ product, onClose }) {
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  if (!product) return null;

  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=900,height=700');
    printWindow.document.write(`
      <html>
        <head>
          <title>${product.name} - QA Automation Shop</title>
          <style>
            body { font-family: 'Segoe UI', sans-serif; padding: 40px; background: linear-gradient(135deg, #5b21b6, #ec4899); color: white; }
            .card { max-width: 700px; margin: 0 auto; background: rgba(30, 41, 59, 0.95); padding: 40px; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.6); }
            h1 { font-size: 2.5rem; text-align: center; color: #ddd6fe; margin-bottom: 30px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .item { background: #334155; padding: 16px; border-radius: 12px; }
            .label { font-weight: bold; color: #c084fc; }
            .value { margin-left: 8px; color: #e2e8f0; font-size: 1.1rem; }
            @media print { body { background: white; color: black; } .card { background: white; color: black; box-shadow: none; } }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>${product.name}</h1>
            <div class="grid">
              <div class="item"><span class="label">ID:</span><span class="value">${product.id}</span></div>
              <div class="item"><span class="label">SKU:</span><span class="value">${product.sku || '-'}</span></div>
              <div class="item"><span class="label">Preço:</span><span class="value">R$ ${parseFloat(product.price || 0).toFixed(2)}</span></div>
              <div class="item"><span class="label">Estoque:</span><span class="value">${product.stock_quantity} unidades</span></div>
              <div class="item"><span class="label">Categoria:</span><span class="value">${product.categories?.name || 'Sem categoria'}</span></div>
              <div class="item"><span class="label">Fornecedor:</span><span class="value">${product.suppliers?.company_name || 'Sem fornecedor'}</span></div>
            </div>
            <p style="text-align:center; margin-top:40px; color:#94a3b8; font-size:0.9rem;">Gerado por QA Automation Shop</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 600);
  };

  const handleAddToCart = async () => {
    try {
      setAddingToCart(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Você precisa estar logado para adicionar ao carrinho.');
        return;
      }

      const res = await fetch('/api/v1/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          product_id: product.id,
          quantity: quantity
        })
      });

      const result = await res.json();
      if (res.ok) {
        toast.success(`${product.name} adicionado ao carrinho!`, {
          icon: '🛒',
        });
        onClose();
      } else {
        toast.error(result.mensagens?.[0] || 'Erro ao adicionar ao carrinho');
      }
    } catch (error) {
      toast.error('Erro de conexão ao adicionar ao carrinho');
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-pink-900 rounded-3xl shadow-2xl border border-purple-600 overflow-hidden max-w-3xl w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-700 to-pink-700 px-8 py-5 flex justify-between items-center">
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <Search className="w-8 h-8" />
            Detalhes do Produto
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-8 bg-slate-900/95">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-800/80 p-5 rounded-xl">
              <span className="text-purple-400 font-bold">ID:</span>
              <span className="text-white ml-3">{product.id}</span>
            </div>
            <div className="bg-slate-800/80 p-5 rounded-xl">
              <span className="text-purple-400 font-bold">SKU:</span>
              <span className="text-white ml-3">{product.sku || '—'}</span>
            </div>
            <div className="bg-slate-800/80 p-5 rounded-xl md:col-span-2">
              <span className="text-purple-400 font-bold">Nome:</span>
              <span className="text-white ml-3 text-lg font-medium">{product.name}</span>
            </div>
            <div className="bg-slate-800/80 p-5 rounded-xl">
              <span className="text-purple-400 font-bold">Preço:</span>
              <span className="text-green-400 ml-3 text-xl font-bold">
                R$ {parseFloat(product.price || 0).toFixed(2)}
              </span>
            </div>
            <div className="bg-slate-800/80 p-5 rounded-xl">
              <span className="text-purple-400 font-bold">Estoque:</span>
              <span className="text-yellow-300 ml-3 text-xl">{product.stock_quantity} unid.</span>
            </div>
            <div className="bg-slate-800/80 p-5 rounded-xl">
              <span className="text-purple-400 font-bold">Categoria:</span>
              <span className="text-cyan-300 ml-3">{product.categories?.name || 'Sem categoria'}</span>
            </div>
            <div className="bg-slate-800/80 p-5 rounded-xl">
              <span className="text-purple-400 font-bold">Fornecedor:</span>
              <span className="text-pink-300 ml-3">{product.suppliers?.company_name || 'Sem fornecedor'}</span>
            </div>
            <div className="bg-slate-800/80 p-5 rounded-xl md:col-span-2">
              <span className="text-purple-400 font-bold">Slug:</span>
              <span className="text-gray-400 ml-3 text-sm">{product.slug}</span>
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-center gap-4 mt-10">
            <button
              onClick={handlePrint}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-6 py-4 rounded-xl font-bold transition flex items-center gap-2 border border-slate-700"
            >
              Imprimir
            </button>
            <div className="flex bg-slate-800 rounded-xl border border-slate-700 p-1">
              <button 
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                data-testid="modal-decrement-qty"
                className="w-10 h-10 flex items-center justify-center hover:bg-slate-700 rounded-lg text-white transition"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span 
                data-testid="modal-quantity-val"
                className="w-12 flex items-center justify-center font-bold text-white text-lg"
              >
                {quantity}
              </span>
              <button 
                onClick={() => setQuantity(q => q + 1)}
                data-testid="modal-increment-qty"
                className="w-10 h-10 flex items-center justify-center hover:bg-slate-700 rounded-lg text-white transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={addingToCart}
              data-testid="modal-add-to-cart-button"
              className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-8 py-4 rounded-xl font-black text-lg shadow-lg transition transform hover:scale-105 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {addingToCart ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <ShoppingCart className="w-5 h-5" />
              )}
              Adicionar ao Carrinho
            </button>
            <button
              onClick={onClose}
              className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-4 rounded-xl font-bold transition"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}