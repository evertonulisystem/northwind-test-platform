'use client';

// ============================================================
// 🆕 NOVA FUNCIONALIDADE — Meus Pedidos
// Página: /orders
// Exibe a lista de pedidos do usuário autenticado com link
// para o detalhe completo (Itens | Pagamento | Histórico).
// Adicionado em: agosto/2026
// ============================================================

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import {
  ShoppingBag, Clock, CheckCircle, XCircle, Truck,
  Package, Eye, ArrowLeft, ChevronRight, BarChart2,
} from 'lucide-react';

// Mapa de status para cor e ícone
const STATUS_CONFIG = {
  pending:    { label: 'Pendente',    color: 'text-yellow-400',  bg: 'bg-yellow-400/10',  border: 'border-yellow-400/30', Icon: Clock },
  confirmed:  { label: 'Confirmado', color: 'text-blue-400',    bg: 'bg-blue-400/10',    border: 'border-blue-400/30',   Icon: CheckCircle },
  processing: { label: 'Processando',color: 'text-purple-400',  bg: 'bg-purple-400/10',  border: 'border-purple-400/30', Icon: Package },
  shipped:    { label: 'Enviado',    color: 'text-indigo-400',  bg: 'bg-indigo-400/10',  border: 'border-indigo-400/30', Icon: Truck },
  delivered:  { label: 'Entregue',   color: 'text-green-400',   bg: 'bg-green-400/10',   border: 'border-green-400/30',  Icon: CheckCircle },
  cancelled:  { label: 'Cancelado',  color: 'text-red-400',     bg: 'bg-red-400/10',     border: 'border-red-400/30',    Icon: XCircle },
};

function getStatusConfig(status) {
  return STATUS_CONFIG[status] || STATUS_CONFIG.pending;
}

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(dateStr));
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Você precisa estar logado.');
        router.push('/');
        return;
      }
      const res = await fetch('/api/v1/orders', {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      if (res.status === 401) { router.push('/'); return; }
      const result = await res.json();
      setOrders(result.data || []);
    } catch {
      toast.error('Erro ao carregar pedidos.');
    } finally {
      setLoading(false);
    }
  }

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

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-extrabold text-white flex items-center gap-3">
                <ShoppingBag className="w-10 h-10 text-amber-400" />
                Meus Pedidos
              </h1>
              <p className="text-pink-200 mt-1">Acompanhe seus pedidos e histórico de compras</p>
            </div>

            {/* 🆕 Botão Relatório de Vendas */}
            <button
              onClick={() => router.push('/reports')}
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

        {/* Loading */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block w-10 h-10 border-4 border-pink-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-pink-200 mt-4">Carregando pedidos...</p>
          </div>
        )}

        {/* Empty */}
        {!loading && orders.length === 0 && (
          <div className="text-center py-20 bg-slate-800/60 rounded-2xl border border-slate-700">
            <ShoppingBag className="w-16 h-16 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-300 text-xl font-semibold">Nenhum pedido encontrado</p>
            <p className="text-slate-400 mt-2">Seus pedidos aparecem aqui após o checkout.</p>
            <button
              onClick={() => router.push('/products')}
              className="mt-6 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition"
            >
              Ver Produtos
            </button>
          </div>
        )}

        {/* Lista de pedidos */}
        {!loading && orders.length > 0 && (
          <div className="space-y-4" data-testid="orders-list">
            {orders.map((order) => {
              const sc = getStatusConfig(order.status);
              const StatusIcon = sc.Icon;
              return (
                <div
                  key={order.id}
                  data-testid={`order-card-${order.id}`}
                  className="bg-slate-800/90 backdrop-blur-md rounded-2xl border border-slate-700 p-6 hover:border-purple-500/50 transition-all duration-200 shadow-xl hover:shadow-purple-900/30"
                >
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    {/* Info do pedido */}
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl ${sc.bg} border ${sc.border}`}>
                        <StatusIcon className={`w-6 h-6 ${sc.color}`} />
                      </div>
                      <div>
                        <p className="text-white font-bold text-lg" data-testid={`order-number-${order.id}`}>
                          {order.order_number}
                        </p>
                        <p className="text-slate-400 text-sm mt-0.5">
                          {formatDate(order.created_at)}
                        </p>
                        <p className="text-slate-400 text-sm">
                          Transportadora: {order.shippers?.company_name || '-'}
                        </p>
                      </div>
                    </div>

                    {/* Status + valor + botão */}
                    <div className="flex items-center gap-6 flex-wrap">
                      <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${sc.bg} ${sc.color} border ${sc.border}`}>
                        {sc.label}
                      </span>
                      <div className="text-right">
                        <p className="text-slate-400 text-xs">Total</p>
                        <p className="text-white font-bold text-xl">
                          {formatCurrency(order.total_amount)}
                        </p>
                      </div>
                      <button
                        onClick={() => router.push(`/orders/${order.id}`)}
                        data-testid={`order-detail-button-${order.id}`}
                        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl font-semibold transition shadow"
                      >
                        <Eye className="w-4 h-4" />
                        Ver Detalhes
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
