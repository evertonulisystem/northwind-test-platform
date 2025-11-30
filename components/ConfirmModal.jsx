// components/ConfirmModal.jsx
'use client';

import { AlertTriangle } from 'lucide-react';

export default function ConfirmModal({ isOpen, message, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 text-white p-8 rounded-xl shadow-2xl max-w-sm w-full border border-slate-600">
        <h3 className="text-xl font-bold mb-6 flex items-center justify-center gap-2 text-red-500">
          <AlertTriangle className="w-7 h-7" />
          Confirmação
        </h3>

        <p className="text-slate-300 mb-8 text-center text-lg leading-relaxed">
          {message || "Tem certeza que deseja excluir este produto?"}
        </p>

        <div className="flex justify-center gap-6">
          <button
            onClick={onCancel}
            className="px-6 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition font-medium min-w-[100px]"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-bold min-w-[100px]"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}