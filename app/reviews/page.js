// ============================================================
// 🆕 NOVA FUNCIONALIDADE — Avaliações de Produtos
// Módulo: Reviews | Cenário: Página principal de avaliações
// Adicionado em: julho/2026
// ============================================================

// app/reviews/page.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import {
  Star,
  AlertTriangle,
  ArrowLeft,
  MessageSquare,
  Package,
  TrendingUp,
  CheckCircle,
  XCircle,
  Loader2,
} from 'lucide-react';

// ── Helpers ─────────────────────────────────────────────────────

/**
 * Formata data ISO para pt-BR de forma legível.
 * Ex: "12 de jul. de 2026"
 */
function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Renderiza estrelas (visuais, não clicáveis) para exibição de rating.
 * @param {number} rating — nota de 1 a 5
 */
function StarDisplay({ rating = 0 }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} de 5 estrelas`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 transition-colors ${
            star <= rating
              ? 'text-amber-400 fill-amber-400'
              : 'text-slate-600 fill-slate-600'
          }`}
        />
      ))}
    </div>
  );
}

// ── Labels das estrelas ──────────────────────────────────────────
// Fornece feedback textual ao usuário durante a seleção de nota
const STAR_LABELS = {
  1: 'Ruim',
  2: 'Regular',
  3: 'Bom',
  4: 'Muito Bom',
  5: 'Excelente',
};

// ── Componente: Sistema de estrelas clicáveis ────────────────────
/**
 * StarRating: permite ao usuário clicar e fazer hover nas estrelas.
 *
 * Props:
 *   value: nota selecionada (0 = nenhuma)
 *   onChange: callback com a nova nota
 *   error: mensagem de erro quando nenhuma nota foi selecionada
 */
function StarRating({ value, onChange, error }) {
  // hovered: estrela sob o cursor (0 = nenhuma)
  const [hovered, setHovered] = useState(0);

  // A estrela "acesa" considera hover com prioridade sobre seleção
  const activeRating = hovered || value;

  return (
    <div>
      <div
        className="flex gap-2 mb-1"
        onMouseLeave={() => setHovered(0)}
        role="group"
        aria-label="Selecione uma nota de 1 a 5 estrelas"
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            id={`star-${star}`}
            data-testid={`star-${star}`}
            aria-label={`${star} estrela${star > 1 ? 's' : ''} — ${STAR_LABELS[star]}`}
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
          >
            <Star
              className={`w-9 h-9 transition-colors duration-150 ${
                star <= activeRating
                  ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]'
                  : 'text-slate-500 fill-slate-700 hover:text-amber-300'
              }`}
            />
          </button>
        ))}

        {/* Label textual ao lado das estrelas */}
        {activeRating > 0 && (
          <span className="ml-2 self-center text-amber-300 font-semibold text-sm animate-pulse">
            {STAR_LABELS[activeRating]}
          </span>
        )}
      </div>

      {/* Erro inline quando nenhuma estrela foi selecionada */}
      {error && (
        <p className="text-red-400 text-xs mt-1 flex items-center gap-1" role="alert">
          <XCircle className="w-3.5 h-3.5" />
          {error}
        </p>
      )}
    </div>
  );
}

// ── Componente: Modal de Avaliação ───────────────────────────────
/**
 * ReviewModal: exibido ao clicar em "Avaliar Agora →".
 *
 * Props:
 *   product: { id, name } — produto a ser avaliado
 *   onClose: fecha o modal sem salvar
 *   onSuccess: chamado após envio bem-sucedido
 */
