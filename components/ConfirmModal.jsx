// components/ConfirmModal.jsx
'use client';

export default function ConfirmModal({ isOpen, message, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 text-white p-6 rounded-xl shadow-2xl max-w-md w-full border border-slate-600">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span className="text-red-400 text-2xl">Warning</span> Confirmação
        </h3>
        <p className="text-slate-300 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-semibold"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}