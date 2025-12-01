// app/components/ProductDetailsModal.jsx
import { X, Search } from 'lucide-react';

export default function ProductDetailsModal({ product, onClose }) {
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
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg transition transform hover:scale-105"
            >
              Imprimir (PDF/PNG)
            </button>
            <button
              onClick={onClose}
              className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition"
            >
              Cancelar
            </button>
            <button
              onClick={onClose}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg transition transform hover:scale-105"
            >
              OK, entendi!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}