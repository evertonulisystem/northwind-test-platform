"use client";

// ============================================================
// 🆕 NOVA FUNCIONALIDADE — Meus Pedidos
// Página: /orders
// Exibe a lista de pedidos do usuário autenticado com link
// para o detalhe completo (Itens | Pagamento | Histórico).
// Adicionado em: agosto/2026
// ============================================================

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import {
  ShoppingBag,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Package,
  Eye,
  ArrowLeft,
  ChevronRight,
  BarChart2,
} from "lucide-react";

// Mapa de status para cor e ícone
const STATUS_CONFIG = {
  pending: {
    label: "Pendente",
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
    border: "border-yellow-400/30",
    Icon: Clock,
  },
  confirmed: {
    label: "Confirmado",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-400/30",
    Icon: CheckCircle,
  },
  processing: {
    label: "Processando",
    color: "text-purple-400",
    bg: "bg-purple-400/10",
    border: "border-purple-400/30",
    Icon: Package,
  },
  shipped: {
    label: "Enviado",
    color: "text-indigo-400",
    bg: "bg-indigo-400/10",
    border: "border-indigo-400/30",
    Icon: Truck,
  },
  delivered: {
    label: "Entregue",
    color: "text-green-400",
    bg: "bg-green-400/10",
    border: "border-green-400/30",
    Icon: CheckCircle,
  },
  cancelled: {
    label: "Cancelado",
    color: "text-red-400",
    bg: "bg-red-400/10",
    border: "border-red-400/30",
    Icon: XCircle,
  },
};

function getStatusConfig(status) {
  return STATUS_CONFIG[status] || STATUS_CONFIG.pending;
}

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
}

function formatDate(dateStr) {
  if (!dateStr) return "-";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr));
}

const ITEMS_PER_PAGE = 10;

function getTodayDateString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function validateDateFilters(dataInicio, dataFim) {
  const hasStartDate = Boolean(dataInicio);
  const hasEndDate = Boolean(dataFim);
  const today = getTodayDateString();

  if (hasStartDate !== hasEndDate) {
    return "Preencha as duas datas para filtrar por período.";
  }

  if (!hasStartDate && !hasEndDate) {
    return "";
  }

  if (dataInicio > today || dataFim > today) {
    return "A data não pode ser maior que hoje.";
  }

  if (dataFim < dataInicio) {
    return "A data final não pode ser anterior à data inicial.";
  }

  return "";
}

function OrdersPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: ITEMS_PER_PAGE,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [dateError, setDateError] = useState("");
  const [shippers, setShippers] = useState([]);
  const [customerFilter, setCustomerFilter] = useState("");
  const [minTotal, setMinTotal] = useState("");
  const [maxTotal, setMaxTotal] = useState("");
  const [selectedShipper, setSelectedShipper] = useState("");

  useEffect(() => {
    const nextStatus = searchParams.get("status") || "";
    const nextDataInicio = searchParams.get("from") || "";
    const nextDataFim = searchParams.get("to") || "";
    const nextShipper = searchParams.get("shipper") || "";
    const nextMin = searchParams.get("min_total") || "";
    const nextMax = searchParams.get("max_total") || "";
    const rawPage = parseInt(searchParams.get("page") || "1", 10);
    const nextPage = Number.isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;

    setStatus(nextStatus);
    setDataInicio(nextDataInicio);
    setDataFim(nextDataFim);
    setMinTotal(nextMin);
    setMaxTotal(nextMax);
    setCustomerFilter(searchParams.get("customer") || "");
    setSelectedShipper(nextShipper);
    setDateError("");

    fetchOrders({
      status: nextStatus,
      dataInicio: nextDataInicio,
      dataFim: nextDataFim,
      page: nextPage,
      shipper: nextShipper,
      min_total: nextMin,
      max_total: nextMax,
    });
  }, [searchParams]);

  useEffect(() => {
    const fetchShippers = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;
        const res = await fetch("/api/v1/shippers", {
          headers,
          cache: "no-store",
        });
        if (!res.ok) return;
        const result = await res.json();
        setShippers(result.data || []);
      } catch (e) {
        // ignore
      }
    };

    fetchShippers();
  }, []);

  async function fetchOrders(filters) {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Você precisa estar logado.");
        router.push("/");
        return;
      }

      const nextStatus = filters?.status || "";
      const nextDataInicio = filters?.dataInicio || "";
      const nextDataFim = filters?.dataFim || "";
      const nextShipper = filters?.shipper || "";
      const nextMinTotal = filters?.min_total || "";
      const nextMaxTotal = filters?.max_total || "";
      const nextPage = filters?.page || 1;
      const requestParams = new URLSearchParams();

      if (nextStatus) requestParams.set("status", nextStatus);
      if (nextDataInicio) requestParams.set("from", nextDataInicio);
      if (nextDataFim) requestParams.set("to", nextDataFim);
      if (nextShipper) requestParams.set("shipper", String(nextShipper));
      if (nextMinTotal) requestParams.set("min_total", String(nextMinTotal));
      if (nextMaxTotal) requestParams.set("max_total", String(nextMaxTotal));
      requestParams.set("page", String(nextPage));
      requestParams.set("limit", String(ITEMS_PER_PAGE));

      const queryString = requestParams.toString();
      const url = queryString
        ? `/api/v1/orders?${queryString}`
        : "/api/v1/orders";

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (res.status === 401) {
        router.push("/");
        return;
      }
      const result = await res.json();
      if (!res.ok) {
        const message = result?.mensagens?.[0] || "Erro ao carregar pedidos.";
        setOrders([]);
        setPagination({
          page: nextPage,
          limit: ITEMS_PER_PAGE,
          total: 0,
          totalPages: 0,
        });
        setDateError(res.status === 400 ? message : "");
        toast.error(message);
        return;
      }

      // Aplicar filtro de cliente no frontend (por nome/email) se informado
      let fetched = result.data || [];
      if (customerFilter) {
        const q = customerFilter.toLowerCase();
        fetched = fetched.filter((o) => {
          const name = o.users?.full_name || "";
          const email = o.users?.email || "";
          return (
            name.toLowerCase().includes(q) || email.toLowerCase().includes(q)
          );
        });
      }

      setOrders(fetched);
      setPagination(
        result.pagination || {
          page: nextPage,
          limit: ITEMS_PER_PAGE,
          total: 0,
          totalPages: 0,
        },
      );
    } catch {
      setOrders([]);
      setPagination({
        page: 1,
        limit: ITEMS_PER_PAGE,
        total: 0,
        totalPages: 0,
      });
      toast.error("Erro ao carregar pedidos.");
    } finally {
      setLoading(false);
    }
  }

  function updateOrdersUrl(nextFilters = {}) {
    const nextStatus = nextFilters.status ?? status;
    const nextDataInicio = nextFilters.dataInicio ?? dataInicio;
    const nextDataFim = nextFilters.dataFim ?? dataFim;
    const nextPage = nextFilters.page ?? pagination.page;
    const nextShipper = nextFilters.shipper ?? selectedShipper;
    const nextMin = nextFilters.min_total ?? minTotal;
    const nextMax = nextFilters.max_total ?? maxTotal;
    const nextCustomer = nextFilters.customer ?? customerFilter;
    const params = new URLSearchParams();

    if (nextStatus) params.set("status", nextStatus);
    if (nextDataInicio) params.set("from", nextDataInicio);
    if (nextDataFim) params.set("to", nextDataFim);
    if (nextPage > 1) params.set("page", String(nextPage));
    if (nextShipper) params.set("shipper", String(nextShipper));
    if (nextMin) params.set("min_total", String(nextMin));
    if (nextMax) params.set("max_total", String(nextMax));
    if (nextCustomer) params.set("customer", String(nextCustomer));

    const query = params.toString();
    router.replace(query ? `/orders?${query}` : "/orders");
  }

  function handleApplyFilters() {
    const validationMessage = validateDateFilters(dataInicio, dataFim);

    if (validationMessage) {
      setDateError(validationMessage);
      toast.error(validationMessage);
      return;
    }

    setDateError("");
    updateOrdersUrl({ page: 1 });
  }

  function handleClearFilters() {
    setStatus("");
    setDataInicio("");
    setDataFim("");
    setDateError("");
    setSelectedShipper("");
    setMinTotal("");
    setMaxTotal("");
    setCustomerFilter("");
    updateOrdersUrl({
      status: "",
      dataInicio: "",
      dataFim: "",
      page: 1,
      shipper: "",
      min_total: "",
      max_total: "",
      customer: "",
    });
  }

  function handlePageChange(newPage) {
    if (newPage < 1 || newPage > (pagination.totalPages || 1)) {
      return;
    }

    updateOrdersUrl({ page: newPage });
  }

  const showCustomerColumn = orders.some((order) =>
    Boolean(order?.users?.full_name || order?.users?.email),
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-orange-700 px-4 py-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/products")}
            data-testid="back-to-products-button"
            className="flex items-center gap-2 text-pink-200 hover:text-white mb-4 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar aos Produtos
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-extrabold text-white flex items-center gap-3">
                <ShoppingBag className="w-10 h-10 text-amber-400" />
                Meus Pedidos
              </h1>
              <p className="text-pink-200 mt-1">
                Acompanhe seus pedidos e histórico de compras
              </p>
            </div>

            {/* 🆕 Botão Relatório de Vendas */}
            <button
              onClick={() => router.push("/reports")}
              data-testid="go-to-reports-button"
              className="relative bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-5 py-3 rounded-xl font-semibold shadow-lg flex items-center gap-2 transition"
            >
              <BarChart2 className="w-5 h-5" />
              Relatório de Vendas
              <span className="badge-novo absolute -top-2 -right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-purple-900 leading-tight">
                Novo
              </span>
            </button>
          </div>
        </div>

        <div className="mb-6 bg-slate-900/50 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-xl">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[220px]">
              <label className="block text-sm font-medium text-pink-200 mb-2">
                Status
              </label>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="w-full bg-slate-800/80 border border-purple-400/30 text-white rounded-xl px-4 py-3 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-500/20"
              >
                <option value="">Todos</option>
                {Object.entries(STATUS_CONFIG).map(([statusKey, config]) => (
                  <option key={statusKey} value={statusKey}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="min-w-[200px]">
              <label className="block text-sm font-medium text-pink-200 mb-2">
                Data inicial
              </label>
              <input
                type="date"
                max={getTodayDateString()}
                value={dataInicio}
                onChange={(event) => {
                  setDataInicio(event.target.value);
                  setDateError("");
                }}
                className="w-full bg-slate-800/80 border border-purple-400/30 text-white rounded-xl px-4 py-3 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-500/20"
              />
            </div>

            <div className="min-w-[200px]">
              <label className="block text-sm font-medium text-pink-200 mb-2">
                Data final
              </label>
              <input
                type="date"
                max={getTodayDateString()}
                value={dataFim}
                onChange={(event) => {
                  setDataFim(event.target.value);
                  setDateError("");
                }}
                className="w-full bg-slate-800/80 border border-purple-400/30 text-white rounded-xl px-4 py-3 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-500/20"
              />
            </div>

            <div className="min-w-[220px]">
              <label className="block text-sm font-medium text-pink-200 mb-2">
                Transportadora
              </label>
              <select
                value={selectedShipper}
                onChange={(e) => setSelectedShipper(e.target.value)}
                className="w-full bg-slate-800/80 border border-purple-400/30 text-white rounded-xl px-4 py-3 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-500/20"
                data-testid="shipper-filter-select"
              >
                <option value="">Todas</option>
                {shippers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.company_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="min-w-[220px]">
              <label className="block text-sm font-medium text-pink-200 mb-2">
                Cliente
              </label>
              <input
                value={customerFilter}
                onChange={(e) => setCustomerFilter(e.target.value)}
                placeholder="Nome ou email"
                className="w-full bg-slate-800/80 border border-purple-400/30 text-white rounded-xl px-4 py-3 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-500/20"
                data-testid="customer-filter-input"
              />
            </div>

            <div className="min-w-[160px]">
              <label className="block text-sm font-medium text-pink-200 mb-2">
                Valor min
              </label>
              <input
                type="number"
                value={minTotal}
                onChange={(e) => setMinTotal(e.target.value)}
                className="w-full bg-slate-800/80 border border-purple-400/30 text-white rounded-xl px-4 py-3 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-500/20"
                data-testid="min-total-input"
              />
            </div>

            <div className="min-w-[160px]">
              <label className="block text-sm font-medium text-pink-200 mb-2">
                Valor max
              </label>
              <input
                type="number"
                value={maxTotal}
                onChange={(e) => setMaxTotal(e.target.value)}
                className="w-full bg-slate-800/80 border border-purple-400/30 text-white rounded-xl px-4 py-3 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-500/20"
                data-testid="max-total-input"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                // Push selected filters into URL and reload
                updateOrdersUrl({
                  page: 1,
                  status,
                  dataInicio,
                  dataFim,
                  shipper: selectedShipper,
                  min_total: minTotal,
                  max_total: maxTotal,
                });
              }}
              className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:from-purple-700 hover:via-pink-700 hover:to-orange-600 text-white px-5 py-3 rounded-xl font-semibold shadow-lg transition"
            >
              Aplicar filtros
            </button>

            <button
              type="button"
              onClick={handleClearFilters}
              className="bg-slate-800/90 hover:bg-slate-700 text-pink-100 border border-pink-300/15 px-5 py-3 rounded-xl font-semibold transition"
            >
              Limpar filtros
            </button>
          </div>

          {dateError && (
            <p className="mt-3 text-sm text-rose-300 font-medium">
              {dateError}
            </p>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block w-10 h-10 border-4 border-pink-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-pink-200 mt-4">Carregando pedidos...</p>
          </div>
        )}

        {!loading && (
          <div className="mb-4">
            <p className="text-pink-100 font-medium">
              {pagination.total}{" "}
              {pagination.total === 1
                ? "pedido encontrado"
                : "pedidos encontrados"}
            </p>
          </div>
        )}

        {/* Empty */}
        {!loading && orders.length === 0 && (
          <div className="text-center py-20 bg-slate-800/60 rounded-2xl border border-slate-700">
            <ShoppingBag className="w-16 h-16 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-300 text-xl font-semibold">
              Nenhum pedido encontrado
            </p>
            <p className="text-slate-400 mt-2">
              Seus pedidos aparecem aqui após o checkout.
            </p>
            <button
              onClick={() => router.push("/products")}
              className="mt-6 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition"
            >
              Ver Produtos
            </button>
          </div>
        )}

        {/* Lista de pedidos */}
        {!loading && orders.length > 0 && (
          <div className="relative bg-slate-800/90 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left" data-testid="orders-list">
                <thead className="bg-slate-700/50 border-b border-slate-600">
                  <tr>
                    <th className="px-4 py-3 text-slate-200 font-semibold text-sm">
                      Pedido
                    </th>
                    <th className="px-4 py-3 text-slate-200 font-semibold text-sm">
                      Data
                    </th>
                    <th className="px-4 py-3 text-slate-200 font-semibold text-sm">
                      Transportadora
                    </th>
                    {showCustomerColumn && (
                      <th className="px-4 py-3 text-slate-200 font-semibold text-sm">
                        Cliente
                      </th>
                    )}
                    <th className="px-4 py-3 text-slate-200 font-semibold text-sm">
                      Status
                    </th>
                    <th className="px-4 py-3 text-slate-200 font-semibold text-sm">
                      Total
                    </th>
                    <th className="px-4 py-3 text-slate-200 font-semibold text-sm text-center">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const sc = getStatusConfig(order.status);
                    const StatusIcon = sc.Icon;

                    return (
                      <tr
                        key={order.id}
                        data-testid={`order-card-${order.id}`}
                        className="border-b border-slate-700 hover:bg-slate-700/30 transition"
                      >
                        <td
                          className="px-4 py-3 text-white font-bold text-sm"
                          data-testid={`order-number-${order.id}`}
                        >
                          {order.order_number}
                        </td>
                        <td className="px-4 py-3 text-slate-300 text-sm">
                          {formatDate(order.created_at)}
                        </td>
                        <td className="px-4 py-3 text-slate-300 text-sm">
                          {order.shippers?.company_name || "-"}
                        </td>
                        {showCustomerColumn && (
                          <td
                            className="px-4 py-3 text-slate-300 text-sm"
                            data-testid={`order-customer-${order.id}`}
                          >
                            {order.users?.full_name ||
                              order.users?.email ||
                              "-"}
                          </td>
                        )}
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${sc.bg} ${sc.color} border ${sc.border}`}
                          >
                            <StatusIcon className="w-4 h-4" />
                            {sc.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-white font-semibold text-sm">
                          {formatCurrency(order.total_amount)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => router.push(`/orders/${order.id}`)}
                            data-testid={`order-detail-button-${order.id}`}
                            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow"
                          >
                            <Eye className="w-4 h-4" />
                            Ver Detalhes
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="bg-slate-900/50 px-6 py-4 border-t border-slate-700 flex flex-wrap items-center justify-between gap-4">
              <p className="text-slate-400 text-sm">
                Mostrando {(pagination.page - 1) * pagination.limit + 1}-
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                de {pagination.total} pedidos
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  data-testid="prev-page-button"
                  className="px-4 py-2 bg-slate-700 text-white rounded-lg disabled:opacity-50 hover:bg-slate-600 transition"
                >
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
                  className="px-4 py-2 bg-slate-700 text-white rounded-lg disabled:opacity-50 hover:bg-slate-600 transition"
                >
                  Próxima
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function OrdersPageFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-orange-700 px-4 py-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-20">
          <div className="inline-block w-10 h-10 border-4 border-pink-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-pink-200 mt-4">Carregando pedidos...</p>
        </div>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<OrdersPageFallback />}>
      <OrdersPageContent />
    </Suspense>
  );
}