function ReviewModal({ product, onClose, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  // Erros inline por campo
  const [errors, setErrors] = useState({});

  // ── Validação front-end antes de enviar ──────────────────────
  // Garante que rating e comment cumprem os requisitos mínimos
  function validate() {
    const newErrors = {};

    if (!rating || rating < 1 || rating > 5) {
      newErrors.rating = 'Selecione uma nota de 1 a 5 estrelas.';
    }

    if (!comment || comment.trim().length < 10) {
      newErrors.comment = 'O comentário deve ter ao menos 10 caracteres.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // ── Submissão ────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();

    // Bloqueia submissão se houver erros de validação
    if (!validate()) return;

    setLoading(true);

    try {
      const token = localStorage.getItem('token');

      // Tratar 401: redirecionar para login se não autenticado
      if (!token) {
        toast.error('Você precisa estar logado para avaliar.');
        window.location.href = '/';
        return;
      }

      const res = await fetch('/api/v1/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_id: product.id,
          rating,
          title: title.trim() || undefined,
          comment: comment.trim(),
        }),
      });

      const data = await res.json();

      if (res.status === 401) {
        // Token expirado ou inválido → redirecionar para login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.error('Sessão expirada. Faça login novamente.');
        window.location.href = '/';
        return;
      }

      if (!res.ok) {
        toast.error(data.mensagens?.[0] || 'Erro ao enviar avaliação.');
        return;
      }

      // Sucesso!
      toast.success('✅ Avaliação enviada com sucesso!');
      onSuccess();

    } catch (err) {
      console.error('Erro ao enviar avaliação:', err);
      toast.error('Erro de conexão ao enviar avaliação.');
    } finally {
      setLoading(false);
    }
  }

  // Fechar modal ao clicar fora do painel
  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={handleBackdropClick}
      data-testid="review-modal-backdrop"
    >
      <div
        className="bg-slate-800 border border-slate-600 rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-[fadeInUp_0.2s_ease-out]"
        role="dialog"
        aria-labelledby="modal-title"
        data-testid="review-modal"
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">
              Avaliar produto
            </p>
            <h2
              id="modal-title"
              className="text-xl font-bold text-white leading-tight"
              data-testid="modal-product-name"
            >
              {product.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            id="modal-close-button"
            data-testid="modal-close-button"
            className="text-slate-400 hover:text-white transition rounded-lg p-1.5 hover:bg-slate-700"
            aria-label="Fechar modal"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>

          {/* ── Campo: Nota (estrelas clicáveis) ── */}
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Nota <span className="text-red-400">*</span>
            </label>
            <StarRating
              value={rating}
              onChange={(v) => {
                setRating(v);
                // Limpa erro ao selecionar uma nota
                if (errors.rating) setErrors((prev) => ({ ...prev, rating: null }));
              }}
              error={errors.rating}
            />
          </div>

          {/* ── Campo: Título ── */}
          <div>
            <label
              htmlFor="review-title"
              className="block text-slate-300 text-sm font-medium mb-1.5"
            >
              Título da avaliação{' '}
              <span className="text-slate-500 font-normal">(opcional)</span>
            </label>
            <input
              id="review-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Produto excelente, superou minhas expectativas!"
              maxLength={120}
              data-testid="review-title-input"
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm transition"
            />
          </div>

          {/* ── Campo: Comentário ── */}
          <div>
            <label
              htmlFor="review-comment"
              className="block text-slate-300 text-sm font-medium mb-1.5"
            >
              Comentário <span className="text-red-400">*</span>
            </label>
            <textarea
              id="review-comment"
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);
                if (errors.comment && e.target.value.trim().length >= 10) {
                  setErrors((prev) => ({ ...prev, comment: null }));
                }
              }}
              placeholder="Conte sua experiência com este produto... (mínimo 10 caracteres)"
              rows={4}
              maxLength={1000}
              data-testid="review-comment-input"
              className={`w-full px-4 py-2.5 bg-slate-700 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition resize-none text-sm ${
                errors.comment
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-slate-600 focus:ring-purple-500'
              }`}
            />
            {/* Contador de caracteres */}
            <div className="flex justify-between mt-1">
              {errors.comment ? (
                <p className="text-red-400 text-xs flex items-center gap-1" role="alert" data-testid="comment-error">
                  <XCircle className="w-3.5 h-3.5" />
                  {errors.comment}
                </p>
              ) : (
                <span />
              )}
              <span
                className={`text-xs ml-auto ${
                  comment.length < 10 ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                {comment.length}/1000
              </span>
            </div>
          </div>

          {/* ── Botões de ação ── */}
          <div className="flex gap-3 pt-2">
            {/* Cancelar */}
            <button
              type="button"
              onClick={onClose}
              id="modal-cancel-button"
              data-testid="modal-cancel-button"
              className="flex-1 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg font-medium text-sm transition"
            >
              Cancelar
            </button>

            {/* Enviar — com loading state */}
            <button
              type="submit"
              id="modal-submit-button"
              data-testid="modal-submit-button"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-purple-900/40"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Star className="w-4 h-4" />
                  Enviar Avaliação
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Componente Principal: Página de Avaliações ───────────────────
export default function ReviewsPage() {
  const router = useRouter();

  // ── Estado: produtos sem avaliação ──────────────────────────
  const [productsWithoutReviews, setProductsWithoutReviews] = useState([]);
  const [loadingWithout, setLoadingWithout] = useState(true);

  // ── Estado: avaliações aprovadas ─────────────────────────────
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  // ── Estado: modal de avaliação ───────────────────────────────
  const [modalProduct, setModalProduct] = useState(null); // produto selecionado

  // ── Helper: headers autenticados ────────────────────────────
  function getAuthHeaders() {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Você precisa estar logado.');
      router.push('/');
      return null;
    }
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }

  // ── Busca: produtos sem avaliação ────────────────────────────
  const fetchProductsWithoutReviews = useCallback(async () => {
    setLoadingWithout(true);
    try {
      const headers = getAuthHeaders();
      if (!headers) return;

      const res = await fetch('/api/v1/reviews/without-reviews', {
        headers,
        cache: 'no-store',
      });

      if (res.status === 401) {
        localStorage.removeItem('token');
        router.push('/');
        return;
      }

      const data = await res.json();
      setProductsWithoutReviews(data.data || []);
    } catch (err) {
      console.error('Erro ao buscar produtos sem avaliação:', err);
      toast.error('Erro ao carregar produtos sem avaliação.');
    } finally {
      setLoadingWithout(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Busca: todas as avaliações aprovadas ─────────────────────
  const fetchReviews = useCallback(async () => {
    setLoadingReviews(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch('/api/v1/reviews', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      });

      if (res.status === 401) {
        localStorage.removeItem('token');
        router.push('/');
        return;
      }

      const data = await res.json();
      setReviews(data.data || []);
    } catch (err) {
      console.error('Erro ao buscar avaliações:', err);
      toast.error('Erro ao carregar avaliações.');
    } finally {
      setLoadingReviews(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Carrega ambas as listas ao montar a página
  useEffect(() => {
    fetchProductsWithoutReviews();
    fetchReviews();
  }, [fetchProductsWithoutReviews, fetchReviews]);

  // ── Handler: após envio da avaliação com sucesso ─────────────
  // Fecha o modal e recarrega ambas as listas para refletir o estado atual
  function handleReviewSuccess() {
    setModalProduct(null);
    fetchProductsWithoutReviews();
    fetchReviews();
  }

  return (
    <>
      {/* ════════════════════════════════════════════════════════
          LAYOUT PRINCIPAL — gradiente igual ao restante do projeto
          ════════════════════════════════════════════════════════ */}
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-orange-700 p-6">
        <div className="max-w-7xl mx-auto">

          {/* ── Header ── */}
          <div className="mb-8">
            <button
              onClick={() => router.push('/products')}
              id="back-to-products-button"
              data-testid="back-to-products-button"
              className="flex items-center gap-2 text-pink-200 hover:text-white transition mb-6 group"
            >
              <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
              Voltar para Produtos
            </button>

            <div className="text-center">
              {/* Badge "Nova Funcionalidade" */}
              <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-500/40 text-green-300 px-4 py-1.5 rounded-full text-xs font-semibold mb-3 uppercase tracking-widest">
                <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                🆕 Nova Funcionalidade
              </div>

              <h1
                className="text-5xl font-extrabold text-white mb-3"
                data-testid="reviews-page-title"
              >
                Avaliações de Produtos
              </h1>
              <p className="text-xl text-pink-100">
                Gerencie as avaliações e identifique produtos que ainda aguardam feedback
              </p>
            </div>
          </div>

          {/* ════════════════════════════════════════════════════
              SEÇÃO 1 — Produtos SEM Avaliação
              Equivalente ao SQL: LEFT JOIN WHERE r.id IS NULL
              ════════════════════════════════════════════════════ */}
          <section
            className="mb-10"
            aria-labelledby="section-without-reviews-title"
          >
            {/* Cabeçalho da seção */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center border border-orange-500/40">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <h2
                  id="section-without-reviews-title"
                  className="text-xl font-bold text-white"
                  data-testid="without-reviews-section-title"
                >
                  Produtos Sem Avaliação
                </h2>
                <p className="text-slate-400 text-sm">
                  Produtos que foram vendidos mas ainda não receberam nenhuma avaliação
                </p>
              </div>

              {/* Contador de produtos aguardando */}
              {!loadingWithout && productsWithoutReviews.length > 0 && (
                <span className="ml-auto bg-orange-500/20 border border-orange-500/40 text-orange-300 px-3 py-1 rounded-full text-sm font-semibold">
                  {productsWithoutReviews.length} aguardando
                </span>
              )}
            </div>

            {/* Tabela de produtos sem avaliação */}
            <div className="bg-slate-800/90 backdrop-blur-md rounded-2xl border border-slate-700 shadow-2xl overflow-hidden">
              {loadingWithout ? (
                <div
                  className="p-12 text-center text-slate-400 flex items-center justify-center gap-3"
                  data-testid="loading-without-reviews"
                >
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Carregando produtos...
                </div>
              ) : productsWithoutReviews.length === 0 ? (
                <div
                  className="p-12 text-center"
                  data-testid="no-products-without-reviews"
                >
                  <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                  <p className="text-green-300 font-semibold text-lg mb-1">
                    Excelente! Todos os produtos vendidos já foram avaliados!
                  </p>
                  <p className="text-slate-400 text-sm">
                    Não há produtos aguardando avaliação no momento.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table
                    className="w-full text-left"
                    data-testid="without-reviews-table"
                  >
                    <thead className="bg-slate-700/50 border-b border-slate-600">
                      <tr>
                        <th className="px-5 py-3.5 text-slate-300 font-semibold text-sm">
                          Nome do Produto
                        </th>
                        <th className="px-5 py-3.5 text-slate-300 font-semibold text-sm">
                          Preço
                        </th>
                        <th className="px-5 py-3.5 text-slate-300 font-semibold text-sm">
                          Vendas
                        </th>
                        <th className="px-5 py-3.5 text-slate-300 font-semibold text-sm text-center">
                          Status
                        </th>
                        <th className="px-5 py-3.5 text-slate-300 font-semibold text-sm text-center">
                          Ação
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {productsWithoutReviews.map((product) => (
                        <tr
                          key={product.id}
                          data-testid={`without-review-row-${product.id}`}
                          className="border-b border-slate-700/60 hover:bg-slate-700/30 transition-colors"
                        >
                          {/* Nome */}
                          <td
                            className="px-5 py-3.5 text-white font-medium text-sm"
                            data-testid={`product-name-${product.id}`}
                          >
                            <div className="flex items-center gap-2">
                              <Package className="w-4 h-4 text-slate-400 shrink-0" />
                              {product.name}
                            </div>
                          </td>

                          {/* Preço */}
                          <td
                            className="px-5 py-3.5 text-green-400 font-semibold text-sm"
                            data-testid={`product-price-${product.id}`}
                          >
                            R$ {parseFloat(product.price || 0).toFixed(2)}
                          </td>

                          {/* Vendas */}
                          <td
                            className="px-5 py-3.5 text-slate-300 text-sm"
                            data-testid={`product-sales-${product.id}`}
                          >
                            <div className="flex items-center gap-1.5">
                              <TrendingUp className="w-4 h-4 text-blue-400" />
                              {product.sales_count} vendas
                            </div>
                          </td>

                          {/* Badge: Aguardando avaliação */}
                          <td className="px-5 py-3.5 text-center">
                            <span className="inline-flex items-center gap-1.5 bg-orange-500/15 border border-orange-500/40 text-orange-300 px-2.5 py-1 rounded-full text-xs font-medium">
                              <AlertTriangle className="w-3 h-3" />
                              Aguardando avaliação
                            </span>
                          </td>

                          {/* Botão: Avaliar Agora */}
                          <td className="px-5 py-3.5 text-center">
                            <button
                              onClick={() => setModalProduct(product)}
                              id={`rate-product-${product.id}`}
                              data-testid={`rate-product-${product.id}`}
                              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-4 py-2 rounded-lg text-xs font-semibold transition transform hover:scale-105 shadow-md shadow-orange-900/30 flex items-center gap-1.5 mx-auto"
                            >
                              <Star className="w-3.5 h-3.5" />
                              Avaliar Agora →
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>

          {/* ════════════════════════════════════════════════════
              SEÇÃO 2 — Todas as Avaliações Aprovadas
              ════════════════════════════════════════════════════ */}
          <section aria-labelledby="section-all-reviews-title">
            {/* Cabeçalho da seção */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/40">
                <MessageSquare className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h2
                  id="section-all-reviews-title"
                  className="text-xl font-bold text-white"
                  data-testid="all-reviews-section-title"
                >
                  Todas as Avaliações
                </h2>
                <p className="text-slate-400 text-sm">
                  Avaliações aprovadas pelos clientes
                </p>
              </div>

              {!loadingReviews && reviews.length > 0 && (
                <span className="ml-auto bg-purple-500/20 border border-purple-500/40 text-purple-300 px-3 py-1 rounded-full text-sm font-semibold">
                  {reviews.length} avaliação{reviews.length !== 1 ? 'ões' : ''}
                </span>
              )}
            </div>

            {/* Cards de avaliação */}
            {loadingReviews ? (
              <div
                className="bg-slate-800/90 backdrop-blur-md rounded-2xl border border-slate-700 p-12 text-center text-slate-400 flex items-center justify-center gap-3"
                data-testid="loading-reviews"
              >
                <Loader2 className="w-5 h-5 animate-spin" />
                Carregando avaliações...
              </div>
            ) : reviews.length === 0 ? (
              <div
                className="bg-slate-800/90 backdrop-blur-md rounded-2xl border border-slate-700 p-12 text-center"
                data-testid="no-reviews-message"
              >
                <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-lg font-medium mb-1">
                  Nenhuma avaliação ainda
                </p>
                <p className="text-slate-500 text-sm">
                  Seja o primeiro a avaliar um produto!
                </p>
              </div>
            ) : (
              <div
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
                data-testid="reviews-grid"
              >
                {reviews.map((review) => (
                  <article
                    key={review.id}
                    data-testid={`review-card-${review.id}`}
                    className="bg-slate-800/90 backdrop-blur-md border border-slate-700 rounded-xl p-5 hover:border-slate-600 hover:bg-slate-700/70 transition-all shadow-lg"
                  >
                    {/* Cabeçalho do card: produto + estrelas */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">
                          Produto
                        </p>
                        <p
                          className="text-white font-semibold text-sm truncate"
                          data-testid={`review-product-name-${review.id}`}
                        >
                          {review.products?.name || `Produto #${review.product_id}`}
                        </p>
                      </div>
                      <StarDisplay rating={review.rating} />
                    </div>

                    {/* Título da avaliação */}
                    {review.title && (
                      <p
                        className="text-white font-medium text-sm mb-2"
                        data-testid={`review-title-${review.id}`}
                      >
                        &ldquo;{review.title}&rdquo;
                      </p>
                    )}

                    {/* Comentário */}
                    <p
                      className="text-slate-300 text-sm leading-relaxed line-clamp-3 mb-3"
                      data-testid={`review-comment-${review.id}`}
                    >
                      {review.comment}
                    </p>

                    {/* Rodapé: badges + data */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-700/60">
                      <div className="flex gap-2">
                        {/* Badge: compra verificada */}
                        {review.is_verified_purchase && (
                          <span className="inline-flex items-center gap-1 bg-green-500/15 border border-green-500/30 text-green-400 px-2 py-0.5 rounded-full text-xs">
                            <CheckCircle className="w-3 h-3" />
                            Verificado
                          </span>
                        )}
                        {/* Nota numérica */}
                        <span className="inline-flex items-center gap-1 bg-amber-500/15 border border-amber-500/30 text-amber-400 px-2 py-0.5 rounded-full text-xs font-semibold">
                          <Star className="w-3 h-3 fill-amber-400" />
                          {review.rating}/5
                        </span>
                      </div>

                      {/* Data da avaliação */}
                      <span
                        className="text-slate-500 text-xs"
                        data-testid={`review-date-${review.id}`}
                      >
                        {formatDate(review.created_at)}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* ── Modal de Avaliação ── */}
      {/* Renderizado fora do container para sobrepor tudo */}
      {modalProduct && (
        <ReviewModal
          product={modalProduct}
          onClose={() => setModalProduct(null)}
          onSuccess={handleReviewSuccess}
        />
      )}
    </>
  );
}
