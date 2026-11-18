"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function CategoryPagination({ currentPage, totalPages, totalItems, onPageChange }) {
  const [draft, setDraft] = useState(String(currentPage));

  function goToPage() {
    const value = Number(draft);
    if (!draft.trim() || !Number.isInteger(value)) {
      setDraft(String(currentPage));
      return;
    }
    const page = Math.min(totalPages, Math.max(1, value));
    setDraft(String(page));
    if (page !== currentPage) onPageChange(page);
  }

  const buttonClass = "flex items-center justify-center gap-1 rounded-xl border border-white/15 bg-slate-900/60 px-3 py-3 text-sm font-medium text-white transition hover:border-emerald-300/50 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 disabled:cursor-not-allowed disabled:opacity-35 sm:px-4";

  return (
    <nav aria-label="Paginação de categorias" className="mt-8 flex flex-col items-center justify-between gap-5 rounded-2xl border border-white/15 bg-slate-950/25 p-4 shadow-lg sm:flex-row sm:px-6">
      <div className="text-center sm:text-left">
        <p aria-live="polite" className="text-sm text-emerald-100">
          Mostrando página <strong className="text-white">{currentPage}</strong> de <strong className="text-white">{totalPages}</strong>
        </p>
        <p className="mt-1 text-xs text-emerald-200/70">{totalItems} categorias encontradas</p>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button type="button" data-testid="categories-previous-page-btn" disabled={currentPage <= 1} onClick={() => onPageChange(currentPage - 1)} className={buttonClass}>
          <ChevronLeft aria-hidden="true" className="h-4 w-4" /> Anterior
        </button>

        <form onSubmit={(event) => { event.preventDefault(); goToPage(); }} className="flex flex-col items-center gap-1">
          <label htmlFor="category-page" className="text-[10px] font-semibold uppercase tracking-wider text-emerald-200">Atual</label>
          <input
            id="category-page"
            data-testid="categories-current-page-input"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            aria-label={`Página atual, de 1 a ${totalPages}. Digite e pressione Enter para navegar.`}
            title="Digite a página e pressione Enter ou saia do campo"
            value={draft}
            onChange={(event) => { if (/^\d*$/.test(event.target.value)) setDraft(event.target.value); }}
            onBlur={goToPage}
            className="w-16 rounded-lg border border-emerald-300/50 bg-emerald-950/70 px-2 py-2 text-center text-sm font-bold tabular-nums text-white outline-none transition focus:border-emerald-200 focus:ring-2 focus:ring-emerald-300/40 sm:w-20"
          />
        </form>

        <button type="button" data-testid="categories-next-page-btn" disabled={currentPage >= totalPages} onClick={() => onPageChange(currentPage + 1)} className={buttonClass}>
          Próxima <ChevronRight aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>
    </nav>
  );
}
