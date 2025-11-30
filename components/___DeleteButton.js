// components/DeleteButton.js (versão corrigida)
'use client';

export default function DeleteButton({ productId, onSuccess }) {
  const handleDelete = async () => {
    if (!confirm('Excluir produto?')) return;

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        cache: 'no-store',
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erro ao excluir');
      }

      onSuccess?.();
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700 transition"
      title="Excluir"
    >
      Delete
    </button>
  );
}