
// ============================================================
// 🆕 NOVA FUNCIONALIDADE — Avaliações de Produtos
// Módulo: Reviews | Modal de Avaliação
// Adicionado em: julho/2026
// ============================================================

import { useState } from 'react';
import { Star, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

// Helper para renderizar estrelas clicáveis
function StarRating({ value, onChange, error }) {
  const [hovered, setHovered] = useState(0);
  const activeRating = hovered || value;

  return (
    <div>
      <div
        className="flex gap-2 mb-1"
        onMouseLeave={() => setHovered(0)}
        role="group"
        aria-label="Selecione uma nota de 1 a 5 estrelas"
      >
        {[1,2,3,4,5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
            aria-label={`${star} estrela${star > 1 ? 's' : ''}`}
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

        {activeRating > 0 && (
          <span className="ml-2 self-center text-amber-300 font-semibold text-sm animate-pulse">
            {activeRating === 1 ? 'Ruim' : 
             activeRating === 2 ? 'Regular' : 
             activeRating === 3 ? 'Bom' : 
             activeRating === 4 ? 'Muito Bom' : 'Excelente'}
          </span>
        )}
      </div>
      {error && (
        <p className="text-red-400 text-xs mt-1 flex items-center gap-1" role="alert">
          <XCircle className="w-3.5 h-3.5" />
          {error}
        </p>
      )}
    </div>
  );
}

export default function ReviewModal({ product, onClose, onSuccess }) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!rating || rating < 1 || rating > 5) {
      newErrors.rating = 'Selecione uma nota de 1 a 5 estrelas.';
    }
    if (!comment || comment.trim().length < 10) {
      newErrors.comment = 'O comentário deve ter ao menos 10 caracteres.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Você precisa estar logado para avaliar.');
        router.push('/');
        return;
      }

      const res = await fetch('/api/v1/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          product_id: product.id, rating, title: title.trim() || undefined, comment: comment.trim() })
      });

      if (res.status === 401) {
        localStorage.removeItem('token');
        router.push('/');
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.mensagens?.[0] || 'Erro ao enviar avaliação');
        return;
      }
      toast.success('Avaliação enviada com sucesso!');
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error('Erro de conexão ao enviar avaliação');
    } finally {
      setLoading(false);
    }
  };

  if (!product) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-[fadeInUp_0.2s_ease-out]"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">Avaliar produto</p>
            <h2 className="text-xl font-bold text-white">{product.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition rounded-lg p-1.5 hover:bg-slate-700">
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">Nota <span className="text-red-400">*</span></label>
            <StarRating
              value={rating}
              onChange={(v) => { setRating(v); errors.rating && setErrors(prev => ({ ...prev, rating: null })); }}
              error={errors.rating}
            />
          </div>
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-1.5">Título <span className="text-slate-500">(opcional)</span></label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex.: Produto incrível!"
              maxLength={120}
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-1.5">Comentário <span className="text-red-400">*</span></label>
            <textarea
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);
                if (errors.comment && e.target.value.trim().length >= 10) {
                  setErrors(prev => ({ ...prev, comment: null }));
                }}
              placeholder="Conte sua experiência com este produto..."
              rows={4}
              maxLength={1000}
              className={`w-full px-4 py-2.5 bg-slate-700 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition resize-none text-sm ${
                  errors.comment
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-slate-600 focus:ring-purple-500'
                }`}
            />
            <div className="flex justify-between mt-1">
              {errors.comment ? (
                <p className="text-red-400 text-xs" role="alert">{errors.comment}</p>
              ) : null}
              <span className={`text-xs ml-auto ${comment.length < 10 ? 'text-slate-500' : 'text-slate-400'}`}>{comment.length}/1000</span>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg font-medium text-sm">
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold text-sm transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Enviando...
                </>
              ) : (
                <>
                  <Star className="w-4 h-4" /> Enviar Avaliação
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
