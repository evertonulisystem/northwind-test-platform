'use client';

// ============================================================
// 🆕 NOVA FUNCIONALIDADE — Relatório de Vendas por Produto
// Página: /reports
// Fonte de dados: order_items agrupados por product_id
// Exibe ranking dos produtos mais vendidos com receita total.
//
// Conceito pedagógico:
//   Aqui o aluno aprende a testar relatórios que agregam dados
//   de múltiplas tabelas — um cenário real de QA em e-commerce.
//
// Adicionado em: agosto/2026
// ============================================================

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import {
  BarChart2, ArrowLeft, Trophy, TrendingUp, Package,
  ShoppingCart, Star, DollarSign, Tag, Loader,
} from 'lucide-react';

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
}

function StarRating({ value = 0 }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-3.5 h-3.5 ${s <= Math.round(value) ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`}
        />
      ))}
    </span>
  );
}

// Medalhas para os 3 primeiros
const RANK_STYLE = {
  1: { bg: 'from-yellow-500/20 to-amber-500/10', border: 'border-yellow-500/50', badge: 'bg-yellow-500', emoji: '🥇' },
  2: { bg: 'from-slate-400/20 to-slate-500/10', border: 'border-slate-400/50', badge: 'bg-slate-400', emoji: '🥈' },
  3: { bg: 'from-orange-700/20 to-orange-800/10', border: 'border-orange-700/50', badge: 'bg-orange-700', emoji: '🥉' },
};

function getRankStyle(rank) {
  return RANK_STYLE[rank] || {
    bg: 'from-slate-700/40 to-slate-800/20',
    border: 'border-slate-700',
    badge: 'bg-slate-600',
    emoji: null,
  };
}

export default function ReportsPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    fetchReport();
  }, [limit]);

  async function fetchReport() {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) { router.push('/'); return; }
      const res = await fetch(`/api/v1/reports/top-products?limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      if (res.status === 401) { router.push('/'); return; }
      const result = await res.json();
      setProducts(result.data || []);
      setMeta(result.meta || null);
    } catch {
      toast.error('Erro ao carregar relatório.');
    } finally {
      setLoading(false);
    }
  }

  // KPIs do topo
  const totalQty = products.reduce((acc, p) => acc + p.total_quantity_sold, 0);
  const totalRevenue = meta?.grand_total_revenue || products.reduce((acc, p) => acc + p.total_revenue, 0);
  const totalDiscount = products.reduce((acc, p) => acc + p.total_discount_given, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-orange-700 p-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/products')}
            data-testid="back-to-products-button"
            className="flex items-center gap-2 text-pink-200 hover:text-white mb-4 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar aos Produtos
          </button>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-extrabold text-white flex items-center gap-3">
                <BarChart2 className="w-10 h-10 text-violet-400" />
                Relatório de Vendas
                {/* Badge nova funcionalidade */}
                <span className="badge-novo bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full border-2 border-purple-900">
                  Novo
                </span>
              </h1>
              <p className="text-pink-200 mt-1">
                Produtos mais vendidos com base nos itens dos pedidos
              </p>
            </div>

            {/* Seletor de limite */}
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              data-testid="limit-select"
              className="bg-slate-700 border border-slate-600 text-white px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value={5}>Top 5</option>
              <option value={10}>Top 10</option>
              <option value={20}>Top 20</option>
              <option value={50}>Top 50</option>
            </select>
          </div>
        </div>

        {/* KPI Cards */}
        {!loading && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-slate-800/90 rounded-2xl border border-slate-700 p-5 shadow-xl" data-testid="kpi-revenue">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-500/20 rounded-xl border border-amber-500/30">
                  <DollarSign className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-wider">Receita Total</p>
                  <p className="text-white font-extrabold text-2xl">{formatCurrency(totalRevenue)}</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/90 rounded-2xl border border-slate-700 p-5 shadow-xl" data-testid="kpi-quantity">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-500/20 rounded-xl border border-purple-500/30">
                  <ShoppingCart className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-wider">Unidades Vendidas</p>
                  <p className="text-white font-extrabold text-2xl">{totalQty.toLocaleString('pt-BR')}</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/90 rounded-2xl border border-slate-700 p-5 shadow-xl" data-testid="kpi-discount">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-500/20 rounded-xl border border-green-500/30">
                  <Tag className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-wider">Descontos Dados</p>
                  <p className="text-white font-extrabold text-2xl">{formatCurrency(totalDiscount)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-20">
            <Loader className="w-12 h-12 text-purple-400 animate-spin mx-auto" />
            <p className="text-pink-200 mt-4">Gerando relatório...</p>
          </div>
        )}

        {/* Empty */}
        {!loading && products.length === 0 && (
          <div className="text-center py-20 bg-slate-800/60 rounded-2xl border border-slate-700">
            <Package className="w-16 h-16 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-300 text-xl font-semibold">Nenhuma venda encontrada</p>
            <p className="text-slate-400 mt-2">Os dados aparecem após pedidos serem registrados no sistema.</p>
          </div>
        )}

        {/* Ranking */}
        {!loading && products.length > 0 && (
          <div className="space-y-4" data-testid="top-products-list">
            {products.map((product) => {
              const rs = getRankStyle(product.rank);
              return (
                <div
                  key={product.product_id}
                  data-testid={`product-rank-${product.rank}`}
                  className={`bg-gradient-to-r ${rs.bg} rounded-2xl border ${rs.border} p-5 shadow-xl transition-all duration-200 hover:scale-[1.01]`}
                >
                  <div className="flex items-center gap-5 flex-wrap">

                    {/* Rank badge */}
                    <div className="flex-shrink-0 flex flex-col items-center gap-1">
                      <div className={`w-12 h-12 ${rs.badge} rounded-full flex items-center justify-center shadow-lg`}>
                        {rs.emoji ? (
                          <span className="text-2xl">{rs.emoji}</span>
                        ) : (
                          <span className="text-white font-extrabold text-lg">#{product.rank}</span>
                        )}
                      </div>
                    </div>

                    {/* Imagem */}
                    <div className="w-14 h-14 rounded-xl bg-slate-700 flex-shrink-0 overflow-hidden border border-slate-600">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-7 h-7 text-slate-400" />
                        </div>
                      )}
                    </div>

                    {/* Info do produto */}
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold text-lg truncate" data-testid={`product-name-${product.rank}`}>
                        {product.name}
                      </p>
                      <p className="text-slate-400 text-sm">SKU: {product.sku}</p>
                      {product.rating > 0 && (
                        <div className="flex items-center gap-2 mt-1">
                          <StarRating value={product.rating} />
                          <span className="text-slate-400 text-xs">({product.reviews_count} avaliações)</span>
                        </div>
                      )}
                    </div>

                    {/* Métricas */}
                    <div className="grid grid-cols-3 gap-6 flex-shrink-0">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-purple-400 mb-1">
                          <ShoppingCart className="w-4 h-4" />
                        </div>
                        <p className="text-white font-bold text-xl" data-testid={`product-qty-${product.rank}`}>
                          {product.total_quantity_sold}
                        </p>
                        <p className="text-slate-400 text-xs">unidades</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-amber-400 mb-1">
                          <DollarSign className="w-4 h-4" />
                        </div>
                        <p className="text-white font-bold text-xl" data-testid={`product-revenue-${product.rank}`}>
                          {formatCurrency(product.total_revenue)}
                        </p>
                        <p className="text-slate-400 text-xs">receita</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-green-400 mb-1">
                          <TrendingUp className="w-4 h-4" />
                        </div>
                        <p className="text-white font-bold text-xl">
                          {product.orders_count}
                        </p>
                        <p className="text-slate-400 text-xs">pedidos</p>
                      </div>
                    </div>
                  </div>

                  {/* Barra de progresso visual (relativa ao 1º colocado) */}
                  {products[0]?.total_quantity_sold > 0 && (
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Participação nas vendas</span>
                        <span>{((product.total_quantity_sold / products[0].total_quantity_sold) * 100).toFixed(0)}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-700"
                          style={{ width: `${(product.total_quantity_sold / products[0].total_quantity_sold) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
