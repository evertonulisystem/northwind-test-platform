"use client";

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

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  BarChart2,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Loader,
  Package,
  ShoppingCart,
  Tag,
  Trophy,
} from "lucide-react";

const ITEMS_PER_PAGE = 10;

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
}

function getRankBadge(rank) {
  if (rank === 1) {
    return "bg-amber-500/20 text-amber-300 border-amber-400/50";
  }

  if (rank === 2) {
    return "bg-slate-400/20 text-slate-200 border-slate-400/50";
  }

  if (rank === 3) {
    return "bg-orange-600/20 text-orange-200 border-orange-500/50";
  }

  return "bg-slate-700/80 text-slate-200 border-slate-600";
}

function getRankIcon(rank) {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return `#${rank}`;
}

export default function ReportsPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [top, setTop] = useState(20);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: ITEMS_PER_PAGE,
    total: 0,
    totalPages: 0,
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchReport();
  }, [top, page]);

  async function fetchReport() {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/");
        return;
      }

      const res = await fetch(
        `/api/v1/reports/top-products?top=${top}&page=${page}&limit=${ITEMS_PER_PAGE}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        },
      );

      if (res.status === 401) {
        router.push("/");
        return;
      }

      const result = await res.json();

      if (!res.ok) {
        const errorMessage =
          result?.mensagens?.[0] || "Erro ao carregar relatório.";
        setProducts([]);
        setMeta(null);
        setPagination({
          page: 1,
          limit: ITEMS_PER_PAGE,
          total: 0,
          totalPages: 0,
        });
        setMessage(errorMessage);
        toast.error(errorMessage);
        return;
      }

      setProducts(result.data || []);
      setMeta(result.meta || null);
      setPagination(
        result.pagination || {
          page: 1,
          limit: ITEMS_PER_PAGE,
          total: 0,
          totalPages: 0,
        },
      );
      setMessage(result.mensagens?.[0] || "");
    } catch {
      setProducts([]);
      setMeta(null);
      setPagination({
        page: 1,
        limit: ITEMS_PER_PAGE,
        total: 0,
        totalPages: 0,
      });
      setMessage("Erro ao carregar relatório.");
      toast.error("Erro ao carregar relatório.");
    } finally {
      setLoading(false);
    }
  }

  function handleTopChange(nextTop) {
    setTop(Number(nextTop));
    setPage(1);
  }

  function handlePageChange(nextPage) {
    if (nextPage < 1 || nextPage > (pagination.totalPages || 1)) {
      return;
    }

    setPage(nextPage);
  }

  const totalQty =
    meta?.grand_total_quantity ??
    products.reduce((acc, p) => acc + p.total_quantity_sold, 0);
  const totalRevenue =
    meta?.grand_total_revenue ??
    products.reduce((acc, p) => acc + p.total_revenue, 0);
  const totalDiscount =
    meta?.grand_total_discount ??
    products.reduce((acc, p) => acc + p.total_discount_given, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-orange-700 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => router.push("/products")}
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
                <span className="badge-novo bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full border-2 border-purple-900">
                  Novo
                </span>
              </h1>
              <p className="text-pink-200 mt-1">
                Produtos mais vendidos com base nos itens dos pedidos
              </p>
            </div>

            <select
              value={top}
              onChange={(event) => handleTopChange(event.target.value)}
              data-testid="limit-select"
              className="bg-slate-700 border border-slate-600 text-white px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value={10}>Top 10</option>
              <option value={20}>Top 20</option>
              <option value={50}>Top 50</option>
              <option value={100}>Top 100</option>
            </select>
          </div>
        </div>

        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div
              className="bg-slate-800/90 rounded-2xl border border-slate-700 p-5 shadow-xl"
              data-testid="kpi-revenue"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-500/20 rounded-xl border border-amber-500/30">
                  <DollarSign className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-wider">
                    Receita Total
                  </p>
                  <p className="text-white font-extrabold text-2xl">
                    {formatCurrency(totalRevenue)}
                  </p>
                </div>
              </div>
            </div>

            <div
              className="bg-slate-800/90 rounded-2xl border border-slate-700 p-5 shadow-xl"
              data-testid="kpi-quantity"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-500/20 rounded-xl border border-purple-500/30">
                  <ShoppingCart className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-wider">
                    Unidades Vendidas
                  </p>
                  <p className="text-white font-extrabold text-2xl">
                    {totalQty.toLocaleString("pt-BR")}
                  </p>
                </div>
              </div>
            </div>

            <div
              className="bg-slate-800/90 rounded-2xl border border-slate-700 p-5 shadow-xl"
              data-testid="kpi-discount"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-500/20 rounded-xl border border-green-500/30">
                  <Tag className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-wider">
                    Descontos Dados
                  </p>
                  <p className="text-white font-extrabold text-2xl">
                    {formatCurrency(totalDiscount)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="text-center py-20">
            <Loader className="w-12 h-12 text-purple-400 animate-spin mx-auto" />
            <p className="text-pink-200 mt-4">Gerando relatório...</p>
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="text-center py-20 bg-slate-800/60 rounded-2xl border border-slate-700">
            <Package className="w-16 h-16 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-300 text-xl font-semibold">
              {message || "Nenhuma venda encontrada"}
            </p>
            <p className="text-slate-400 mt-2">
              Os dados aparecem após pedidos serem registrados no sistema.
            </p>
          </div>
        )}

        {!loading && products.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm text-pink-100">
              <p>
                Mostrando {(pagination.page - 1) * pagination.limit + 1}-
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                de {pagination.total} produtos
              </p>
              <p className="text-pink-200">
                Página {pagination.page} de {pagination.totalPages || 1}
              </p>
            </div>

            <div
              className="relative bg-slate-800/90 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-700 overflow-hidden"
              data-testid="top-products-list"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-700/50 border-b border-slate-600">
                    <tr>
                      <th className="px-4 py-3 text-slate-200 font-semibold text-sm">
                        Posição
                      </th>
                      <th className="px-4 py-3 text-slate-200 font-semibold text-sm">
                        Produto
                      </th>
                      <th className="px-4 py-3 text-slate-200 font-semibold text-sm">
                        SKU
                      </th>
                      <th className="px-4 py-3 text-slate-200 font-semibold text-sm">
                        Unidades
                      </th>
                      <th className="px-4 py-3 text-slate-200 font-semibold text-sm">
                        Receita
                      </th>
                      <th className="px-4 py-3 text-slate-200 font-semibold text-sm">
                        Pedidos
                      </th>
                      <th className="px-4 py-3 text-slate-200 font-semibold text-sm">
                        Participação
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr
                        key={product.product_id}
                        data-testid={`product-rank-${product.rank}`}
                        className="border-b border-slate-700 hover:bg-slate-700/30 transition"
                      >
                        <td className="px-4 py-3">
                          <div
                            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold ${getRankBadge(product.rank)}`}
                          >
                            <Trophy className="w-3.5 h-3.5" />
                            <span>{getRankIcon(product.rank)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-600 bg-slate-700/60 text-slate-300">
                              <Package className="w-5 h-5" />
                            </div>
                            <div>
                              <p
                                className="text-white font-semibold"
                                data-testid={`product-name-${product.rank}`}
                              >
                                {product.name}
                              </p>
                              <p className="text-slate-400 text-xs">
                                {product.current_price
                                  ? formatCurrency(product.current_price)
                                  : "Preço indisponível"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-300 text-sm">
                          {product.sku}
                        </td>
                        <td
                          className="px-4 py-3 text-white font-semibold"
                          data-testid={`product-qty-${product.rank}`}
                        >
                          {product.total_quantity_sold}
                        </td>
                        <td
                          className="px-4 py-3 text-white font-semibold"
                          data-testid={`product-revenue-${product.rank}`}
                        >
                          {formatCurrency(product.total_revenue)}
                        </td>
                        <td className="px-4 py-3 text-slate-300">
                          {product.orders_count}
                        </td>
                        <td className="px-4 py-3">
                          <div className="min-w-[150px]">
                            <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
                              <span>Participação</span>
                              <span>
                                {product.participation_percentage?.toFixed(1) ||
                                  0}
                                %
                              </span>
                            </div>
                            <div className="h-2 rounded-full bg-slate-700 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                                style={{
                                  width: `${Math.min(100, product.participation_percentage || 0)}%`,
                                }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-slate-900/50 px-6 py-4 border-t border-slate-700 flex flex-wrap items-center justify-between gap-4">
                <p className="text-slate-400 text-sm">
                  Mostrando {(pagination.page - 1) * pagination.limit + 1}-
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.total,
                  )}{" "}
                  de {pagination.total} produtos
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    data-testid="prev-page-button"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg disabled:opacity-50 hover:bg-slate-600 transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Anterior
                  </button>
                  <span
                    className="text-slate-300 font-medium"
                    data-testid="current-page"
                  >
                    Página {pagination.page} de {pagination.totalPages || 1}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= (pagination.totalPages || 1)}
                    data-testid="next-page-button"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg disabled:opacity-50 hover:bg-slate-600 transition"
                  >
                    Próxima
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
