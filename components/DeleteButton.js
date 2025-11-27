// components/DeleteButton.js
'use client';

export default function DeleteButton({ productId, onDelete }) {
  const handleDelete = async () => {
    if (!confirm('Excluir produto?')) return;

    await fetch(`/api/products/${productId}`, { method: 'DELETE' });
    onDelete?.();
  };

  return (
    <button
      onClick={handleDelete}
      className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 text-sm"
    >
      Excluir
    </button>
  );
}