'use client';

// ============================================================
// 🆕 NOVA FUNCIONALIDADE — Detalhe Completo do Pedido
// Página: /orders/[id]
// 3 Abas: Itens do Pedido | Pagamento | Histórico (Timeline)
//
// Dados das tabelas:
//   - orders + order_items + products (aba Itens)
//   - payments (aba Pagamento)
//   - order_history (aba Histórico)
//
// Adicionado em: agosto/2026
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'react-toastify';
import {
  ArrowLeft, Package, CreditCard, Clock, CheckCircle, XCircle,
  Truck, ShoppingBag, Star, Calendar, User, FileText, Hash,
  TrendingUp, AlertCircle, Loader,
} from 'lucide-react';

// ── Helpers ──────────────────────────────────────────────────

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

function formatDateShort(dateStr) {
  if (!dateStr) return '-';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
  }).format(new Date(dateStr));
}

// Mapa de status de pedido
const ORDER_STATUS = {
  pending:    { label: 'Pendente',    color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/40', Icon: Clock },
  confirmed:  { label: 'Confirmado', color: 'text-blue-400',   bg: 'bg-blue-400/10',   border: 'border-blue-400/40',   Icon: CheckCircle },
  processing: { label: 'Processando',color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/40', Icon: Package },
  shipped:    { label: 'Enviado',    color: 'text-indigo-400', bg: 'bg-indigo-400/10', border: 'border-indigo-400/40', Icon: Truck },
  delivered:  { label: 'Entregue',   color: 'text-green-400',  bg: 'bg-green-400/10',  border: 'border-green-400/40',  Icon: CheckCircle },
  cancelled:  { label: 'Cancelado',  color: 'text-red-400',    bg: 'bg-red-400/10',    border: 'border-red-400/40',    Icon: XCircle },
};

// Mapa de status de pagamento
const PAYMENT_STATUS = {
  pending:   { label: 'Pendente',  color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  approved:  { label: 'Aprovado', color: 'text-green-400',  bg: 'bg-green-400/10'  },
  refused:   { label: 'Recusado', color: 'text-red-400',    bg: 'bg-red-400/10'    },
  refunded:  { label: 'Estornado',color: 'text-orange-400', bg: 'bg-orange-400/10' },
};

// Mapa de métodos de pagamento
const PAYMENT_METHOD_LABELS = {
  credit_card:  '💳 Cartão de Crédito',
  debit_card:   '💳 Cartão de Débito',
  pix:          '⚡ PIX',
  boleto:       '📄 Boleto',
  bank_transfer:'🏦 Transferência',
};

// Componente de Estrelas (read-only)
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

// ── Aba: Itens do Pedido ──────────────────────────────────────
function TabItems({ order }) {
  const items = order?.items || [];
  const subtotal = items.reduce((acc, i) => acc + parseFloat(i.subtotal || 0), 0);

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        <Package className="w-12 h-12 mx-auto mb-3 opacity-40" />
        <p>Nenhum item encontrado para este pedido.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            data-testid={`order-item-${item.id}`}
            className="flex items-center gap-4 bg-slate-700/50 rounded-xl p-4 border border-slate-600"
          >
            {/* Imagem */}
            <div className="w-16 h-16 rounded-lg bg-slate-600 flex-shrink-0 overflow-hidden">
              {item.products?.image_url ? (
                <img
                  src={item.products.image_url}
                  alt={item.products?.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-8 h-8 text-slate-400" />
                </div>
              )}
            </div>

            {/* Dados */}
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold truncate">
                {item.products?.name || 'Produto removido'}
              </p>
              <p className="text-slate-400 text-sm">SKU: {item.products?.sku || '-'}</p>
              {item.products?.rating > 0 && (
                <StarRating value={item.products.rating} />
              )}
            </div>

            {/* Valores */}
            <div className="text-right flex-shrink-0">
              <p className="text-slate-400 text-sm">
                {item.quantity}x {formatCurrency(item.unit_price)}
              </p>
              {item.discount > 0 && (
                <p className="text-green-400 text-xs">
                  -{formatCurrency(item.discount)} desc.
                </p>
              )}
              <p className="text-white font-bold text-lg">{formatCurrency(item.subtotal)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Totais */}
      <div className="mt-6 bg-slate-700/30 rounded-xl p-4 border border-slate-600 space-y-2">
        <div className="flex justify-between text-slate-300">
          <span>Subtotal</span>
          <span>{formatCurrency(order.subtotal ?? subtotal)}</span>
        </div>
        {order.discount_amount > 0 && (
          <div className="flex justify-between text-green-400">
            <span>Desconto</span>
            <span>-{formatCurrency(order.discount_amount)}</span>
          </div>
        )}
        <div className="flex justify-between text-slate-300">
          <span>Frete</span>
          <span>{formatCurrency(order.shipping_cost)}</span>
        </div>
        {order.tax_amount > 0 && (
          <div className="flex justify-between text-slate-300">
            <span>Impostos</span>
            <span>{formatCurrency(order.tax_amount)}</span>
          </div>
        )}
        <div className="flex justify-between text-white font-bold text-lg border-t border-slate-600 pt-2">
          <span>Total</span>
          <span className="text-amber-400">{formatCurrency(order.total_amount)}</span>
        </div>
      </div>
    </div>
  );
}

// ── Aba: Pagamento ────────────────────────────────────────────
function TabPayment({ payments, loadingPayments }) {
  if (loadingPayments) {
    return (
      <div className="text-center py-12">
        <Loader className="w-8 h-8 text-purple-400 animate-spin mx-auto" />
        <p className="text-slate-400 mt-3">Carregando pagamentos...</p>
      </div>
    );
  }

  if (!payments || payments.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-40" />
        <p>Nenhum pagamento registrado para este pedido.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {payments.map((payment) => {
        const ps = PAYMENT_STATUS[payment.payment_status] || PAYMENT_STATUS.pending;
        const methodLabel = PAYMENT_METHOD_LABELS[payment.payment_method] || payment.payment_method;
        return (
          <div
            key={payment.id}
            data-testid={`payment-card-${payment.id}`}
            className="bg-slate-700/50 rounded-xl p-5 border border-slate-600"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Método */}
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-purple-500/20 border border-purple-500/30">
                  <CreditCard className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-wider">Método</p>
                  <p className="text-white font-semibold">{methodLabel}</p>
                  {payment.card_last_digits && (
                    <p className="text-slate-400 text-sm">•••• {payment.card_last_digits}</p>
                  )}
                  {payment.installments > 1 && (
                    <p className="text-slate-400 text-sm">{payment.installments}x parcelas</p>
                  )}
                </div>
              </div>

              {/* Status */}
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${ps.bg} border border-slate-600`}>
                  <TrendingUp className={`w-5 h-5 ${ps.color}`} />
                </div>
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-wider">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${ps.bg} ${ps.color} mt-1`}>
                    {ps.label}
                  </span>
                </div>
              </div>

              {/* Valor */}
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-amber-500/20 border border-amber-500/30">
                  <Hash className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-wider">Valor</p>
                  <p className="text-white font-bold text-xl">{formatCurrency(payment.amount)}</p>
                </div>
              </div>

              {/* Data */}
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20 border border-blue-500/30">
                  <Calendar className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-wider">Data do Pagamento</p>
                  <p className="text-white font-semibold">{formatDate(payment.payment_date)}</p>
                </div>
              </div>

              {/* Transação */}
              {payment.transaction_id && (
                <div className="col-span-full flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-green-500/20 border border-green-500/30">
                    <FileText className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs uppercase tracking-wider">ID da Transação</p>
                    <p className="text-green-300 font-mono text-sm">{payment.transaction_id}</p>
                  </div>
                </div>
              )}

              {/* Notas */}
              {payment.notes && (
                <div className="col-span-full">
                  <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Observações</p>
                  <p className="text-slate-300 text-sm italic">{payment.notes}</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Aba: Histórico / Timeline ─────────────────────────────────
function TabHistory({ timeline, loadingHistory }) {
  if (loadingHistory) {
    return (
      <div className="text-center py-12">
        <Loader className="w-8 h-8 text-purple-400 animate-spin mx-auto" />
        <p className="text-slate-400 mt-3">Carregando histórico...</p>
      </div>
    );
  }

  if (!timeline || timeline.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        <Clock className="w-12 h-12 mx-auto mb-3 opacity-40" />
        <p>Nenhum histórico disponível para este pedido.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Linha vertical da timeline */}
      <div className="absolute left-[22px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 via-pink-500 to-transparent" />

      <div className="space-y-6 pl-12">
        {timeline.map((entry, idx) => {
          const sc = ORDER_STATUS[entry.status] || ORDER_STATUS.pending;
          const StIcon = sc.Icon;
          const isLast = idx === timeline.length - 1;
          return (
            <div key={entry.id} className="relative" data-testid={`history-entry-${entry.id}`}>
              {/* Ícone na linha */}
              <div className={`absolute -left-12 w-11 h-11 rounded-full flex items-center justify-center border-2 ${isLast ? 'border-amber-400 bg-amber-400/20' : 'border-slate-600 bg-slate-800'}`}>
                <StIcon className={`w-5 h-5 ${isLast ? 'text-amber-400' : sc.color}`} />
              </div>

              {/* Conteúdo */}
              <div className={`bg-slate-700/50 rounded-xl p-4 border ${isLast ? 'border-amber-400/40' : 'border-slate-600'}`}>
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${sc.bg} ${sc.color} border ${sc.border}`}>
                      {sc.label}
                    </span>
                    {entry.notes && (
                      <p className="text-slate-300 text-sm mt-2 italic">{entry.notes}</p>
                    )}
                    {entry.changed_by && (
                      <div className="flex items-center gap-1.5 mt-2">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        <p className="text-slate-400 text-xs">Por: {entry.changed_by}</p>
                      </div>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-slate-300 text-sm">{formatDateShort(entry.created_at)}</p>
                    <p className="text-slate-500 text-xs">{formatDate(entry.created_at).split(' ')[1]}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Página Principal ──────────────────────────────────────────
export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params?.id;

  const [order, setOrder] = useState(null);
  const [payments, setPayments] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [activeTab, setActiveTab] = useState('items'); // 'items' | 'payment' | 'history'

  // Carrega os dados do pedido + itens
  const fetchOrder = useCallback(async () => {
    if (!orderId) return;
    try {
      setLoadingOrder(true);
      const token = localStorage.getItem('token');
      if (!token) { router.push('/'); return; }
      const res = await fetch(`/api/v1/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      if (res.status === 401) { router.push('/'); return; }
      if (res.status === 404) { toast.error('Pedido não encontrado.'); router.push('/orders'); return; }
      const result = await res.json();
      setOrder(result.data);
    } catch {
      toast.error('Erro ao carregar pedido.');
    } finally {
      setLoadingOrder(false);
    }
  }, [orderId, router]);

  // Carrega pagamentos (lazy — só ao clicar na aba)
  const fetchPayments = useCallback(async () => {
    if (payments.length > 0) return; // já carregado
    try {
      setLoadingPayments(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/v1/orders/${orderId}/payments`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      const result = await res.json();
      setPayments(result.data || []);
    } catch {
      toast.error('Erro ao carregar pagamentos.');
    } finally {
      setLoadingPayments(false);
    }
  }, [orderId, payments.length]);

  // Carrega histórico (lazy — só ao clicar na aba)
  const fetchHistory = useCallback(async () => {
    if (timeline.length > 0) return; // já carregado
    try {
      setLoadingHistory(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/v1/orders/${orderId}/history`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      const result = await res.json();
      setTimeline(result.data?.timeline || []);
    } catch {
      toast.error('Erro ao carregar histórico.');
    } finally {
      setLoadingHistory(false);
    }
  }, [orderId, timeline.length]);

  useEffect(() => { fetchOrder(); }, [fetchOrder]);

  // Lazy load das abas
  function handleTabChange(tab) {
    setActiveTab(tab);
    if (tab === 'payment') fetchPayments();
    if (tab === 'history') fetchHistory();
  }

  const sc = ORDER_STATUS[order?.status] || ORDER_STATUS.pending;
  const StatusIcon = sc.Icon;

  const TABS = [
    { id: 'items',   label: 'Itens do Pedido', Icon: Package },
    { id: 'payment', label: 'Pagamento',        Icon: CreditCard },
    { id: 'history', label: 'Histórico',        Icon: Clock },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-orange-700 p-6">
      <div className="max-w-4xl mx-auto">

        {/* Voltar */}
        <button
          onClick={() => router.push('/orders')}
          data-testid="back-to-orders-button"
          className="flex items-center gap-2 text-pink-200 hover:text-white mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Meus Pedidos
        </button>

        {/* Loading inicial */}
        {loadingOrder && (
          <div className="text-center py-20">
            <div className="inline-block w-10 h-10 border-4 border-pink-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-pink-200 mt-4">Carregando pedido...</p>
          </div>
        )}

        {!loadingOrder && order && (
          <>
            {/* Header do pedido */}
            <div className="bg-slate-800/90 backdrop-blur-md rounded-2xl border border-slate-700 p-6 mb-6 shadow-2xl">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-xl ${sc.bg} border ${sc.border}`}>
                    <StatusIcon className={`w-8 h-8 ${sc.color}`} />
                  </div>
                  <div>
                    <h1 className="text-white font-extrabold text-2xl" data-testid="order-number-heading">
                      {order.order_number}
                    </h1>
                    <p className="text-slate-400 text-sm mt-0.5">
                      Realizado em {formatDate(order.created_at)}
                    </p>
                    {order.shippers?.company_name && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <Truck className="w-4 h-4 text-slate-400" />
                        <p className="text-slate-300 text-sm">{order.shippers.company_name}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${sc.bg} ${sc.color} border ${sc.border} mb-2`}>
                    {sc.label}
                  </span>
                  <p className="text-slate-400 text-sm">Total do Pedido</p>
                  <p className="text-white font-extrabold text-3xl text-amber-400">
                    {formatCurrency(order.total_amount)}
                  </p>
                </div>
              </div>

              {/* Notas */}
              {order.notes && (
                <div className="mt-4 p-3 bg-slate-700/50 rounded-lg border border-slate-600 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <p className="text-slate-300 text-sm italic">{order.notes}</p>
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="bg-slate-800/90 backdrop-blur-md rounded-2xl border border-slate-700 shadow-2xl overflow-hidden">
              {/* Tab Headers */}
              <div className="flex border-b border-slate-700" data-testid="order-tabs">
                {TABS.map((tab) => {
                  const TabIcon = tab.Icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      data-testid={`tab-${tab.id}`}
                      className={`flex-1 flex items-center justify-center gap-2 py-4 px-3 text-sm font-semibold transition-all duration-200 ${
                        isActive
                          ? 'text-white border-b-2 border-purple-500 bg-purple-500/10'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/40'
                      }`}
                    >
                      <TabIcon className={`w-4 h-4 ${isActive ? 'text-purple-400' : ''}`} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Tab Content */}
              <div className="p-6" data-testid="tab-content">
                {activeTab === 'items'   && <TabItems   order={order} />}
                {activeTab === 'payment' && <TabPayment payments={payments} loadingPayments={loadingPayments} />}
                {activeTab === 'history' && <TabHistory timeline={timeline} loadingHistory={loadingHistory} />}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
